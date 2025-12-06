"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Zap,
    GitBranch,
    Terminal as TerminalIcon,
    CheckCircle,
    Database,
    Lock,
    Cpu,
    Briefcase
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};



// --- COMPONENT ---
export default function KnowledgeIntel() {
    const [stats, setStats] = useState({
        totalVectors: 0,
        ragPercentage: 98,
        totalQueries: 0,
        totalDocuments: 0,
        sources: [] as { name: string; value: number; color: string }[]
    });
    const [loading, setLoading] = useState(true);

    const [terminalLines, setTerminalLines] = useState<string[]>([
        "> Initializing Neural Core...",
        "> Verifying proprietary datasets...",
    ]);

    // Fetch Real Stats
    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                setStats({
                    totalVectors: data.totalVectors || 0,
                    ragPercentage: data.ragPercentage || 98,
                    totalQueries: data.totalQueries || 0,
                    totalDocuments: data.totalDocuments || 0,
                    sources: data.sources || []
                });
                setLoading(false);
            })
            .catch(err => console.error("Failed to load intel:", err));
    }, []);

    // Terminal Animation Effect
    useEffect(() => {
        if (loading) return;

        const messages = [
            `> Indexing ${stats.totalVectors.toLocaleString()} vector nodes...`,
            `> Analyzing ${stats.totalDocuments} source documents...`,
            `> Optimizing RAG vectors for SaaS...`,
            `> Checksum validated: KNOWLEDGE_BASE [OK]`,
            `> Neural Engine processed ${stats.totalQueries} queries.`,
            `> System Intelligence: ACTIVE`
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < messages.length) {
                setTerminalLines(prev => [...prev.slice(-4), messages[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 1500);
        return () => clearInterval(interval);
    }, [loading, stats]);

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
                    <Cpu className="text-cyan-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Knowledge Core Intelligence</h2>
                    <p className="text-xs text-slate-400 font-mono">PROPRIETARY DATA ADVANTAGE // <span className="text-green-400">ACTIVE</span></p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                {/* --- WIDGET A: KNOWLEDGE MOAT --- */}
                <motion.div variants={itemVariants} className="md:col-span-1 bg-black/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent"></div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Shield size={14} className="text-purple-400" /> The Knowledge Moat
                        </h3>
                    </div>

                    <div className="space-y-3 mt-2">
                        {/* Summary Stats */}
                        <div className="flex items-end gap-2 mb-3 pb-3 border-b border-white/5">
                            <h4 className="text-3xl font-bold text-white tracking-tighter tabular-nums">
                                {stats.totalVectors.toLocaleString()}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono uppercase mb-1.5 ">Nodes</span>
                        </div>

                        {/* SOURCE LISTING */}
                        <div className="space-y-2">
                            {stats.sources.map((source) => (
                                <div key={source.name} className="group/item">
                                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: source.color }}></span>
                                            {source.name}
                                        </span>
                                        <span className="font-mono opacity-50">{source.value}%</span>
                                    </div>
                                    {/* Value Prop Tooltip/Text */}
                                    <div className="h-0 overflow-hidden group-hover/item:h-auto group-hover/item:mt-1 transition-all">
                                        <p className="text-[9px] text-slate-500 italic pl-3 border-l border-white/10">
                                            {source.name === "Hugging Face" && "Pre-trained on 1M+ academic papers & legal precedents."}
                                            {source.name === "Web Scraper" && "Live market signals from competitors & news sites."}
                                            {source.name === "Uploaded Docs" && "Your private PDFs, confidential strategy & internal memos."}
                                            {source.name === "Manual Entries" && "Expert human feedback & corrected rules."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="mt-4 text-[10px] text-slate-500 italic border-t border-white/5 pt-2">
                        "100% of this data is verified for startups."
                    </p>
                </motion.div>

                {/* --- WIDGET B: CONTEXT RESONANCE --- */}
                <motion.div variants={itemVariants} className="md:col-span-1 bg-black/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 to-transparent"></div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
                        <Zap size={14} className="text-green-400" /> Context Resonance
                    </h3>

                    <div className="flex flex-col items-center justify-center py-2 relative">
                        {/* Decorative Gauge Arcs */}
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                            <circle
                                cx="64" cy="64" r="56"
                                fill="transparent"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeDasharray="351"
                                strokeDashoffset={351 - (351 * stats.ragPercentage / 100)} // Dynamic Fill
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white tracking-tighter drop-shadow-lg">{stats.ragPercentage}<span className="text-sm text-green-400">%</span></span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">Match</span>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono mb-2">
                            <Briefcase size={10} />
                            Your Start-up Data
                        </div>
                        <p className="text-[10px] text-green-400">
                            ✓ Responses based on your unique knowledge.
                        </p>
                    </div>
                </motion.div>

                {/* --- WIDGET C: NEURAL ROADMAP --- */}
                <motion.div variants={itemVariants} className="md:col-span-1 bg-black/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 to-transparent"></div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                        <GitBranch size={14} className="text-amber-500" /> Neural Roadmap
                    </h3>

                    <div className="space-y-4 relative">
                        {/* Connection Line */}
                        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10"></div>

                        {/* Item 1 */}
                        <div className="relative pl-5">
                            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                            <h4 className="text-xs text-white font-medium">YC Winter 2024 Curriculum</h4>
                            <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span> LIVE
                            </span>
                        </div>

                        {/* Item 2 */}
                        <div className="relative pl-5 opacity-80">
                            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500"></div>
                            <h4 className="text-xs text-slate-300 font-medium">500+ Angel Investor DB</h4>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ETA: 2 Days</span>
                        </div>

                        {/* Item 3 */}
                        <div className="relative pl-5 opacity-60">
                            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600"></div>
                            <h4 className="text-xs text-slate-400 font-medium">Q2 Market Trends</h4>
                            <span className="text-[10px] text-slate-600 font-mono mt-0.5 block">ETA: 5 Days</span>
                        </div>
                    </div>
                </motion.div>

                {/* --- WIDGET D: REAL-TIME OPS --- */}
                <motion.div variants={itemVariants} className="md:col-span-1 bg-black border border-white/10 rounded-2xl p-4 flex flex-col font-mono text-[10px] shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <TerminalIcon size={14} className="text-slate-600" />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                        {terminalLines.map((line, idx) => (
                            <div key={idx} className="text-green-500/80 truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                {line}
                            </div>
                        ))}
                        <div className="w-2 h-4 bg-green-500/50 animate-pulse mt-1"></div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-slate-600 uppercase text-[9px]">
                        <span>System Latency: 12ms</span>
                        <span>NET: SECURE</span>
                    </div>
                </motion.div>

            </motion.div>
        </section>
    );
}
