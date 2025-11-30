// ============================================================================
// 📁 Hardware Source: src/app/dashboard/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.1 (Mission Control - Fixed Icons Rendering)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Fetches Startup DNA and Chat Sessions from Firestore.
// - Handles Agent Icon components correctly (LucideIcon).
// - Lists recent sessions with agent context and quick-deploy actions.
// ============================================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    // Handle Firestore Timestamp or Date object
    const d = date?.toDate ? date.toDate() : new Date(date);
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

          <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
            <h4 className="text-white font-semibold mb-3">Profile Readiness</h4>
            {dnaLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-white/10 rounded animate-pulse mt-2"></div>
              </div>
            ) : (
              renderDNAProgress()
            )}
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- SECTION 2: ACTIVE OPERATIONS --- */}
        <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-widest">
            <Target size={16} className="text-purple-500" /> Active Operations
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 animate-pulse h-32" />
              ))
            ) : sessions.length === 0 ? (
              <div className="col-span-3 p-5 bg-black/40 border border-white/10 rounded-xl text-slate-500 font-mono text-sm">
                No active operations. Start a new session to begin.
              </div>
            ) : (
              sessions.map((session) => {
                const agent = getAgentById(session.agentId);
                // ✅ اصلاح مهم: دریافت آیکون به عنوان کامپوننت
                const AgentIcon = agent?.icon || Compass; // فال‌بک به Compass اگر آیکون نبود

                return (
                  <Link key={session.id} href={`/dashboard/chat?session=${session.id}`}>
                    <div className="p-5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-500/30 hover:bg-white/5 transition-all cursor-pointer space-y-2 group">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        {/* رندر کردن کامپوننت آیکون */}
                        <div className={`${agent?.colorClass || "text-slate-500"} group-hover:scale-110 transition-transform`}>
                            <AgentIcon size={18} />
                        </div>
                        <span className="font-mono uppercase text-xs text-slate-500">{agent?.name || "Navigator"}</span>
                        <span className="ml-auto text-[10px] text-slate-600">{formatRelativeTime(session.updatedAt)}</span>
                      </div>
                      <h4 className="text-white font-semibold text-sm leading-tight line-clamp-1">
                        {session.title || session.preview || "New Chat"}
                      </h4>
                      <p className="text-slate-500 text-xs line-clamp-2">{session.preview || "Conversation in progress..."}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>

        {/* --- SECTION 3: SIGNAL FEED --- */}
        <motion.div variants={cardVariants} className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-widest">
            <TrendingUp size={16} className="text-green-500" /> Signal Feed
          </div>

          <div className="bg-zinc-900/20 border border-white/10 rounded-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              <SignalItem
                icon={<AlertCircle size={16} className="text-yellow-500 mt-1 shrink-0" />}
                title="Market Alert"
                body='2 new competitors detected in "EdTech/AI" sector in Canada.'
                time="2 HOURS AGO"
              />
              <SignalItem
                icon={<Compass size={16} className="text-cyan-500 mt-1 shrink-0" />}
                title="Opportunity"
                body="NRC IRAP grant applications are opening next week."
                time="YESTERDAY"
              />
              <SignalItem
                icon={<MessageSquare size={16} className="text-purple-500 mt-1 shrink-0" />}
                title="Community"
                body='Founder #402 replied to your question about "Incorporation".'
                time="2 DAYS AGO"
              />
            </div>
            <div className="p-2 bg-white/5 border-t border-white/5">
              <button className="w-full py-2 text-xs text-slate-500 hover:text-white transition font-mono uppercase hover:bg-white/5 rounded">
                View All Signals
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- SECTION 4: QUICK DEPLOY --- */}
      <motion.section variants={cardVariants} className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-widest">
          <CheckCircle2 size={16} className="text-cyan-500" /> Quick Deploy
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {QUICK_DEPLOY.map((id) => {
            const agent = getAgentById(id);
            // ✅ اصلاح مهم: دریافت آیکون به عنوان کامپوننت
            const AgentIcon = agent?.icon || Compass;

            return (
              <button
                key={id}
                onClick={() => handleStartSession(id)}
                disabled={creatingAgent === id || !user}
                className={`p-5 rounded-xl border border-white/10 bg-black/40 hover:border-cyan-500/30 hover:bg-white/5 transition-all text-left space-y-2 group ${
                  creatingAgent === id ? "opacity-70 cursor-wait" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${agent?.colorClass} group-hover:bg-white/10 transition-colors`}>
                      <AgentIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{agent?.name || "Navigator"}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{agent?.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 pl-1">
                  {creatingAgent === id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Creating session...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/> Start new session
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}

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