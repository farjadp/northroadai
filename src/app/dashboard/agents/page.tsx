"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Microscope,
    Terminal,
    Megaphone,
    LineChart,
    Briefcase,
    Scale,
    Sparkles,
    Lock,
    Zap,
    ChevronDown,
    Box,
    Layers,
    ArrowRight,
    ShieldAlert
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";

const PROJECTS = [
    { id: "p1", name: "North Road AI", stage: "Idea Phase" },
    { id: "p2", name: "Stealth Fintech", stage: "Series A" }
];

// The 7 Guardians Data Structure - Updated for SCOUT/VANGUARD/COMMAND
const AGENTS = [
    {
        id: "validator",
        name: "The Validator",
        role: "Idea Killer / Market Sizer",
        icon: <Microscope size={24} />,
        color: "cyan",
        minTier: "SCOUT",
        limit: 50,
        desc: "Ruthless logic. Calculates TAM/SAM/SOM and runs 'The Mom Test' on your assumptions."
    },
    {
        id: "zen",
        name: "The Zen Master",
        role: "Founder Psychology",
        icon: <Sparkles size={24} />,
        color: "pink",
        minTier: "SCOUT",
        limit: 999,
        desc: "Prevents burnout. Resolves co-founder conflicts and aids in difficult decision making."
    },
    {
        id: "architect",
        name: "The Architect",
        role: "CTO / Tech Stack",
        icon: <Terminal size={24} />,
        color: "blue",
        minTier: "VANGUARD",
        limit: 200,
        desc: "Designing scalable systems. Advises on 'Build vs Buy' and estimates MVP timelines."
    },
    {
        id: "growth",
        name: "Growth Hacker",
        role: "First 1000 Users",
        icon: <Megaphone size={24} />,
        color: "orange",
        minTier: "VANGUARD",
        limit: 200,
        desc: "Aggressive GTM strategies. Drafts cold emails, ad scripts, and viral loops."
    },
    {
        id: "cfo",
        name: "The CFO",
        role: "Burn Rate & Models",
        icon: <LineChart size={24} />,
        color: "green",
        minTier: "COMMAND",
        limit: 100,
        desc: "Financial rigor. Builds forecasts, pricing strategies, and runway alerts."
    },
    {
        id: "legal",
        name: "Legal Shield",
        role: "IP & Canada SUV",
        icon: <Scale size={24} />,
        color: "purple",
        minTier: "ROCKET", // Pro
        limit: 50,
        desc: "Canadian specific. Handles incorporation, contracts, and Startup Visa compliance."
    },
    {
        id: "dealmaker",
        name: "The Deal Maker",
        role: "Fundraising Coach",
        icon: <Briefcase size={24} />,
        color: "yellow",
        minTier: "COMMAND",
        limit: 30,
        desc: "Simulates VC grillings. Reviews pitch decks and clarifies term sheet traps."
    }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function AgentArmory() {
    const { userTier } = useUserProfile();
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Helper to check access logic
    const hasAccess = (minTier: string) => {
        const tiers = ["SCOUT", "VANGUARD", "COMMAND"];
        if (!userTier) return false;
        return tiers.indexOf(userTier) >= tiers.indexOf(minTier);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-10 pb-20"
        >

            {/* --- HEADER & CONTEXT --- */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Neural Armory</h1>
                    <p className="text-slate-400 font-mono text-sm max-w-2xl">
                        Deploy specialized AI agents tailored to your startup&apos;s lifecycle.
                        Each agent accesses your &quot;Startup DNA&quot; for context-aware reasoning.
                    </p>
                </div>

                {/* Project Selector */}
                <div className="relative z-30">
                    <label className="text-[10px] font-mono text-slate-500 uppercase mb-1 block">Target Context</label>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-64 flex items-center justify-between bg-zinc-900 border border-white/10 hover:border-cyan-500/50 rounded-xl px-4 py-3 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white/5 rounded text-cyan-500 group-hover:text-cyan-400">
                                <Box size={16} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{selectedProject.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{selectedProject.stage}</div>
                            </div>
                        </div>
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                        >
                            {PROJECTS.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => { setSelectedProject(p); setIsDropdownOpen(false); }}
                                    className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                >
                                    <Layers size={14} className="text-slate-500" />
                                    <span className="text-sm text-slate-300">{p.name}</span>
                                    {selectedProject.id === p.id && <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full" />}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* --- AGENT GRID (The 7 Guardians) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {AGENTS.map((agent) => {
                    const unlocked = hasAccess(agent.minTier);
                    // Deterministic pseudo-usage based on agent id for stable render
                    const usagePercent = (agent.id.charCodeAt(0) % 50) + 10;

                    return (
                        <motion.div
                            key={agent.id}
                            variants={cardVariants}
                            className={`relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden group hover:-translate-y-1 ${unlocked
                                ? 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5 shadow-lg'
                                : 'bg-black/20 border-white/5'
                                }`}
                        >
                            {/* Locked Overlay */}
                            {!unlocked && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-[2px]">
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-full mb-3 shadow-2xl">
                                        <Lock size={20} className="text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Requires {agent.minTier}</span>
                                </div>
                            )}

                            <div className={`p-6 flex flex-col h-full relative z-10 ${!unlocked ? 'opacity-40 grayscale' : ''}`}>

                                {/* Header Icon */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl border bg-opacity-10 backdrop-blur-md 
                                ${agent.color === 'cyan' ? 'bg-cyan-500 border-cyan-500/30 text-cyan-400' : ''}
                                ${agent.color === 'blue' ? 'bg-blue-500 border-blue-500/30 text-blue-400' : ''}
                                ${agent.color === 'green' ? 'bg-green-500 border-green-500/30 text-green-400' : ''}
                                ${agent.color === 'purple' ? 'bg-purple-500 border-purple-500/30 text-purple-400' : ''}
                                ${agent.color === 'orange' ? 'bg-orange-500 border-orange-500/30 text-orange-400' : ''}
                                ${agent.color === 'yellow' ? 'bg-yellow-500 border-yellow-500/30 text-yellow-400' : ''}
                                ${agent.color === 'pink' ? 'bg-pink-500 border-pink-500/30 text-pink-400' : ''}
                            `}>
                                        {agent.icon}
                                    </div>
                                    {unlocked && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            <span className="text-[10px] font-mono text-slate-500">READY</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text Content */}
                                <div className="mb-6 flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white/90">
                                        {agent.name}
                                    </h3>
                                    <p className="text-xs font-mono text-slate-500 uppercase tracking-wide mb-3">
                                        {agent.role}
                                    </p>
                                    <p className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                                        {agent.desc}
                                    </p>
                                </div>

                                {/* Action Area */}
                                <div className="mt-auto">
                                    {unlocked ? (
                                        <Link href={`/dashboard/chat?agent=${agent.id}&project=${selectedProject.id}`}>
                                            <button className="w-full py-2.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn">
                                                INITIALIZE
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    ) : (
                                        <button disabled className="w-full py-2.5 border border-white/5 text-slate-600 rounded-lg text-xs font-bold cursor-not-allowed">
                                            LOCKED
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* --- UPSELL FOOTER --- */}
            {userTier !== "COMMAND" && (
                <motion.div
                    variants={cardVariants}
                    className="mt-12 p-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20"
                >
                    <div className="bg-[#050505] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500 border border-yellow-500/20">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Unlock the full Council</h4>
                                <p className="text-sm text-slate-400">
                                    Get access to <span className="text-white font-medium">The CFO</span>, <span className="text-white font-medium">Legal Shield</span>, and <span className="text-white font-medium">The Deal Maker</span> with the Rocket Plan.
                                </p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-purple-200 transition whitespace-nowrap">
                            Upgrade to Rocket
                        </button>
                    </div>
                </motion.div>
            )}

        </motion.div>
    );
}
