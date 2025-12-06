// ============================================================================
// 📁 Hardware Source: src/app/dashboard/arena/page.tsx
// 🕒 Date: 2025-12-04
// 🧠 Version: v8.0 (Full Features + User Guidance + DNA Enforcement)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Mandatory Briefing Modal (Explains rules & checks DNA).
// 2. Battle Log Sidebar (History).
// 3. Saves Report to DB.
// 4. Persistence (Refresh safe).
// ============================================================================

"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ARENAS } from "@/lib/arenas";
import { useAuth } from "@/context/auth-context";
import { getStartupDNA } from "@/lib/api/startup";
import { HistoryService } from "@/lib/api/history";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import {
    ArrowRight, CornerDownLeft, ShieldAlert, Loader2,
    AlertTriangle, CheckCircle2, FileText, X, History, Swords
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";


import { getApiUrl } from "@/lib/api-config";

export default function ArenaClient() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSessionId = searchParams.get("session");

    // State
    const [stage, setStage] = useState<"SELECT" | "FIGHT" | "REPORT">("SELECT");
    const [showBriefing, setShowBriefing] = useState(false); // کنترل مودال راهنما
    const [showHistory, setShowHistory] = useState(false);

    const [selectedOpponent, setSelectedOpponent] = useState<any>(ARENAS[0]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [dna, setDna] = useState<any>(null);
    const [pastBattles, setPastBattles] = useState<any[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const TURN_LIMIT = 5;

    // 1. Initial Load
    useEffect(() => {
        if (user?.uid) {
            getStartupDNA(user.uid).then(setDna);
            loadBattleHistory();

            // اگر سشن در URL بود، لود کن. اگر نه، راهنما را نشان بده
            if (urlSessionId) {
                loadSession(urlSessionId);
            } else {
                setShowBriefing(true);
            }
        }
    }, [user, urlSessionId]);

    // Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // --- DATA LOADING ---

    const loadBattleHistory = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, "users", user.uid, "sessions"),
                where("type", "==", "arena"),
                orderBy("updatedAt", "desc")
            );
            const snap = await getDocs(q);
            const battles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPastBattles(battles);
        } catch (e) {
            console.error("History load failed", e);
        }
    };

    const loadSession = async (sid: string) => {
        if (!user) return;
        setLoading(true);
        setShowBriefing(false); // وقتی سشن لود شد، راهنما بسته شود
        try {
            const msgs = await HistoryService.getSessionMessages(user.uid, sid);
            setMessages(msgs.map(m => ({ role: m.role, content: m.content })));

            const sessionDoc = await getDocs(query(collection(db, "users", user.uid, "sessions"), where("__name__", "==", sid)));
            if (!sessionDoc.empty) {
                const data = sessionDoc.docs[0].data();
                const oppName = data.title.replace("VS ", "");
                const opp = ARENAS.find(a => a.name === oppName) || ARENAS[0];
                setSelectedOpponent(opp);
                setSessionId(sid);

                if (data.report) {
                    setReport(data.report);
                    setStage("REPORT");
                } else {
                    setStage("FIGHT");
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---

    const startFight = async () => {
        if (!user) return;
        setLoading(true);
        setShowBriefing(false);

        const sid = await HistoryService.createNewSession(user.uid, "arena", `VS ${selectedOpponent.name}`);
        setSessionId(sid);
        router.push(`/dashboard/arena?session=${sid}`);

        const introMsg = `**SYSTEM_MSG:** Opponent **${selectedOpponent.name}** connected.\n\n*Scanning Target: ${dna?.name || "Unknown Startup"}...*\n\n"I've seen a thousand pitch decks. Why should I finish reading yours? Prove your worth."`;

        await HistoryService.addMessageToSession(user.uid, sid, "ai", introMsg);
        setMessages([{ role: "ai", content: introMsg }]);

        setStage("FIGHT");
        setLoading(false);
        loadBattleHistory();
    };

    const handleSend = async () => {
        if (!input.trim() || loading || !sessionId || !user) return;
        const userText = input;
        const newMessages = [...messages, { role: "user", content: userText }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        await HistoryService.addMessageToSession(user.uid, sessionId, "user", userText);

        try {
            const res = await fetch(getApiUrl("/api/arena/fight"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    opponent: selectedOpponent,
                    dna: dna,
                    history: messages,
                })
            });
            const data = await res.json();
            const aiText = data.reply || "Connection severed.";
            await HistoryService.addMessageToSession(user.uid, sessionId, "ai", aiText);
            setMessages(prev => [...prev, { role: "ai", content: aiText }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const finishFight = async () => {
        setStage("REPORT");
        setGeneratingReport(true);
        try {
            const res = await fetch(getApiUrl("/api/arena/report"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: messages, opponent: selectedOpponent, dna: dna })
            });
            const data = await res.json();
            setReport(data);

            if (user && sessionId) {
                await updateDoc(doc(db, "users", user.uid, "sessions", sessionId), {
                    report: data,
                    status: "completed"
                });
            }
            loadBattleHistory(); // Update logs status
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingReport(false);
        }
    };

    const currentTurn = Math.floor(messages.length / 2);
    const isGameOver = currentTurn >= TURN_LIMIT;

    // --- RENDER ---
    return (
        <div className="h-[calc(100vh-64px)] bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-white selection:text-black">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* 🔥🔥🔥 1. BRIEFING MODAL (راهنمای اول کار) 🔥🔥🔥 */}
            <AnimatePresence>
                {showBriefing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-xl w-full bg-[#080808] border border-white/10 p-8 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent" />

                            <div className="mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                                    <ShieldAlert className="text-red-500" /> Protocol Briefing
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    You are entering a simulation designed to break your startup logic.
                                    The AI opponents are programmed to be skeptical, not nice.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {/* وضعیت DNA */}
                                <div className={`p-4 border ${dna ? "border-green-900/30 bg-green-900/10" : "border-red-900/30 bg-red-900/10"} flex items-start gap-3`}>
                                    {dna ? <CheckCircle2 className="text-green-500 shrink-0" size={18} /> : <AlertTriangle className="text-red-500 shrink-0" size={18} />}
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${dna ? "text-green-400" : "text-red-400"}`}>
                                            {dna ? "Startup DNA Loaded" : "Missing Data Profile"}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {dna ? "The AI has access to your business context." : "WARNING: Without DNA, the AI will attack a 'generic' startup. We strongly recommend setting up your profile first."}
                                        </p>
                                        {!dna && (
                                            <Link href="/dashboard/profile" className="mt-3 inline-flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-red-500 transition">
                                                Setup DNA Now <ArrowRight size={12} />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* قوانین بازی */}
                                <div className="p-4 border border-white/10 bg-white/5 flex items-start gap-3">
                                    <FileText className="text-blue-400 shrink-0" size={18} />
                                    <div>
                                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Rules of Engagement</h4>
                                        <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc pl-4 font-mono">
                                            <li>LIMIT: You have exactly <strong>5 TURNS</strong> to defend.</li>
                                            <li>OUTPUT: You will receive a 0-100 Scorecard.</li>
                                            <li>ADVICE: Be concise. Avoid buzzwords.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBriefing(false)}
                                    className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition"
                                >
                                    {dna ? "I'm Ready - Enter Arena" : "Enter Anyway (Risky)"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 2. HISTORY SIDEBAR */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-[#0A0A0A] border-l border-white/10 z-50 p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <History size={16} /> Battle Logs
                                </h3>
                                <button onClick={() => setShowHistory(false)}><X size={18} /></button>
                            </div>
                            <div className="space-y-2 overflow-y-auto h-full pb-20">
                                {pastBattles.length === 0 && <p className="text-xs text-slate-500 font-mono">No battles recorded.</p>}
                                {pastBattles.map(battle => (
                                    <div
                                        key={battle.id}
                                        onClick={() => {
                                            router.push(`/dashboard/arena?session=${battle.id}`);
                                            setShowHistory(false);
                                        }}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all hover:bg-white/5 ${sessionId === battle.id ? "border-white bg-white/10" : "border-white/10 bg-black"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {battle.createdAt?.toDate().toLocaleDateString()}
                                            </span>
                                            {battle.report ? (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${battle.report.score > 50 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                    SCORE: {battle.report.score}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold bg-white/10 text-white px-1.5 py-0.5 rounded">IN PROGRESS</span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-200 truncate">{battle.title}</h4>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {stage === "SELECT" && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }}
                        className="flex h-full relative"
                    >
                        <button
                            onClick={() => setShowHistory(true)}
                            className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 border border-white/10 bg-black/50 backdrop-blur rounded-full text-xs font-bold uppercase hover:bg-white hover:text-black transition"
                        >
                            <History size={14} /> Logs
                        </button>

                        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 z-10">
                            <div className="mb-12">
                                <h6 className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mb-4">Select Protocol</h6>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                                    WHO WILL <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-600">BREAK YOU?</span>
                                </h1>
                            </div>
                            <div className="space-y-2">
                                {ARENAS.map((arena) => (
                                    <div
                                        key={arena.id}
                                        onMouseEnter={() => setSelectedOpponent(arena)}
                                        className="group cursor-pointer relative"
                                    >
                                        <div className={`h-[1px] w-12 bg-white/20 mb-4 transition-all duration-300 ${selectedOpponent.id === arena.id ? "w-full bg-white" : "group-hover:w-24"}`} />
                                        <h2 className={`text-3xl md:text-4xl font-bold uppercase transition-all duration-300 ${selectedOpponent.id === arena.id ? "text-white pl-4" : "text-slate-700 hover:text-slate-400"}`}>
                                            {arena.name}
                                        </h2>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:flex w-1/2 relative items-center justify-center bg-[#080808] border-l border-white/5">
                            <div className={`absolute inset-0 opacity-20 blur-[100px] transition-colors duration-700 ${selectedOpponent.bg.replace("bg-", "bg-")}`} />
                            <div className="relative z-10 max-w-sm text-center">
                                <div className={`w-64 h-64 border-[1px] border-white/20 rounded-full flex items-center justify-center relative mx-auto mb-8 ${selectedOpponent.color}`}>
                                    <selectedOpponent.icon size={80} strokeWidth={1} />
                                </div>
                                <button
                                    onClick={startFight}
                                    disabled={loading}
                                    className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs overflow-hidden w-full"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? "INITIALIZING..." : "ENTER ARENA"} <ArrowRight size={14} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {stage === "FIGHT" && (
                    <motion.div
                        key="fight"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col h-full relative"
                    >
                        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 mix-blend-difference pointer-events-none">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                                Subject: {dna?.name || "Unknown"}
                            </span>
                            <div className="flex gap-4 items-center">
                                <span className={`text-[10px] font-mono uppercase tracking-widest ${currentTurn >= TURN_LIMIT ? "text-red-500 animate-pulse" : "text-white"}`}>
                                    Round {currentTurn}/{TURN_LIMIT}
                                </span>
                                {isGameOver && (
                                    <button onClick={finishFight} className="pointer-events-auto bg-red-600 text-white px-4 py-1 text-xs font-bold uppercase hover:bg-red-500 transition shadow-[0_0_15px_red]">
                                        Analyze Result
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 md:px-[20%] py-24 space-y-12 no-scrollbar">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div className={`max-w-2xl ${msg.role === "ai" ? "text-left" : "text-right"}`}>
                                        <span className={`text-[9px] font-mono uppercase tracking-widest mb-2 block ${msg.role === "user" ? "text-slate-600" : selectedOpponent.color.replace("text-", "text-")}`}>
                                            {msg.role === "user" ? "DEFENSE" : "CHALLENGE"}
                                        </span>
                                        <div className={`leading-relaxed whitespace-pre-wrap ${msg.role === "ai" ? "text-2xl md:text-3xl font-bold text-white tracking-tight" : "text-lg text-slate-400 font-light border-l-2 border-white/20 pl-4 bg-white/5 p-4 rounded-r-xl"}`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && <div className="text-center text-xs font-mono animate-pulse text-slate-500">OPPONENT IS THINKING...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {!isGameOver ? (
                            <div className="p-6 md:p-12 w-full max-w-4xl mx-auto sticky bottom-0 z-20">
                                <div className="relative flex items-center bg-black border border-white/20 rounded-full px-6 py-2 shadow-2xl">
                                    <CornerDownLeft className="text-slate-500 mr-4" size={20} />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSend()}
                                        placeholder="Type your defense here..."
                                        className="flex-1 bg-transparent border-none outline-none text-white text-lg h-12"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 md:p-12 w-full max-w-4xl mx-auto sticky bottom-0 z-20 text-center bg-gradient-to-t from-black to-transparent pt-20">
                                <p className="text-red-500 font-mono text-xs uppercase mb-4 tracking-widest">Session Limit Reached</p>
                                <button onClick={finishFight} className="bg-white text-black px-8 py-4 font-black text-sm uppercase tracking-widest hover:scale-105 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                    GENERATE AUTOPSY REPORT
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {stage === "REPORT" && (
                    <motion.div
                        key="report"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full p-8"
                    >
                        {generatingReport ? (
                            <div className="text-center">
                                <Loader2 className="animate-spin w-12 h-12 text-white mx-auto mb-4" />
                                <h2 className="text-2xl font-bold uppercase tracking-widest">Generating Autopsy...</h2>
                                <p className="text-slate-500">Analyzing your failure points.</p>
                            </div>
                        ) : report ? (
                            <div className="max-w-2xl w-full bg-[#080808] border border-white/10 p-8 md:p-12 relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-2 ${report.score > 70 ? "bg-green-500" : report.score > 40 ? "bg-yellow-500" : "bg-red-500"}`} />
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">FINAL VERDICT</h6>
                                        <h1 className={`text-6xl font-black ${report.score > 70 ? "text-green-500" : "text-red-500"}`}>
                                            {report.score}/100
                                        </h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STATUS</div>
                                        <div className="text-xl font-bold text-white uppercase">{report.verdict}</div>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2">
                                            <ShieldAlert size={16} className="text-red-500" /> Killing Blow
                                        </h3>
                                        <p className="text-lg text-slate-300 font-light border-l-2 border-red-500/50 pl-4">"{report.killing_blow}"</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] text-slate-500 uppercase mb-2">Primary Weakness</h4>
                                            <p className="text-white font-bold">{report.weakness}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] text-slate-500 uppercase mb-2">Prescription</h4>
                                            <p className="text-sm text-slate-300">{report.prescription}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setStage("SELECT")} className="mt-12 w-full py-4 bg-white text-black font-bold uppercase text-xs hover:bg-slate-200 transition">
                                    Return to Lobby
                                </button>
                            </div>
                        ) : (
                            <div>Error generating report.</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
