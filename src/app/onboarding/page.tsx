// ============================================================================
// 📁 Hardware Source: src/app/onboarding/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v5.0 (The Neural Uplink - Cinematic Experience)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Step 1: Protocol Acceptance (Legal/Compliance) - Gamified.
// 2. Step 2: DNA Calibration (One-screen config).
// 3. Auto-assigns 'founder' role.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveStartupDNA, StartupProfile } from "@/lib/api/startup";
import {
  ShieldCheck, Zap, Globe, Cpu, ArrowRight, Check, Lock, Activity,
  Fingerprint, ChevronRight, Terminal, Loader2
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- ANIMATION VARIANTS ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function OnboardingPage() {
  const { user, refreshUserRole } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"PROTOCOL" | "DNA">("PROTOCOL");
  const [loading, setLoading] = useState(false);

  // --- STATE ---
  const [agreements, setAgreements] = useState({
    privacy: false,
    nda: false,
    ai_risk: false
  });

  const [dna, setDna] = useState({
    name: "",
    url: "",
    stage: "Idea",
    pitch: ""
  });

  // --- HANDLERS ---

  const handleProtocolAccept = () => {
    setStep("DNA");
  };

  const handleFinalize = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Save User Core (Role + Agreements)
      await setDoc(doc(db, "users", user.uid), {
        role: "founder", // Auto-assign founder
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        onboardingVersion: "v2.0",
        termsAcceptedAt: serverTimestamp(),
        agreements: agreements,
        createdAt: serverTimestamp(), // Safe to merge
      }, { merge: true });

      // 2. Save Startup DNA
      const finalDna: Partial<StartupProfile> = {
        name: dna.name,
        url: dna.url,
        stage: dna.stage as any,
        oneLiner: dna.pitch.substring(0, 150),
        hypothesis: dna.pitch, // Using pitch as hypothesis/problem context
        updatedAt: new Date().toISOString()
      };
      await saveStartupDNA(user.uid, finalDna);

      // 3. Launch
      await refreshUserRole();

      // Fake delay for "System Boot" effect
      setTimeout(() => {
        router.push("/dashboard/chat");
      }, 1500);

    } catch (error) {
      console.error("Initialization Failed:", error);
      setLoading(false);
    }
  };

  // --- RENDERERS ---

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative flex flex-col items-center justify-center">

      {/* 🌌 DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-3xl z-10 px-6">

        {/* PROGRESS HEADER */}
        <div className="flex items-center justify-between mb-12 opacity-80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase">North Road</h3>
              <p className="text-[10px] text-cyan-400 font-mono">SYSTEM INITIALIZATION</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === "PROTOCOL" ? "bg-cyan-500" : "bg-cyan-900"}`}></div>
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === "DNA" ? "bg-purple-500" : "bg-white/10"}`}></div>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* --- STEP 1: LEGAL PROTOCOL --- */}
          {step === "PROTOCOL" && (
            <motion.div
              key="protocol"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <motion.div variants={fadeUp} className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Establish <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Secure Uplink</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  To access the neural core, you must accept the operational protocols. This ensures data integrity and legal compliance.
                </p>
              </motion.div>

              <div className="grid gap-4">
                {[
                  { id: "privacy", icon: Lock, title: "Data Privacy Protocol", desc: "Your data is encrypted. We do not sell your IP to third parties." },
                  { id: "nda", icon: ShieldCheck, title: "Mutual NDA & SLA", desc: "Confidentiality agreement regarding platform assets and uptime guarantees." },
                  { id: "ai_risk", icon: Zap, title: "AI Reliability Waiver", desc: "PIRAI is an assistant, not a lawyer. Verify critical outputs." }
                ].map((item) => (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    onClick={() => setAgreements({ ...agreements, [item.id]: !agreements[item.id as keyof typeof agreements] })}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${agreements[item.id as keyof typeof agreements]
                      ? "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                  >
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`p-3 rounded-full transition-colors ${agreements[item.id as keyof typeof agreements] ? "bg-cyan-500 text-black" : "bg-white/10 text-slate-400"
                        }`}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-bold text-lg ${agreements[item.id as keyof typeof agreements] ? "text-cyan-400" : "text-white"}`}>
                            {item.title}
                          </h3>
                          {agreements[item.id as keyof typeof agreements] && <Check size={18} className="text-cyan-400" />}
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                variants={fadeUp}
                onClick={handleProtocolAccept}
                disabled={!Object.values(agreements).every(Boolean)}
                className="w-full py-5 rounded-2xl font-bold text-lg tracking-wide uppercase transition-all flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 bg-white text-black hover:bg-cyan-400 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
              >
                Initialize Protocol <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* --- STEP 2: DNA CALIBRATION --- */}
          {step === "DNA" && (
            <motion.div
              key="dna"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeUp} className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Startup <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Genome</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  Calibrate the AI with your venture's core metrics. Precision matters.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full pointer-events-none"></div>

                <div className="grid gap-6">

                  {/* INPUTS ROW */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-purple-400 uppercase ml-1">Entity Name</label>
                      <div className="relative group">
                        <Activity className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                          type="text"
                          value={dna.name}
                          onChange={(e) => setDna({ ...dna, name: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all focus:bg-purple-900/10 placeholder:text-slate-600"
                          placeholder="e.g. Nexus Dynamics"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-purple-400 uppercase ml-1">Digital Coordinates</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                          type="text"
                          value={dna.url}
                          onChange={(e) => setDna({ ...dna, url: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all focus:bg-purple-900/10 placeholder:text-slate-600"
                          placeholder="nexus.com (Optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STAGE SELECTOR */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-purple-400 uppercase ml-1">Evolutionary Stage</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Idea', 'MVP', 'Growth'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setDna({ ...dna, stage: s })}
                          className={`py-3 rounded-xl text-sm font-bold border transition-all relative overflow-hidden group ${dna.stage === s
                            ? "bg-purple-600/20 border-purple-500 text-purple-300"
                            : "bg-black/50 border-white/10 text-slate-500 hover:border-white/20 hover:text-white"
                            }`}
                        >
                          {dna.stage === s && <motion.div layoutId="activeStage" className="absolute inset-0 bg-purple-500/10" />}
                          <span className="relative z-10">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PITCH AREA */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-purple-400 uppercase ml-1 flex justify-between">
                      <span>Core Directive (Pitch)</span>
                      <span className="text-[10px] text-slate-600">{dna.pitch.length}/150 chars optimized</span>
                    </label>
                    <div className="relative group">
                      <Terminal className="absolute left-4 top-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                      <textarea
                        value={dna.pitch}
                        onChange={(e) => setDna({ ...dna, pitch: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all focus:bg-purple-900/10 placeholder:text-slate-600 min-h-[120px] resize-none leading-relaxed"
                        placeholder="Describe your mission. Example: An AI platform that helps immigrant founders navigate the visa process using predictive analytics..."
                      />
                    </div>
                  </div>

                </div>
              </motion.div>

              <motion.button
                variants={fadeUp}
                onClick={handleFinalize}
                disabled={loading || !dna.name}
                className="w-full py-5 rounded-2xl font-bold text-lg tracking-wide uppercase transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> SYNCHRONIZING CORE...
                  </>
                ) : (
                  <>
                    <Fingerprint size={24} /> ACTIVATE NEURAL LINK
                  </>
                )}
              </motion.button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}