// ============================================================================
// 📁 Hardware Source: src/app/manifesto/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Manifesto Page)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Renders North Road Manifesto statements and closing CTA.
// - Uses tactical styling with back navigation.
// ============================================================================
"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Quote, 
  Zap, 
  Users, 
  BrainCircuit, 
  Maximize2, 
  GitMerge, 
  TrendingUp 
} from "lucide-react";

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-black via-black to-purple-950/20 pointer-events-none" />

      {/* --- NAV --- */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black to-transparent pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-white transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            RETURN TO BASE
        </Link>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 space-y-24">
        
        {/* --- HEADER --- */}
        <header className="relative text-center md:text-left">
           {/* Abstract Decoration */}
           <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

           <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-950/10 backdrop-blur-md">
             <Quote size={14} className="text-purple-400" />
             <span className="text-xs font-mono text-purple-300 uppercase tracking-widest">Core Beliefs</span>
           </div>

           <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight leading-[0.9]">
             The Founder's <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Oath.</span>
           </h1>
           
           <p className="mt-8 text-xl text-slate-400 max-w-2xl leading-relaxed">
             The startup world does not need more noise. It needs clear thinking, honest feedback, and tools that respect the brutal reality of building something new.
           </p>
        </header>


        {/* --- THE MANIFESTO GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <ManifestoCard 
             number="01"
             title="Founders deserve real support, not slogans."
             text="We are not here to hype you for five minutes. We help you make decisions that survive the next five months."
             icon={<Zap className="text-yellow-400"/>}
          />
          
          <ManifestoCard 
             number="02"
             title="Mentorship should not be a luxury."
             text="Good advice shouldn't depend on luck or networking. PIRAI gives every founder structured guidance, 24/7."
             icon={<Users className="text-blue-400"/>}
          />

          <ManifestoCard 
             number="03"
             title="AI must be grounded in reality."
             text="We don't treat AI as a magic box. Our models are trained on real startup patterns, failures, and pivots."
             icon={<BrainCircuit className="text-purple-400"/>}
          />

          <ManifestoCard 
             number="04"
             title="Clarity beats complexity."
             text="If an answer makes things more confusing, it is a bad answer. We aim for simple steps and honest priorities."
             icon={<Maximize2 className="text-green-400"/>}
          />

          <ManifestoCard 
             number="05"
             title="Hybrid is the future."
             text="AI won't replace human mentors. The strongest support system is hybrid: AI for speed, humans for wisdom."
             icon={<GitMerge className="text-pink-400"/>}
          />

          <ManifestoCard 
             number="06"
             title="Progress over perfection."
             text="We help you make the next good decision, not the perfect one. Start small, move forward, then improve."
             icon={<TrendingUp className="text-cyan-400"/>}
          />

        </section>


        {/* --- FOOTER STATEMENT --- */}
        <footer className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                "If you are honest about your limits <br/> and serious about your journey, you are in the right place."
            </h3>
            
            <div className="flex justify-center items-center gap-4">
                <div className="h-px w-12 bg-slate-700"></div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    NORTH ROAD AI TEAM
                </p>
                <div className="h-px w-12 bg-slate-700"></div>
            </div>
        </footer>

      </main>
    </div>
  );
}

// --- SUB-COMPONENT ---

function ManifestoCard({ number, title, text, icon }: { number: string, title: string, text: string, icon: React.ReactNode }) {
    return (
        <div className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
            
            {/* Hover Glow */}
            <div className="absolute top-0 right-0 p-20 bg-purple-500/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-4xl font-bold text-white/5 font-mono group-hover:text-purple-500/20 transition-colors">
                    {number}
                </span>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-purple-500/30 transition-colors">
                    {icon}
                </div>
            </div>
            
            <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-purple-100 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {text}
                </p>
            </div>
        </div>
    )
}
