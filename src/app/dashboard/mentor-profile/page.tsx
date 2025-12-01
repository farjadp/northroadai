// ============================================================================
// 📁 Hardware Source: src/app/dashboard/mentor-profile/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0 (Overseer Mode)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - "Overseer Mode" aesthetic (Gold/Slate/Deep Black).
// - Expertise Matrix: Archetype, Tags, Anti-Patterns.
// - Signal Feed: Incoming "Uplink Requests" with Mission Briefs.
// - Ghost Mode: Availability toggle.
// ============================================================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Zap,
    Ghost,
    Briefcase,
    CheckCircle2,
    XCircle,
    Cpu,
    Target,
    AlertTriangle,
    Settings,
    Activity,
    Eye,
    EyeOff,
    Terminal
} from "lucide-react";

// --- TYPES ---
type Request = {
    id: number;
    founderName: string;
    startupName: string;
    oneLiner: string;
    matchReason: string;
    matchScore: number;
    aiContextAvailable: boolean;
    timestamp: string;
    status: "pending" | "accepted" | "declined";
};

// --- MOCK DATA ---
const INITIAL_REQUESTS: Request[] = [
    {
        id: 1,
        founderName: "Alex V.",
        startupName: "Nebula AI",
        oneLiner: "Autonomous agents for legal contract review.",
        matchReason: "They need help with [Enterprise Sales] and you are [The Exit Architect].",
        matchScore: 98,
        aiContextAvailable: true,
        timestamp: "2 mins ago",
        status: "pending"
    },
    {
        id: 2,
        founderName: "Sarah J.",
        startupName: "GreenLoop",
        oneLiner: "Circular economy marketplace for construction waste.",
        matchReason: "Strong fit for your [Marketplace Dynamics] expertise.",
        matchScore: 85,
        aiContextAvailable: true,
        timestamp: "1 hour ago",
        status: "pending"
    },
    {
        id: 3,
        founderName: "Mike T.",
        startupName: "FinFlow",
        oneLiner: "Neobank for gig workers in SE Asia.",
        matchReason: "Matches your [Fintech] tag, but hits your [Crypto] anti-pattern warning.",
        matchScore: 60,
        aiContextAvailable: false,
        timestamp: "3 hours ago",
        status: "pending"
    }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function MentorHQ() {
    // State
    const [ghostMode, setGhostMode] = useState(false);
    const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
    const [archetype, setArchetype] = useState("The Exit Architect");
    const [tags, setTags] = useState(["SaaS", "B2B", "Enterprise Sales"]);
    const [antiPatterns, setAntiPatterns] = useState(["Crypto", "Idea Stage"]);
    const [newTag, setNewTag] = useState("");
    const [newAntiPattern, setNewAntiPattern] = useState("");

    // Handlers
    const handleAction = (id: number, action: "accept" | "decline") => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: action === "accept" ? "accepted" : "declined" } : req
        ));
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newTag.trim()) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const addAntiPattern = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newAntiPattern.trim()) {
            setAntiPatterns([...antiPatterns, newAntiPattern.trim()]);
            setNewAntiPattern("");
        }
    };

    const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));
    const removeAntiPattern = (p: string) => setAntiPatterns(antiPatterns.filter(ap => ap !== p));

    return (
        <div className="min-h-screen bg-[#020202] text-slate-300 font-sans selection:bg-amber-500/20 selection:text-amber-200 pb-24">

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">

                {/* --- HEADER: OVERSEER CONSOLE --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-950/20 rounded-lg text-amber-500 border border-amber-900/50">
                                <Shield size={20} />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                                Mentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">HQ</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xl font-mono">
                            <span className="text-amber-500/80">SYSTEM STATUS:</span> {ghostMode ? "CLOAKED" : "ACTIVE"} • SIGNAL STRENGTH: 100%
                        </p>
                    </div>

                    {/* Ghost Mode Toggle */}
                    <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-right">
                            <div className="text-xs font-bold text-white uppercase tracking-wider">
                                {ghostMode ? "Ghost Mode" : "Open for Uplinks"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                                {ghostMode ? "Invisible to founders" : "Visible in grid"}
                            </div>
                        </div>
                        <button
                            onClick={() => setGhostMode(!ghostMode)}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${ghostMode ? "bg-slate-800" : "bg-amber-600"
                                }`}
                        >
                            <motion.div
                                layout
                                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${ghostMode ? "translate-x-0 bg-slate-400" : "translate-x-6"
                                    }`}
                            >
                                {ghostMode ? <EyeOff size={14} className="text-slate-900" /> : <Eye size={14} className="text-amber-700" />}
                            </motion.div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT COL: EXPERTISE MATRIX (4 cols) --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Archetype Selector */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Target size={16} className="text-amber-500" /> Archetype
                            </h3>

                            <div className="space-y-3">
                                {["The Exit Architect", "The Growth Hacker", "The Product Visionary"].map(arch => (
                                    <button
                                        key={arch}
                                        onClick={() => setArchetype(arch)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-xs font-mono ${archetype === arch
                                                ? "bg-amber-950/20 border-amber-500/50 text-amber-200"
                                                : "bg-zinc-900/30 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                                            }`}
                                    >
                                        {arch}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Industry Tags */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Briefcase size={16} className="text-amber-500" /> Capabilities
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] font-mono text-slate-300 flex items-center gap-1 group hover:border-amber-500/30 transition-colors">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-red-400"><XCircle size={10} /></button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={addTag}
                                placeholder="+ Add capability (Enter)"
                                className="w-full bg-transparent border-b border-white/10 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder:text-slate-700 font-mono"
                            />
                        </div>

                        {/* Anti-Patterns */}
                        <div className="bg-[#0a0a0a] border border-red-900/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-900/50" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-500" /> Anti-Patterns
                            </h3>
                            <p className="text-[10px] text-slate-500 mb-4">
                                Requests matching these patterns will be auto-filtered or flagged.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {antiPatterns.map(ap => (
                                    <span key={ap} className="px-2 py-1 bg-red-950/20 border border-red-900/30 rounded text-[10px] font-mono text-red-300 flex items-center gap-1">
                                        {ap}
                                        <button onClick={() => removeAntiPattern(ap)} className="hover:text-red-200"><XCircle size={10} /></button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={newAntiPattern}
                                onChange={(e) => setNewAntiPattern(e.target.value)}
                                onKeyDown={addAntiPattern}
                                placeholder="+ Add anti-pattern"
                                className="w-full bg-transparent border-b border-white/10 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 placeholder:text-slate-700 font-mono"
                            />
                        </div>

                    </div>

                    {/* --- RIGHT COL: SIGNAL FEED (8 cols) --- */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity size={20} className="text-amber-500" /> Signal Feed
                            </h2>
                            <div className="text-xs font-mono text-slate-500">
                                {requests.filter(r => r.status === "pending").length} PENDING SIGNALS
                            </div>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            <AnimatePresence>
                                {requests.filter(r => r.status === "pending").length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-20 border border-dashed border-white/10 rounded-2xl"
                                    >
                                        <Terminal size={32} className="mx-auto text-slate-700 mb-4" />
                                        <p className="text-slate-500 text-sm font-mono">NO ACTIVE SIGNALS DETECTED</p>
                                    </motion.div>
                                )}

                                {requests.filter(r => r.status === "pending").map((req) => (
                                    <motion.div
                                        key={req.id}
                                        variants={itemVariants}
                                        layout
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 relative overflow-hidden hover:border-amber-500/30 transition-all group"
                                    >
                                        {/* Match Score Indicator */}
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono font-bold ${req.matchScore >= 90
                                                    ? "bg-amber-950/30 border-amber-500/50 text-amber-400"
                                                    : req.matchScore >= 70
                                                        ? "bg-zinc-900 border-slate-700 text-slate-300"
                                                        : "bg-red-950/20 border-red-900/30 text-red-400"
                                                }`}>
                                                <Cpu size={10} /> {req.matchScore}% MATCH
                                            </div>
                                        </div>

                                        <div className="flex gap-5">
                                            {/* Avatar Placeholder */}
                                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-slate-500 font-bold text-xs border border-white/5 shrink-0">
                                                {req.founderName.substring(0, 2)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-white font-bold text-lg">{req.founderName}</h3>
                                                    <span className="text-slate-500 text-sm">from</span>
                                                    <span className="text-amber-100 font-medium">{req.startupName}</span>
                                                </div>

                                                <p className="text-slate-400 text-sm mb-3 italic">"{req.oneLiner}"</p>

                                                {/* Mission Brief */}
                                                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 mb-4">
                                                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 flex items-center gap-1">
                                                        <Target size={10} /> Mission Logic
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed">
                                                        {req.matchReason}
                                                    </p>
                                                    {req.aiContextAvailable && (
                                                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-900/30">
                                                            <Cpu size={10} /> AI Context Available
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleAction(req.id, "accept")}
                                                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                                                    >
                                                        <Zap size={14} className="fill-black" /> Initialize Uplink
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, "decline")}
                                                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white border border-white/10 rounded-lg transition text-xs font-medium"
                                                    >
                                                        Ignore Signal
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
