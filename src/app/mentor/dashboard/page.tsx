// ============================================================================
// 📁 Hardware Source: src/app/mentor/dashboard/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0 (Overseer Mode)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - "Overseer Mode" aesthetic (Gold/Slate/Deep Black).
// - Lists assigned founders.
// - Impact Feedback Form.
// ============================================================================

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Users,
    MessageSquare,
    ChevronRight,
    Activity,
    Terminal
} from "lucide-react";
// import { logImpactSession } from "@/app/actions/mentor-actions";
import { auth } from "@/lib/firebase";

// Mock data for founders (In real app, fetch from API/Firestore)
const MOCK_FOUNDERS = [
    {
        id: "founder-1",
        name: "Alex V.",
        startup: "Nebula AI",
        summary: "Building autonomous agents for legal contract review. Struggling with enterprise sales cycles.",
        challenges: ["Enterprise Sales", "SOC2 Compliance", "Pricing Strategy"],
        lastSession: "2 days ago"
    },
    {
        id: "founder-2",
        name: "Sarah J.",
        startup: "GreenLoop",
        summary: "Circular economy marketplace. Needs help with supply chain logistics and marketplace liquidity.",
        challenges: ["Marketplace Liquidity", "Logistics", "Fundraising"],
        lastSession: "1 week ago"
    }
];

export default function MentorDashboard() {
    const [selectedFounder, setSelectedFounder] = useState<string | null>(null);
    const [impactForm, setImpactForm] = useState({
        impactRating: false,
        confidenceBefore: 3,
        confidenceAfter: 4,
        taskFollowedUp: false,
        comment: ""
    });
    const [submitting, setSubmitting] = useState(false);

    // In a real implementation, we would fetch assigned founders here
    // const [founders, setFounders] = useState([]);
    // useEffect(() => { ... }, []);

    const handleImpactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        alert("Impact logging unavailable in offline mode.");
        /*
        if (!selectedFounder || !auth.currentUser) return;

        setSubmitting(true);
        try {
            const result = await logImpactSession(selectedFounder, {
                sessionId: "session-" + Date.now(), // Generate or pick session ID
                mentorId: auth.currentUser.uid,
                ...impactForm
            });

            if (result.success) {
                alert("Impact logged successfully!");
                setImpactForm({
                    impactRating: false,
                    confidenceBefore: 3,
                    confidenceAfter: 4,
                    taskFollowedUp: false,
                    comment: ""
                });
                setSelectedFounder(null);
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit impact log.");
        } finally {
            setSubmitting(false);
        }
        */
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-12 border-b border-white/10 pb-8">
                <div className="p-2 bg-amber-950/20 rounded-lg text-amber-500 border border-amber-900/50">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                        Overseer <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Console</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-mono">
                        ACTIVE UPLINKS: {MOCK_FOUNDERS.length} • SYSTEM STATUS: NOMINAL
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COL: FOUNDER LIST */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={16} /> Assigned Founders
                    </h2>

                    {MOCK_FOUNDERS.map(founder => (
                        <button
                            key={founder.id}
                            onClick={() => setSelectedFounder(founder.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedFounder === founder.id
                                ? "bg-amber-950/20 border-amber-500/50"
                                : "bg-[#0a0a0a] border-white/10 hover:border-amber-500/30"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-bold ${selectedFounder === founder.id ? "text-amber-200" : "text-white"}`}>
                                    {founder.name}
                                </h3>
                                <span className="text-[10px] font-mono text-slate-500 bg-zinc-900 px-2 py-1 rounded border border-white/5">
                                    {founder.startup}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                {founder.summary}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {founder.challenges.slice(0, 2).map(c => (
                                    <span key={c} className="text-[10px] px-1.5 py-0.5 bg-zinc-900 text-slate-500 rounded border border-white/5">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>

                {/* RIGHT COL: ACTION PANEL */}
                <div className="lg:col-span-8">
                    {selectedFounder ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 to-transparent" />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        Mission Control: <span className="text-amber-500">{MOCK_FOUNDERS.find(f => f.id === selectedFounder)?.startup}</span>
                                    </h2>
                                    <p className="text-slate-500 text-sm font-mono">
                                        FOUNDER: {MOCK_FOUNDERS.find(f => f.id === selectedFounder)?.name}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg border border-white/10 flex items-center gap-2 transition">
                                        <MessageSquare size={14} /> Open Comms
                                    </button>
                                </div>
                            </div>

                            {/* IMPACT FORM */}
                            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Activity size={16} className="text-amber-500" /> Log Session Impact
                                </h3>

                                <form onSubmit={handleImpactSubmit} className="space-y-6">

                                    {/* Confidence Shift */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-2 font-mono">CONFIDENCE BEFORE (1-5)</label>
                                            <input
                                                type="range" min="1" max="5"
                                                value={impactForm.confidenceBefore}
                                                onChange={e => setImpactForm({ ...impactForm, confidenceBefore: parseInt(e.target.value) })}
                                                className="w-full accent-amber-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                                                <span>LOW</span><span>HIGH</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-2 font-mono">CONFIDENCE AFTER (1-5)</label>
                                            <input
                                                type="range" min="1" max="5"
                                                value={impactForm.confidenceAfter}
                                                onChange={e => setImpactForm({ ...impactForm, confidenceAfter: parseInt(e.target.value) })}
                                                className="w-full accent-amber-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                                                <span>LOW</span><span>HIGH</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Impact Rating Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-white/5">
                                        <span className="text-sm text-slate-300">Was this session impactful?</span>
                                        <button
                                            type="button"
                                            onClick={() => setImpactForm({ ...impactForm, impactRating: !impactForm.impactRating })}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${impactForm.impactRating ? "bg-amber-600" : "bg-zinc-700"}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${impactForm.impactRating ? "translate-x-6" : "translate-x-0"}`} />
                                        </button>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono">SESSION NOTES</label>
                                        <textarea
                                            value={impactForm.comment}
                                            onChange={e => setImpactForm({ ...impactForm, comment: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 min-h-[100px]"
                                            placeholder="Key takeaways and action items..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm rounded-lg transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.2)]"
                                    >
                                        {submitting ? "TRANSMITTING..." : "SUBMIT LOG"} <ChevronRight size={16} />
                                    </button>

                                </form>
                            </div>

                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/10 rounded-2xl min-h-[400px]">
                            <Terminal size={48} className="mb-4 opacity-50" />
                            <p className="font-mono text-sm">SELECT A FOUNDER TO INITIATE UPLINK</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
