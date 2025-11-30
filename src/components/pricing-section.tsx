"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Radio, Lock } from "lucide-react";

const TierCard = ({ tier, delay }: { tier: any, delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={`relative flex flex-col p-8 rounded-2xl border ${tier.featured
                    ? "bg-slate-900/80 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                    : "bg-black/40 border-slate-800 hover:border-slate-700"
                } backdrop-blur-sm group overflow-hidden`}
        >
            {tier.featured && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-bl-lg">
                    Recommended
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${tier.featured ? "text-cyan-400 border-cyan-500/30 bg-cyan-950/30" : "text-slate-500 border-slate-700 bg-slate-900"
                        }`}>
                        {tier.levelLabel}
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">{tier.title}</h3>
                <p className="text-xs text-slate-400 font-mono min-h-[40px]">{tier.microTagline}</p>
            </div>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-white/5">
                <div className="text-3xl font-bold text-white font-mono">{tier.priceLabel.split('/')[0]}</div>
                <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">{tier.priceLabel.split('/')[1] || '/ DEPLOYMENT'}</div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <div className={`mt-1 p-0.5 rounded-full ${tier.featured ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-500"}`}>
                            <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Action */}
            <button className={`w-full py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${tier.featured
                    ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-cyan-500/25"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                }`}>
                {tier.buttonText}
            </button>
        </motion.div>
    );
};

export function PricingSection() {
    const tiers = [
        {
            title: "SCOUT",
            levelLabel: "LEVEL 1",
            microTagline: "Minimal intel for testing a startup idea in the wild.",
            priceLabel: "$0 / DEPLOYMENT",
            features: [
                "PIRAI Lite Core – multi-model AI tuned only for early-stage startup questions.",
                "Basic “Startup DNA” profile with saved context for ONE startup.",
                "Access to a curated, founder-tested intel library (no generic internet fluff).",
                "10 guided AI sessions per month with context-aware answers.",
                "Weekly mission recap: a short email summary of your key questions and decisions.",
                "Read-only access to public founder playbooks."
            ],
            buttonText: "DEPLOY SCOUT",
            featured: false
        },
        {
            title: "VANGUARD",
            levelLabel: "LEVEL 2",
            microTagline: "Kinetic capability for founders in the arena. Full brain access.",
            priceLabel: "$29 / MO",
            features: [
                "PIRAI Pro Core – orchestrated GPT-4 class models + specialist engines for strategy, GTM, and fundraising.",
                "Deep “Startup DNA” Context – long-term memory over your startup profile, documents, and previous chats.",
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
            title: "COMMAND",
            levelLabel: "LEVEL 3",
            microTagline: "Central command for programs managing multiple founder units.",
            priceLabel: "Custom / UPLINK",
            features: [
                "Cohort Overwatch Dashboard – see cross-startup patterns, risky signals, and progress based on real PIRAI conversations.",
                "White-label AI mentor trained on your accelerator or university frameworks, not just North Road defaults.",
                "Custom knowledge injection from your Notion, PDFs, and internal playbooks into PIRAI’s private brain.",
                "Proprietary telemetry: anonymized insight into what founders actually struggle with, far beyond what you see in demo day pitches.",
                "API and integration hooks for your CRM and internal tools (e.g., push key signals into your dealflow pipeline).",
                "Role-based access control for program managers, mentors, and external partners.",
                "Dedicated success liaison to help you encode your methods and keep your AI mentor aligned with your program."
            ],
            buttonText: "ESTABLISH UPLINK",
            featured: false
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 text-xs text-cyan-400 font-mono mb-6"
                    >
                        <Shield size={12} />
                        <span>TACTICAL OPS ACCESS</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-6"
                    >
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Deployment</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        North Road AI is an <span className="text-white font-medium">opinionated startup brain</span>, not a generic chatbot.
                        All answers are grounded in proprietary founder data, mentor-approved playbooks, and structured "Startup DNA".
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {tiers.map((tier, idx) => (
                        <TierCard key={idx} tier={tier} delay={0.3 + (idx * 0.1)} />
                    ))}
                </div>

                <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-mono text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-cyan-500" /> Proprietary startup intel
                    </div>
                    <div className="flex items-center gap-2">
                        <Radio size={14} className="text-cyan-500" /> Mentor-encoded playbooks
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock size={14} className="text-cyan-500" /> Cohort-grade telemetry
                    </div>
                </div>
            </div>
        </section>
    );
}
