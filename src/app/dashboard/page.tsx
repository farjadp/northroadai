// ============================================================================
// 📁 Hardware Source: src/app/dashboard/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.3 (Full Integrity + Crash Protection)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Full preservation of UI components (Header, Signals, Quick Deploy).
// - Safe Date handling for Firestore timestamps.
// - Safe Icon rendering for Lucide components.
// ============================================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BrainStats from "@/components/BrainStats";
import KnowledgeIntel from "@/components/dashboard/KnowledgeIntel";

import {
  Compass,
  MessageSquare,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStartupDNA, StartupProfile } from "@/lib/api/startup";
import { HistoryService, ChatSession, getUserSessions } from "@/lib/api/history";
import { calculateProfileScore } from "@/lib/profile-score";
import { AGENTS, getAgentById } from "@/lib/agents";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const QUICK_DEPLOY = ["navigator", "builder", "ledger", "rainmaker"] as const;

export default function MissionControl() {
  const { user, loading: authLoading, userTier } = useAuth();
  const router = useRouter();

  const [dna, setDna] = useState<StartupProfile | null>(null);
  const [dnaLoading, setDnaLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [creatingAgent, setCreatingAgent] = useState<string | null>(null);

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good Morning" : currentTime < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.displayName?.split(" ")[0] || "Founder";

  useEffect(() => {
    if (!user) return;
    setDnaLoading(true);
    getStartupDNA(user.uid)
      .then((data) => setDna(data))
      .finally(() => setDnaLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSessionsLoading(true);
    getUserSessions(user.uid)
      .then((data) => setSessions(data.slice(0, 3)))
      .finally(() => setSessionsLoading(false));
  }, [user]);

  const { score: dnaScore } = useMemo(() => calculateProfileScore(dna), [dna]);

  const handleStartSession = async (agentId: string) => {
    if (!user) return;
    setCreatingAgent(agentId);
    try {
      const agentName = getAgentById(agentId)?.name || "Navigator";
      const sessionId = await HistoryService.createNewSession(user.uid, agentId, `New session with ${agentName}`);
      router.push(`/dashboard/chat?session=${sessionId}`);
    } catch (err) {
      console.error("Failed to create session", err);
      alert("Failed to start session. Please try again.");
    } finally {
      setCreatingAgent(null);
    }
  };

  const formatRelativeTime = (date: any) => {
    // 🛡️ Safety Check: If date is missing, don't crash
    if (!date) return "Just now";

    // Handle Firestore Timestamp or Date object
    const d = date?.toDate ? date.toDate() : new Date(date);

    // Invalid Date Check
    if (isNaN(d.getTime())) return "Just now";

    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTierBadgeColor = (tier: string | null) => {
    switch (tier) {
      case "COMMAND":
        return "bg-purple-900/20 text-purple-400 border-purple-500/30";
      case "VANGUARD":
        return "bg-cyan-900/20 text-cyan-400 border-cyan-500/30";
      case "SCOUT":
        return "bg-slate-800 text-slate-400 border-slate-700";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const renderDNAProgress = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400 font-mono">DNA Integrity</span>
        <span className="text-white font-semibold">{dnaScore}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-cyan-500 transition-all duration-500"
          style={{ width: `${dnaScore}%` }}
        />
      </div>
      {dnaScore < 100 && (
        <Link href="/dashboard/profile">
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-wide border border-cyan-500/40 text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition">
            Complete Profile
          </button>
        </Link>
      )}
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

      {/* --- SECTION 1: HEADER --- */}
      <motion.section variants={cardVariants} className="relative">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6">
          <div>
            {authLoading ? (
              <div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse mb-2"></div>
            ) : (
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{firstName}.</span>
              </h1>
            )}

            <p className="text-slate-400 font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Intelligence is ACTIVE. Market volatility is low.
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            {userTier && (
              <Link href="/dashboard/upgrade">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide cursor-pointer hover:scale-105 transition-transform ${getTierBadgeColor(
                    userTier
                  )}`}
                >
                  <Compass size={12} />
                  <span>{userTier}</span>
                </div>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-slate-400 font-mono">
              <Clock size={12} />
              <span>SESSION LOG: {sessions.length} active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Card */}
          <div className="lg:col-span-2 group relative bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-white/10 rounded-2xl p-1 overflow-hidden hover:border-cyan-500/30 transition-all duration-500">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="p-4 bg-cyan-500/10 rounded-full text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Zap size={32} />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-xl font-bold text-white">Unlock your next milestone</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Keep your DNA updated so PIRAI can generate precise playbooks for your next 90 days.
                </p>
              </div>
              <Link href="/dashboard/chat">
                <button className="whitespace-nowrap px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-cyan-400 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-white/5">
                  Start Session <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- SECTION 2: QUICK DEPLOY (ACTION DECK) --- */}
      <motion.section variants={cardVariants} className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-widest">
          <Zap size={16} className="text-yellow-500" /> Quick Deploy
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {QUICK_DEPLOY.map((id) => {
            const agent = getAgentById(id);
            const AgentIcon = agent?.icon || Compass;

            return (
              <button
                key={id}
                onClick={() => handleStartSession(id)}
                disabled={creatingAgent === id || !user}
                className={`p-5 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-cyan-500/30 hover:bg-white/10 transition-all text-left space-y-3 group relative overflow-hidden ${creatingAgent === id ? "opacity-70 cursor-wait" : "cursor-pointer"
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_100%] animate-shimmer" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`p-2 rounded-lg bg-white/5 ${agent?.colorClass} group-hover:bg-white/10 transition-colors shadow-lg`}>
                    <AgentIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold tracking-tight">{agent?.name || "Navigator"}</h4>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{agent?.role}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5em] relative z-10">{agent?.description}</p>

                <div className="flex items-center gap-2 text-[10px] text-cyan-500/80 font-mono pt-2 border-t border-white/5 relative z-10">
                  {creatingAgent === id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> INITIALIZING...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /> INITIALIZE
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* --- SECTION 3: OPERATIONAL GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COL: ACTIVE OPERATIONS */}
        <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-widest">
            <Target size={16} className="text-purple-500" /> Active Operations
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 animate-pulse h-32" />
              ))
            ) : sessions.length === 0 ? (
              <div className="col-span-2 p-8 bg-black/40 border border-white/10 rounded-xl text-center">
                <div className="inline-flex p-3 rounded-full bg-white/5 text-slate-500 mb-3"><Compass size={24} /></div>
                <p className="text-slate-400 font-medium">No active operations.</p>
                <p className="text-sm text-slate-600">Select an agent above to start a session.</p>
              </div>
            ) : (
              sessions.map((session) => {
                const agent = getAgentById(session.agentId);
                const AgentIcon = agent?.icon || Compass;

                return (
                  <Link key={session.id} href={`/dashboard/chat?session=${session.id}`}>
                    <div className="p-5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-500/30 hover:bg-white/5 transition-all cursor-pointer space-y-3 group h-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <div className={`${agent?.colorClass || "text-slate-500"} group-hover:scale-110 transition-transform`}>
                            <AgentIcon size={16} />
                          </div>
                          <span className="font-mono uppercase text-[10px] text-slate-500">{agent?.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono bg-white/5 px-1.5 py-0.5 rounded">{formatRelativeTime(session.updatedAt)}</span>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold text-sm leading-tight line-clamp-1 mb-1 group-hover:text-cyan-400 transition-colors">
                          {session.title || session.preview || "New Chat"}
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2">{session.preview || "Conversation in progress..."}</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}

            {/* View All Button */}
            {sessions.length > 0 && (
              <Link href="/dashboard/chat" className="col-span-full md:col-start-2">
                <button className="w-full h-full min-h-[60px] flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-all group">
                  VIEW ALL SESSIONS <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* RIGHT COL: CONTEXT STACK */}
        <motion.div variants={cardVariants} className="space-y-8">
          {/* DNA STATS */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-green-500" /> Start-up DNA
            </h4>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              {dnaLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/10 rounded animate-pulse"></div>
                  <div className="h-8 w-32 bg-white/10 rounded animate-pulse mt-2"></div>
                </div>
              ) : (
                renderDNAProgress()
              )}
            </div>
          </div>

          {/* SIGNAL FEED */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" /> Signal Feed
            </h4>
            <div className="bg-zinc-900/20 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="divide-y divide-white/5">
                <SignalItem
                  icon={<AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />}
                  title="Market Alert"
                  body='2 new competitors detected in "EdTech".'
                  time="2H AGO"
                />
                <SignalItem
                  icon={<Compass size={14} className="text-cyan-500 mt-0.5 shrink-0" />}
                  title="Opp"
                  body="NRC IRAP grant applications opening."
                  time="1D AGO"
                />
                <SignalItem
                  icon={<MessageSquare size={14} className="text-purple-500 mt-0.5 shrink-0" />}
                  title="Community"
                  body='Founder #402 replied to your post.'
                  time="2D AGO"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- SECTION 4: KNOWLEDGE INTEL --- */}
      <div className="pt-4 border-t border-white/5">
        <KnowledgeIntel />
      </div>

    </motion.div>
  );
}

// --- HELPER COMPONENT ---
function SignalItem({ icon, title, body, time }: { icon: React.ReactNode; title: string; body: string; time: string }) {
  return (
    <div className="p-4 hover:bg-white/5 transition cursor-default">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="text-xs text-slate-300 mb-1 leading-relaxed">
            <span className="text-white font-bold">{title}:</span> {body}
          </p>
          <span className="text-[10px] text-slate-600 font-mono">{time}</span>
        </div>
      </div>
    </div>
  );
}