// ============================================================================
// 📁 Hardware Source: src/app/access/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Access Page)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Presents access paths for founders, programs, and mentors.
// - Uses animated background and tactical CTA styling.
// ============================================================================
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  ShieldAlert, 
  Crosshair,
  Terminal,
  Activity,
  Radio
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export default function AccessPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-100 overflow-x-hidden">
      
      {/* --- ENVIRONMENT LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15" />
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-emerald-950/20" />
         {/* Radar Scan Effect */}
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_340deg,rgba(16,185,129,0.05)_360deg)] animate-[spin_10s_linear_infinite] opacity-30"></div>
      </div>

      {/* --- TOP NAV --- */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference">
        <Link href="/" className="group flex items-center gap-3 text-xs font-mono font-bold text-emerald-500 hover:text-white transition-colors">
            <div className="p-1 border border-emerald-500/50 rounded bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <ArrowLeft size={12} />
            </div>
            <span>{'/// ABORT_MISSION'}</span>
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/50 hidden sm:flex border border-emerald-500/20 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           SECURE_UPLINK_ESTABLISHED
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-8 max-w-4xl mx-auto mb-20">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md rounded-full"
            >
                <Activity size={14} className="text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-300 tracking-widest uppercase">Clearance Protocol V.2</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                Select Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-200 to-emerald-600">
                  Loadout
                </span>
            </h1>
            
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                We are NOT a generic wrapper. We are a context-aware intelligence layer grounded in real startup data.
            </p>

            {/* TACTICAL TOGGLE */}
            <div className="flex justify-center pt-8">
                <div className="bg-[#0f0f0f] border border-white/10 p-1.5 flex relative rounded-lg shadow-[0_0_40px_rgba(16,185,129,0.05)]">
                    <button 
                        onClick={() => setBillingCycle("monthly")}
                        className={`relative z-10 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-emerald-100' : 'text-slate-500 hover:text-white'}`}
                    >
                        Short-range Ops
                        <span className="block text-[8px] opacity-50 font-mono mt-1">MONTHLY</span>
                    </button>
                    <button 
                        onClick={() => setBillingCycle("yearly")}
                        className={`relative z-10 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${billingCycle === 'yearly' ? 'text-emerald-100' : 'text-slate-500 hover:text-white'}`}
                    >
                        Long-range Campaign
                        <span className="block text-[8px] opacity-50 font-mono mt-1">YEARLY (-20%)</span>
                    </button>
                    
                    {/* Sliding Background */}
                    <motion.div 
                        layout 
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-900/50 border border-emerald-500/30 rounded-md shadow-[inset_0_0_10px_rgba(16,185,129,0.2)] ${billingCycle === 'yearly' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}
                    />
                </div>
            </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            
            {/* PLAN 1: SCOUT */}
            <PricingCard 
                tier="Level 1"
                title="SCOUT"
                price="$0"
                period="/ DEPLOYMENT"
                desc="Minimal intel for testing a startup idea in the wild."
                icon={<Crosshair size={24}/>}
                features={[
                    "PIRAI Lite Core – multi-model AI tuned only for early-stage startup questions.",
                    "Basic “Startup DNA” profile with saved context for ONE startup.",
                    "Access to a curated, founder-tested intel library (no generic internet fluff).",
                    "10 guided AI sessions per month with context-aware answers.",
                    "Weekly mission recap: a short email summary of your key questions and decisions.",
                    "Read-only access to public founder playbooks."
                ]}
                cta="DEPLOY SCOUT"
                delay={0.1}
            />

            {/* PLAN 2: VANGUARD */}
            <div className="lg:-mt-8 lg:mb-8 z-20">
                <PricingCard 
                    tier="Level 2"
                    title="VANGUARD"
                    price={billingCycle === 'monthly' ? "$29" : "$24"}
                    period="/ MO"
                    desc="Kinetic capability for founders in the arena. Full brain access."
                    icon={<Zap size={24} />}
                    features={[
                        <>PIRAI Pro Core – orchestrated GPT-4 class models + specialist engines for strategy, GTM, and fundraising.</>,
                        <>Deep “Startup DNA” Context – long-term memory over your startup profile, documents, and previous chats.</>,
                        <>Answers powered by <strong className="text-emerald-400">proprietary North Road founder archive</strong> and <strong className="text-emerald-400">mentor playbooks</strong>, not generic internet content.</>,
                        <>Auto-generated assets: investor narrative outline, customer interview scripts, email templates, and experiment checklists.</>,
                        <>Priority human escalation: direct path to vetted mentors when AI detects complex or sensitive topics.</>,
                        <>Execution radar: simple tracker for your next 30–90 day missions with check-ins inside the chat.</>,
                        <>Access to private founder channels and scenario-based prompts (immigrant founders, B2B SaaS, services, etc.).</>
                    ]}
                    cta="EQUIP VANGUARD"
                    highlighted
                    delay={0.2}
                />
            </div>

            {/* PLAN 3: COMMAND */}
            <PricingCard 
                tier="Level 3"
                title="COMMAND"
                price="Custom"
                period="/ UPLINK"
                desc="Central command for programs managing multiple founder units."
                icon={<ShieldAlert size={24}/>}
                features={[
                    "Cohort-wide Oversight Dashboard",
                    "White-label Neural Persona Deployment",
                    "Custom Protocol Injection (Your Playbooks)",
                    "API Uplink for Internal Tools",
                    "Dedicated Mission Control Officer"
                ]}
                cta="CONTACT HQ"
                delay={0.3}
            />

        </div>

        {/* --- SYSTEM LOGS (FAQ) --- */}
        <section className="max-w-3xl mx-auto pt-32 pb-20">
            <div className="flex items-center gap-3 mb-8 border-b border-emerald-500/20 pb-4">
               <Terminal size={18} className="text-emerald-500" />
               <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                   /var/log/system_queries
               </h2>
            </div>
            
            <div className="grid gap-px bg-white/10 border border-white/10 overflow-hidden rounded-lg">
                <FaqItem 
                    id="01"
                    q="Why allocate budget when ChatGPT is free?" 
                    a="ChatGPT is a civilian tool. It doesn't know your burn rate, pivot history, or local laws. PIRAI is military-grade infrastructure with persistent memory of your startup's DNA."
                />
                <FaqItem 
                    id="02"
                    q="Protocol for mission failure (Cancellation)?" 
                    a="You can abort the mission anytime. No penalties. However, our directive is to lower the probability of failure. Consider this subscription as 'Anti-Death' insurance."
                />
                <FaqItem 
                    id="03"
                    q="Define 'Human Escalation' procedure." 
                    a="AI handles logic; humans handle nuance. If you encounter a Co-founder dispute or a complex Term Sheet, PIRAI flags the anomaly and routes you to a vetted human expert."
                />
            </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PricingCard({ tier, title, price, period, desc, icon, features, cta, highlighted = false, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className={`
                relative p-8 flex flex-col h-full backdrop-blur-md overflow-hidden group
                ${highlighted 
                    ? 'bg-emerald-950/30 border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.15)]' 
                    : 'bg-[#0f0f0f]/80 border border-white/10 hover:border-white/20'
                }
            `}
            style={{
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)"
            }}
        >
            {/* HUD CORNERS */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${highlighted ? 'border-emerald-500' : 'border-white/20'}`}></div>
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${highlighted ? 'border-emerald-500' : 'border-white/20'}`}></div>
            
            {highlighted && (
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_10px_#10b981]"></div>
            )}

            {/* HEADER */}
            <div className="mb-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-none border ${highlighted ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        {icon}
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${highlighted ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {tier}
                    </span>
                </div>
                <h3 className={`text-3xl font-black uppercase tracking-wider mb-2 ${highlighted ? 'text-white' : 'text-slate-200'}`}>
                    {title}
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed min-h-[40px]">
                    {desc}
                </p>
            </div>

            {/* PRICE */}
            <div className="mb-8 pb-8 border-b border-white/5 relative z-10">
                <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black tracking-tighter ${highlighted ? 'text-white' : 'text-slate-300'}`}>
                        {price}
                    </span>
                    <span className="text-slate-500 font-mono text-xs uppercase tracking-wide">
                        {period}
                    </span>
                </div>
            </div>

            {/* FEATURES */}
            <div className="space-y-4 mb-10 flex-1 relative z-10">
                {features.map((feat: React.ReactNode, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${highlighted ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></div>
                        <span className={`text-sm font-medium leading-relaxed ${highlighted ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {feat}
                        </span>
                    </div>
                ))}
            </div>

            {/* ACTION BUTTON */}
            <button className={`
                w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden
                ${highlighted 
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }
            `}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                   {highlighted && <Radio size={14} className="animate-pulse"/>}
                   {cta}
                </span>
                {/* Button Scan Effect */}
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
            </button>
        </motion.div>
    )
}

function FaqItem({ id, q, a }: { id: string, q: string, a: string }) {
    return (
        <details className="group bg-black/40 open:bg-emerald-950/10 transition-colors duration-300">
            <summary className="flex cursor-pointer items-center justify-between p-6 select-none">
                <div className="flex items-center gap-4">
                   <span className="text-xs font-mono text-slate-600 group-open:text-emerald-500">
                       [{id}]
                   </span>
                   <span className="text-sm font-bold text-slate-200 group-open:text-emerald-400 uppercase tracking-wide">
                       {q}
                   </span>
                </div>
                <div className="relative w-4 h-4">
                    <div className="absolute inset-0 bg-slate-500 w-[1px] h-full left-1/2 -translate-x-1/2 group-open:rotate-90 transition-transform"></div>
                    <div className="absolute inset-0 bg-slate-500 h-[1px] w-full top-1/2 -translate-y-1/2"></div>
                </div>
            </summary>
            <div className="px-6 pb-6 pt-0 pl-14">
                <div className="text-sm text-slate-400 leading-relaxed font-mono border-l border-emerald-500/20 pl-4 py-1">
                    <span className="text-emerald-600 mr-2">{`>>`}</span>
                    {a}
                </div>
            </div>
        </details>
    )
}
