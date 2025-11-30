// ============================================================================
// 📁 Hardware Source: src/app/protocol/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Protocol Page)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Presents The North Road Protocol (founder workflow and rules).
// - Uses existing layout/styling with tactical aesthetic.
// ============================================================================
"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  Terminal, 
  GitCommit, 
  ArrowLeft, 
  Cpu, 
  Search, 
  Activity, 
  Scale, 
  Users 
} from "lucide-react";

// (اگر کامپوننت TopNav را دارید آن را ایمپورت کنید، وگرنه من دکمه بازگشت گذاشتم)
// import { TopNav } from "@/components/top-nav"; 

export default function ProtocolPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-cyan-950/20 via-black to-black pointer-events-none" />
      
      {/* --- TOP NAVIGATION (BACK BUTTON) --- */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black to-transparent pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            BACK TO HOME
        </Link>
        <div className="hidden md:block text-[10px] font-mono text-cyan-500/50 border border-cyan-500/20 px-2 py-1 rounded">
            DOC_VERSION: v1.0.4
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-20">
        
        {/* --- HEADER --- */}
        <header className="space-y-6 relative">
          {/* Glowing Orb Effect */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex items-center gap-3">
             <Terminal size={20} className="text-cyan-500" />
             <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">System Protocol</p>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            The North Road <br/> <span className="text-slate-500">Operating System.</span>
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl border-l-2 border-cyan-500/30 pl-6">
            We treat every founder's time as a non-renewable resource. 
            This protocol defines the logic gates and decision trees we use to support founders, mentors, and programs.
          </p>
        </header>

        {/* --- SECTION 1: EXECUTION FLOW (Timeline) --- */}
        <section className="space-y-10">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
             <h2 className="text-2xl font-bold text-white">Execution Logic</h2>
             <span className="text-xs font-mono text-slate-600">HOW WE WORK</span>
          </div>
          
          <div className="relative space-y-0 pl-4">
            {/* Connecting Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-cyan-500/50 via-white/10 to-transparent"></div>

            <StepItem
              icon={<Search size={18} />}
              title="Input & Context"
              text="We start from your data. Before answering, PIRAI ingests your startup profile, stage constraints, and 90-day goals."
            />
            <StepItem
              icon={<Activity size={18} />}
              title="Root Cause Diagnosis"
              text="Founders ask about symptoms ('I need ads'). We diagnose the disease ('You have no product-market fit yet')."
            />
            <StepItem
              icon={<GitCommit size={18} />}
              title="Actionable Output"
              text="No theory. We output specific, atomic tasks. Every advice ends with a clear 'Next Step'."
            />
            <StepItem
              icon={<Scale size={18} />}
              title="Trade-off Analysis"
              text="We don't sell magic. We explain the trade-offs (Speed vs Quality, Equity vs Cash) so you decide with open eyes."
            />
             <StepItem
              icon={<Users size={18} />}
              title="Human Escalation"
              text="For high-stakes decisions (Co-founder disputes, Term sheets), the protocol routes you to a human expert."
              isLast
            />
          </div>
        </section>

        {/* --- SECTION 2: RULES OF ENGAGEMENT (Grid) --- */}
        <section className="space-y-10">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
             <h2 className="text-2xl font-bold text-white">Kernel Rules</h2>
             <span className="text-xs font-mono text-slate-600">CORE VALUES</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RuleCard 
                title="Founder-First Architecture" 
                text="Your progress metrics matter more than our engagement metrics. We optimize for your survival, not your time-on-site."
                icon={<Cpu className="text-purple-400"/>}
            />
            <RuleCard 
                title="No False Certainty" 
                text="If the data is ambiguous, we say 'I don't know'. We prefer calling out risks over generating hallucinated confidence." 
                icon={<Activity className="text-yellow-400"/>}
            />
            <RuleCard 
                title="Context-Awareness" 
                text="Generic advice kills startups. Every output is modulated by your specific industry, stage, and geography." 
                icon={<Terminal className="text-blue-400"/>}
            />
            <RuleCard 
                title="Sovereign Data" 
                text="Your IP is your edge. We protect it with enterprise-grade isolation. We don't train our public models on your private secrets." 
                icon={<ShieldCheck className="text-green-400"/>}
            />
          </div>
        </section>

        {/* --- FOOTER SIGNATURE --- */}
        <footer className="pt-20 text-center md:text-left">
            <div className="inline-block">
                <p className="text-[10px] font-mono text-slate-600 mb-2">SIGNED BY</p>
                <div className="text-2xl font-serif italic text-slate-400">The North Road Team</div>
                <div className="h-0.5 w-full bg-cyan-900 mt-2"></div>
            </div>
        </footer>

      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StepItem({ icon, title, text, isLast }: { icon: React.ReactNode; title: string; text: string, isLast?: boolean }) {
  return (
    <div className="relative flex gap-6 pb-12 group">
      {/* Icon Circle */}
      <div className={`
        relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
        bg-[#0a0a0a] border border-white/10 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]
      `}>
        <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
            {icon}
        </div>
      </div>

      {/* Text Content */}
      <div className="pt-1">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
          {text}
        </p>
      </div>
    </div>
  );
}

function RuleCard({ title, text, icon }: { title: string; text: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
      <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg border border-white/5 group-hover:border-white/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-white font-bold mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed border-l border-white/10 pl-3">
        {text}
      </p>
    </div>
  );
}
