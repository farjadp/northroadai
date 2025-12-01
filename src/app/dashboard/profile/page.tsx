// src/app/dashboard/profile/page.tsx
// ============================================================================
// 📁 Hardware Source: src/app/dashboard/profile/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v3.0 (Adaptive Genome Editor)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Adaptive Profile form based on Startup Stage (Idea, MVP, Growth).
// - Gamified "Neural Synchronization" score.
// - Founder Archetype selection.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Terminal,
    TrendingUp,
    Lightbulb,
    Dna,
    Save,
    AlertCircle,
    CheckCircle2,
    Binary,
    Scan,
    Cpu
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
// فرض بر این است که فایل lib/api/startup دارید، اگر ندارید از همان روش مستقیم فایربیس که قبلا داشتیم استفاده کنید
// فعلا برای اطمینان از کارکرد، ایمپورت‌های مستقیم فایربیس را نگه میدارم
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Types ---
type Stage = "Idea" | "MVP" | "Growth";
type Archetype = "Hacker" | "Hustler" | "Visionary";

export interface StartupProfile {
    name?: string;
    oneLiner?: string;
    problem?: string;
    targetAudience?: string;
    hypothesis?: string;
    launchDate?: string;
    earlyUsers?: string;
    feedback?: string;
    mrr?: string;
    burnRate?: string;
    cac?: string;
    runway?: string;
    northStarBlocker?: string;
    stage?: string;
    archetype?: string;
}

// --- Components ---

const StageSelector = ({ currentStage, setStage }: { currentStage: Stage, setStage: (s: Stage) => void }) => {
    const stages: Stage[] = ["Idea", "MVP", "Growth"];

    return (
        <div className="relative w-full border-t border-b border-teal-900/30 bg-black/40 backdrop-blur-sm mb-12">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50 animate-pulse" />

            <div className="flex justify-between items-center max-w-3xl mx-auto">
                {stages.map((stage, index) => {
                    const isActive = currentStage === stage;
                    return (
                        <button
                            key={stage}
                            onClick={() => setStage(stage)}
                            className="group relative px-8 py-6 flex flex-col items-center justify-center focus:outline-none"
                        >
                            {index !== stages.length - 1 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-teal-900/30 -z-10 translate-x-[50%]" />
                            )}

                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isActive
                                    ? "border-teal-400 bg-teal-950 shadow-[0_0_15px_rgba(45,212,191,0.6)] scale-125"
                                    : "border-teal-900 bg-black group-hover:border-teal-700"
                                }`}>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
                            </div>

                            <span className={`mt-3 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-teal-400 font-bold" : "text-teal-900 group-hover:text-teal-700"
                                }`}>
                                {stage}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ArchetypeCard = ({
    type,
    selected,
    onSelect,
    icon: Icon,
    desc,
    subtitle
}: {
    type: Archetype,
    selected: boolean,
    onSelect: () => void,
    icon: any,
    desc: string,
    subtitle: string
}) => (
    <div
        onClick={onSelect}
        className={`cursor-pointer relative overflow-hidden transition-all duration-500 p-1 group ${selected ? "opacity-100" : "opacity-60 hover:opacity-80"
            }`}
    >
        <div className={`absolute inset-0 border transition-all duration-300 ${selected
                ? "border-teal-500 bg-teal-950/10 shadow-[inset_0_0_20px_rgba(45,212,191,0.1)]"
                : "border-teal-900/30 bg-transparent group-hover:border-teal-800"
            }`} />

        {selected && (
            <div className="absolute top-0 right-0 p-1 bg-teal-500 text-black">
                <CheckCircle2 size={10} />
            </div>
        )}

        <div className="relative z-10 p-4 flex flex-col items-center text-center gap-2">
            <div className={`p-3 rounded-full border transition-all duration-300 ${selected
                    ? "bg-teal-500/10 border-teal-500 text-teal-400"
                    : "bg-black border-teal-900 text-teal-900"
                }`}>
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className={`font-mono text-sm uppercase tracking-widest mb-1 ${selected ? "text-white" : "text-slate-500"}`}>
                    {type}
                </h3>
                <p className="text-[9px] text-teal-600 font-bold uppercase tracking-wide mb-1">{subtitle}</p>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed max-w-[200px] mx-auto opacity-80">
                    {desc}
                </p>
            </div>
        </div>

        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-current text-teal-800" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-current text-teal-800" />
    </div>
);

const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    textarea = false
}: {
    label: string,
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    type?: string,
    textarea?: boolean
}) => (
    <div className="group relative mb-6">
        <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-teal-700 tracking-widest mb-2 group-focus-within:text-teal-400 transition-colors">
            <Binary size={12} /> {label}
        </label>

        <div className="relative">
            {textarea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full bg-black border border-teal-900/30 px-4 py-3 text-sm text-teal-50 placeholder:text-teal-900/30 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all font-sans resize-none leading-relaxed"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-black border border-teal-900/30 px-4 py-3 text-sm text-teal-50 placeholder:text-teal-900/30 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all font-sans"
                />
            )}

            <div className="absolute right-2 top-3 w-1.5 h-1.5 bg-teal-500/20 group-focus-within:bg-teal-500 group-focus-within:animate-pulse rounded-full transition-colors" />
        </div>
    </div>
);

const CalibrationBar = ({ score }: { score: number }) => {
    return (
        <div className="mb-12 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
            <div className="w-12 h-12 border border-teal-900/50 bg-black flex items-center justify-center relative overflow-hidden">
                <Dna size={24} className={`text-teal-500 ${score < 100 ? "animate-spin-slow" : ""}`} />
                <div className="absolute inset-0 bg-teal-500/10 h-[10%] animate-scan" />
            </div>

            <div className="relative h-10 bg-black border border-teal-900/30 flex items-center px-1 overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(20,184,166,0.1)_4px,rgba(20,184,166,0.1)_5px)]" />

                <motion.div
                    className="h-6 bg-teal-500/20 border-r-2 border-teal-400 relative z-10"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: "anticipate" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-teal-500/30" />
                </motion.div>

                <div className="absolute right-4 text-[10px] font-mono text-teal-500 z-20">
                    AI_CALIBRATION_STATUS
                </div>
            </div>

            <div className="text-right w-16">
                <span className="block text-2xl font-black text-white font-mono leading-none">{score}</span>
                <span className="text-[9px] text-teal-700 font-mono tracking-widest">%</span>
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [stage, setStage] = useState<Stage>("Idea");
    const [archetype, setArchetype] = useState<Archetype | undefined>(undefined);
    const [formData, setFormData] = useState<Partial<StartupProfile>>({});

    // Load Data
    useEffect(() => {
        if (!user?.uid) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "users", user.uid, "profile", "dna");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData(data);
                    if (data.stage) setStage(data.stage as Stage);
                    if (data.archetype) setArchetype(data.archetype as Archetype);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };

        loadData();
    }, [user]);

    const handleChange = (field: keyof StartupProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculateScore = () => {
        let score = 0;
        if (formData.name) score += 10;
        if (formData.oneLiner) score += 10;
        if (archetype) score += 15;
        if (formData.northStarBlocker) score += 15;

        if (stage === "Idea") {
            if (formData.problem) score += 15;
            if (formData.targetAudience) score += 15;
            if (formData.hypothesis) score += 20;
        } else if (stage === "MVP") {
            if (formData.launchDate) score += 15;
            if (formData.earlyUsers) score += 15;
            if (formData.feedback) score += 20;
        } else {
            if (formData.mrr) score += 10;
            if (formData.burnRate) score += 10;
            if (formData.cac) score += 10;
            if (formData.runway) score += 20;
        }

        return Math.min(100, score);
    };

    const handleSave = async () => {
        if (!user?.uid) return;
        setSaving(true);

        const dataToSave: Partial<StartupProfile> = {
            ...formData,
            stage,
            archetype,
        };

        try {
            await setDoc(doc(db, "users", user.uid, "profile", "dna"), {
                ...dataToSave,
                updatedAt: new Date()
            });
            await setDoc(doc(db, "users", user.uid), {
                context: `Startup: ${formData.name}, Stage: ${stage}, Archetype: ${archetype}`
            }, { merge: true });
        } catch (e) { console.error(e); }
        setTimeout(() => setSaving(false), 800);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-teal-500 font-mono">
                <div className="flex flex-col items-center gap-4">
                    <Scan className="animate-spin" size={32} />
                    <p className="tracking-[0.5em] text-xs uppercase text-teal-700">Accessing Genome Database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-teal-500/20 selection:text-teal-200 pb-24 overflow-x-hidden">

            {/* --- Background --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black" />
            </div>

            <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10">

                {/* --- Header --- */}
                <div className="flex justify-between items-end mb-16 border-b border-teal-900/20 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-2 w-2 bg-teal-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-mono text-teal-800 uppercase tracking-widest">System Online</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
                            Startup <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-700">DNA</span>
                        </h1>
                    </div>
                    <div className="hidden sm:block text-right">
                        <div className="font-mono text-[10px] text-teal-900">REF_CODE</div>
                        <div className="font-mono text-lg text-teal-700">GEN-2042</div>
                    </div>
                </div>

                {/* --- Main Content --- */}
                <CalibrationBar score={calculateScore()} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* LEFT COLUMN: Data Entry */}
                    <div className="lg:col-span-8">
                        <StageSelector currentStage={stage} setStage={setStage} />

                        {/* Identity Module */}
                        <div className="mb-12">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-teal-500" /> Identity Core
                            </h3>
                            <div className="grid gap-2">
                                <InputField
                                    label="Startup Name"
                                    placeholder="What do you call this project?"
                                    value={formData.name || ""}
                                    onChange={(v) => handleChange("name", v)}
                                />
                                <InputField
                                    label="The One-Liner"
                                    placeholder="e.g. Uber for Dog Walking in Canada"
                                    value={formData.oneLiner || ""}
                                    onChange={(v) => handleChange("oneLiner", v)}
                                />
                            </div>
                        </div>

                        {/* Metrics Module */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1 h-4 bg-teal-500" /> Phase Metrics: {stage}
                            </h3>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stage}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-teal-950/5 border border-teal-900/20 p-6 relative"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-teal-700" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-teal-700" />

                                    {stage === "Idea" && (
                                        <div className="space-y-6">
                                            <InputField
                                                label="The Core Problem"
                                                placeholder="What specific pain point are you solving?"
                                                value={formData.problem || ""}
                                                onChange={(v) => handleChange("problem", v)}
                                                textarea
                                            />
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="Target Audience"
                                                    placeholder="Who suffers the most from this?"
                                                    value={formData.targetAudience || ""}
                                                    onChange={(v) => handleChange("targetAudience", v)}
                                                />
                                                <InputField
                                                    label="The Big Bet (Hypothesis)"
                                                    placeholder="If we build X, then Y will happen..."
                                                    value={formData.hypothesis || ""}
                                                    onChange={(v) => handleChange("hypothesis", v)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {stage === "MVP" && (
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="Target Launch Date"
                                                    type="date"
                                                    placeholder="YYYY-MM-DD"
                                                    value={formData.launchDate || ""}
                                                    onChange={(v) => handleChange("launchDate", v)}
                                                />
                                                <InputField
                                                    label="Waitlist / Active Users"
                                                    placeholder="e.g. 50 beta testers"
                                                    value={formData.earlyUsers || ""}
                                                    onChange={(v) => handleChange("earlyUsers", v)}
                                                />
                                            </div>
                                            <InputField
                                                label="Early Feedback"
                                                placeholder="What are they saying? (Quotes are good)"
                                                value={formData.feedback || ""}
                                                onChange={(v) => handleChange("feedback", v)}
                                                textarea
                                            />
                                        </div>
                                    )}

                                    {stage === "Growth" && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField label="Monthly Revenue (MRR)" placeholder="$0.00" value={formData.mrr || ""} onChange={(v) => handleChange("mrr", v)} />
                                            <InputField label="Burn Rate (Cost/Month)" placeholder="$0.00" value={formData.burnRate || ""} onChange={(v) => handleChange("burnRate", v)} />
                                            <InputField label="CAC (Cost per Customer)" placeholder="$0.00" value={formData.cac || ""} onChange={(v) => handleChange("cac", v)} />
                                            <InputField label="Runway (Months Left)" placeholder="e.g. 12" value={formData.runway || ""} onChange={(v) => handleChange("runway", v)} />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-12">

                        {/* Archetype Selector */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex justify-between">
                                Founder Archetype
                                <Cpu size={14} />
                            </h3>
                            <div className="grid gap-4">
                                <ArchetypeCard
                                    type="Hacker"
                                    subtitle="The Builder"
                                    desc="Tech-first. Focused on shipping code."
                                    icon={Terminal}
                                    selected={archetype === "Hacker"}
                                    onSelect={() => setArchetype("Hacker")}
                                />
                                <ArchetypeCard
                                    type="Hustler"
                                    subtitle="The Dealmaker"
                                    desc="Sales-first. Focused on growth & networking."
                                    icon={TrendingUp}
                                    selected={archetype === "Hustler"}
                                    onSelect={() => setArchetype("Hustler")}
                                />
                                <ArchetypeCard
                                    type="Visionary"
                                    subtitle="The Architect"
                                    desc="Product-first. Focused on design & strategy."
                                    icon={Lightbulb}
                                    selected={archetype === "Visionary"}
                                    onSelect={() => setArchetype("Visionary")}
                                />
                            </div>
                        </div>

                        {/* Blocker Input */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex justify-between">
                                Current Bottleneck
                                <AlertCircle size={14} className="text-red-500" />
                            </h3>
                            <div className="border border-red-900/30 bg-red-950/5 p-4 relative">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-red-900/50" />
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-900/50" />
                                <InputField
                                    label="Main Blocker"
                                    placeholder="What's stopping you right now?"
                                    value={formData.northStarBlocker || ""}
                                    onChange={(v) => handleChange("northStarBlocker", v)}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Controls */}
                <div className="fixed bottom-0 left-0 w-full border-t border-teal-900/30 bg-black/80 backdrop-blur-md p-6 z-50">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4 text-[10px] font-mono text-teal-800 uppercase">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-900" />
                                Status: Ready
                            </div>
                            <div className="hidden sm:block">|</div>
                            <div className="hidden sm:block">Encrypted: AES-256</div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group relative bg-teal-500 hover:bg-teal-400 text-black px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {saving ? "Processing..." : "Update DNA"}
                                {!saving && <Save size={14} />}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
