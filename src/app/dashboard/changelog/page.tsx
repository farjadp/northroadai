// ============================================================================
// 📁 Hardware Source: src/app/dashboard/changelog/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Displays the evolutionary timeline of the North Road AI platform.
// Auto-generated based on committed "Hardware Source" headers.
// ============================================================================

"use client";

import React from "react";
import { GitCommit, Sparkles, Shield, Zap, Database, Hammer, Bug } from "lucide-react";
import { motion } from "framer-motion";

const VERSIONS = [
    {
        version: "v18.0",
        date: "2025-12-05",
        title: "Self-Healing Chat API",
        description: "Implemented robust error handling for the Chat API. If a file attachment fails (403/404), the system now auto-retries with a text-only prompt to prevent crashes. Added strict JSON parsing for source metadata.",
        icon: Bug,
        tags: ["Fix", "Stability", "Backend"]
    },
    {
        version: "v5.0",
        date: "2025-12-05",
        title: "Source Confidence & Transparency",
        description: "Added a 'Confidence Score' to every AI response. Users can now see if an answer is derived from the Knowledge Base (Verified) or general AI knowledge. Added metadata tracking for token usage.",
        icon: Shield,
        tags: ["Feature", "Trust", "UI"]
    },
    {
        version: "v4.0",
        date: "2025-12-04",
        title: "Dashboard & Arena Layout",
        description: "Launched the comprehensive Founder Dashboard layout. Integrated 'The Arena' for competitive pitch practice and standardized the sidebar navigation.",
        icon: Sparkles,
        tags: ["UI", "Navigation"]
    },
    {
        version: "v3.0",
        date: "2025-11-30",
        title: "Billing & Strict Agent Boundaries",
        description: "Implemented the Multi-Agent System (Navigator, Builder, Ledger, Counsel, Rainmaker). Enforced strict topic strictness per agent. Added Billing foundation and limits.",
        icon: Zap,
        tags: ["Core", "Business Logic"]
    },
    {
        version: "v2.0",
        date: "2025-11-20",
        title: "Vector Knowledge Base",
        description: "Integrated Firestore Vector Search. Uploaded documents are now embedded and retrievable via RAG (Retrieval Augmented Generation).",
        icon: Database,
        tags: ["AI", "RAG"]
    },
    {
        version: "v1.0",
        date: "2025-11-01",
        title: "Project Genesis",
        description: "Initial Alpha Release. Core tech stack established: Next.js 15, Tailwind, Gemini 1.5 Pro, Firebase.",
        icon: Hammer,
        tags: ["Init"]
    }
];

export default function ChangelogPage() {
    return (
        <div className="max-w-4xl mx-auto min-h-screen text-slate-300 p-8">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    <GitCommit className="text-cyan-400" size={32} />
                    System Changelog
                </h1>
                <p className="text-slate-400">
                    Track the evolution of the North Road AI Neural Core.
                </p>
            </div>

            <div className="relative border-l border-white/10 ml-4 space-y-12">
                {VERSIONS.map((v, i) => (
                    <motion.div
                        key={v.version}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pl-8"
                    >
                        {/* Timeline Node */}
                        <div className="absolute -left-[18px] top-1 w-9 h-9 bg-[#050505] border border-white/20 rounded-full flex items-center justify-center">
                            <v.icon size={16} className="text-cyan-400" />
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:bg-white/[0.05] transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-white font-mono">{v.version}</span>
                                    <span className="text-xs text-slate-500 font-mono py-1 px-2 bg-white/5 rounded-full border border-white/5">
                                        {v.date}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {v.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold text-cyan-500/80 bg-cyan-950/30 px-2 py-0.5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-200 mb-2">{v.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {v.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center mt-12 text-xs text-slate-600 font-mono">
                End of Transmission.
            </div>
        </div>
    );
}
