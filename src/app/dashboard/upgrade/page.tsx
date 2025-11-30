"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UserService, UserTier } from "@/lib/user-service";
import { Check, Shield, Zap, Radio, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const TIERS = [
    {
        name: "SCOUT",
        level: "LEVEL 1",
        tagline: "Minimal intel for testing a startup idea in the wild.",
        price: "$0 / DEPLOYMENT",
        features: [
            "PIRAI Lite Core – multi-model AI tuned only for early-stage startup questions.",
            "Basic \"Startup DNA\" profile with saved context for ONE startup.",
            "Access to a curated, founder-tested intel library (no generic internet fluff).",
            "10 guided AI sessions per month with context-aware answers.",
            "Weekly mission recap: a short email summary of your key questions and decisions.",
            "Read-only access to public founder playbooks."
        ],
        buttonText: "DEPLOY SCOUT"
    },
    {
        name: "VANGUARD",
        level: "LEVEL 2",
        tagline: "Kinetic capability for founders in the arena. Full brain access.",
        price: "$29 / MO",
        features: [
            "PIRAI Pro Core – orchestrated GPT-4 class models + specialist engines for strategy, GTM, and fundraising.",
            "Deep \"Startup DNA\" Context – long-term memory over your startup profile, documents, and previous chats.",
            "Answers powered by proprietary North Road founder archive and mentor playbooks, not generic internet content.",
            "Auto-generated assets: investor narrative outline, customer interview scripts, email templates, and experiment checklists.",
            "Priority human escalation: direct path to vetted mentors when AI detects complex or sensitive topics.",
            "Execution radar: simple tracker for your next 30–90 day missions with check-ins inside the chat.",
            "Access to private founder channels and scenario-based prompts (immigrant founders, B2B SaaS, services, etc.)."
        ],
        buttonText: "EQUIP VANGUARD",
        featured: true
    },
    {
        name: "COMMAND",
        level: "LEVEL 3",
        tagline: "Central command for programs managing multiple founder units.",
        price: "Custom / UPLINK",
        features: [
            "Cohort Overwatch Dashboard – see cross-startup patterns, risky signals, and progress based on real PIRAI conversations.",
            "White-label AI mentor trained on your accelerator or university frameworks, not just North Road defaults.",
            "Custom knowledge injection from your Notion, PDFs, and internal playbooks into PIRAI's private brain.",
            "Proprietary telemetry: anonymized insight into what founders actually struggle with, far beyond what you see in demo day pitches.",
            "API and integration hooks for your CRM and internal tools (e.g., push key signals into your dealflow pipeline).",
            "Role-based access control for program managers, mentors, and external partners.",
            "Dedicated success liaison to help you encode your methods and keep your AI mentor aligned with your program."
        ],
        buttonText: "ESTABLISH UPLINK"
    }
];

export default function UpgradePage() {
    const { user, userTier, refreshUserTier } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSelectTier = async (tier: UserTier) => {
        if (!user || tier === userTier) return;

        setLoading(true);
        setMessage(null);

        try {
            await UserService.updateUserTier(user.uid, tier);
            await refreshUserTier();
            setMessage({ type: 'success', text: `Successfully upgraded to ${tier}! 🎉` });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update tier. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tierName: string) => {
        switch (tierName) {
            case "COMMAND": return "border-purple-500/50";
            case "VANGUARD": return "border-cyan-500/50";
            case "SCOUT": return "border-slate-700";
            default: return "border-slate-700";
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 text-xs text-cyan-400 font-mono mb-6"
                >
                    <Shield size={12} />
                    <span>TACTICAL OPS ACCESS</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-6">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Deployment</span>
                </h1>

                {userTier && (
                    <p className="text-slate-400 text-sm">
                        Current Tier: <span className="text-white font-bold">{userTier}</span>
                    </p>
                )}
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg text-center font-mono ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {TIERS.map((tier, idx) => {
                    const isCurrentTier = tier.name === userTier;
                    const isFeatured = tier.featured;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative flex flex-col p-8 rounded-2xl border ${isFeatured
                                ? "bg-slate-900/80 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                                : isCurrentTier
                                    ? `bg-black/40 ${getTierColor(tier.name)}`
                                    : "bg-black/40 border-slate-800 hover:border-slate-700"
                                } backdrop-blur-sm overflow-hidden`}
                        >
                            {isCurrentTier && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-green-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-bl-lg">
                                    Current
                                </div>
                            )}
                            {isFeatured && !isCurrentTier && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-bl-lg">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${isFeatured ? "text-cyan-400 border-cyan-500/30 bg-cyan-950/30" : "text-slate-500 border-slate-700 bg-slate-900"
                                    }`}>
                                    {tier.level}
                                </span>
                                <h3 className="text-2xl font-bold text-white tracking-tight mb-2 mt-2">{tier.name}</h3>
                                <p className="text-xs text-slate-400 font-mono min-h-[40px]">{tier.tagline}</p>
                            </div>

                            <div className="mb-8 pb-8 border-b border-white/5">
                                <div className="text-3xl font-bold text-white font-mono">{tier.price.split('/')[0]}</div>
                                <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">{tier.price.split('/')[1] || '/ DEPLOYMENT'}</div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <div className={`mt-1 p-0.5 rounded-full ${isFeatured ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-500"}`}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                        <span className="leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectTier(tier.name as UserTier)}
                                disabled={loading || isCurrentTier}
                                className={`w-full py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group ${isCurrentTier
                                    ? "bg-green-900/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                    : isFeatured
                                        ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-cyan-500/25"
                                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                                    } disabled:opacity-50`}
                            >
                                {isCurrentTier ? (
                                    <>
                                        <Check size={14} />
                                        ACTIVE TIER
                                    </>
                                ) : (
                                    <>
                                        {tier.buttonText}
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
