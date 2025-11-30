// ============================================================================
// 📁 Hardware Source: src/app/about/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.1 (About Page)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Renders multi-section About content with CTA buttons.
// - Uses TopNav and tactical glass styling.
// ============================================================================
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TopNav } from "@/components/top-nav";
import { SiteFooter } from "@/components/site-footer"; // اضافه کردن فوتر
import { 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  Users, 
  Rocket, 
  ShieldCheck, 
  Zap,
  Target,
  MessageSquare,
  Layers
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden">
      
      <TopNav translucent className="fixed top-0 left-0 right-0 z-50" />
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-black to-black pointer-events-none fixed" />
      
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-32 md:pb-28 space-y-20">
        
        {/* --- HERO HEADER --- */}
        <header className="space-y-6 text-center md:text-left relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">Mission Brief</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            We build the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Neural Compass</span> for Founders.
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            North Road AI combines the raw speed of Artificial Intelligence with the deep wisdom of human mentorship. No fluff, just clarity.
          </p>
        </header>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* --- SECTION 1: WHO WE ARE (Image Left) --- */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 group">
                <Image 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" 
                    alt="Cyberpunk City" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs font-mono text-cyan-400 mb-2">ORIGIN STORY</p>
                    <h3 className="text-xl font-bold text-white">Born from the Chaos.</h3>
                </div>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Who We Are</h2>
                <p className="text-slate-300 leading-relaxed">
                    We are founders and mentors ourselves. We have seen how many good ideas die, not because the idea is bad, but because the founders do not get the right support at the right time.
                </p>
                <div className="space-y-4">
                    <CheckItem text="Based in Canada, serving global founders." />
                    <CheckItem text="Building for the 99% of founders, not just the unicorn hunters." />
                    <CheckItem text="Bridging the gap between messy ideas and executed reality." />
                </div>
            </div>
        </section>

        {/* --- SECTION 2: WHAT WE DO (Bento Grid) --- */}
        <section>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">What We Do</h2>
                <p className="text-slate-400 max-w-2xl">We give every founder a "thinking partner" that never sleeps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-cyan-500/30 transition-colors relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-12 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-colors"></div>
                    <BrainCircuit className="w-10 h-10 text-cyan-400 mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">PIRAI Workspace</h3>
                    <p className="text-slate-400 mb-6">A centralized brain for your startup. Ask questions about validation, pricing, and fundraising and get structured, data-backed answers instantly.</p>
                    <ul className="grid grid-cols-2 gap-2">
                        <li className="text-xs font-mono text-slate-500 flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full"></div> INSTANT ANSWERS</li>
                        <li className="text-xs font-mono text-slate-500 flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full"></div> STRATEGY DECKS</li>
                    </ul>
                </div>

                {/* Card 2 */}
                <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-purple-500/30 transition-colors relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-12 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-colors"></div>
                    <Users className="w-10 h-10 text-purple-400 mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Human Loop</h3>
                    <p className="text-slate-400 text-sm">AI handles the logic, Humans handle the nuance. We connect you to real mentors when the stakes are high.</p>
                </div>
            </div>
        </section>

        {/* --- SECTION 3: WHO WE SERVE (Cards with Images) --- */}
        <section>
             <h2 className="text-3xl font-bold text-white mb-8 text-center md:text-left">Who We Serve</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <PersonaCard 
                    image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop"
                    icon={<Rocket size={20}/>}
                    title="The Founders"
                    desc="Solo founders, immigrants, and dreamers working on SaaS or tech. You need clarity, not generic advice."
                />
                <PersonaCard 
                    image="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop"
                    icon={<Layers size={20}/>}
                    title="Accelerators"
                    desc="Programs that want to scale mentorship without burning out their best mentors. Get visibility into your cohort."
                />
                <PersonaCard 
                    image="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop"
                    icon={<MessageSquare size={20}/>}
                    title="Mentors"
                    desc="Capture your knowledge into AI frameworks. Spend time on high-leverage strategy, not repeating basics."
                />
             </div>
        </section>

        {/* --- SECTION 4: PRINCIPLES --- */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">Our Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <PrincipleItem 
                    icon={<Target className="text-red-400"/>} 
                    title="Founder First" 
                    text="We design around the chaotic reality of early-stage founders. Limited time, limited money, high pressure."
                />
                <PrincipleItem 
                    icon={<Zap className="text-yellow-400"/>} 
                    title="Honest Guidance" 
                    text="We prefer direct, clear advice over empty motivation. If a metric looks bad, PIRAI will tell you."
                />
                <PrincipleItem 
                    icon={<ShieldCheck className="text-green-400"/>} 
                    title="Privacy & Respect" 
                    text="A founder's data is their story. We treat your IP and strategy with extreme care and boundaries."
                />
            </div>
        </section>

        {/* --- CTA SECTION --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-950 to-black p-12 text-center">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
             <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-4xl font-bold text-white tracking-tight">Ready to upgrade your journey?</h2>
                <p className="text-slate-300 text-lg">
                    Give your startup the brain it deserves. Start for free today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-cyan-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Start Free with PIRAI
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                    <a
                        href="mailto:hello@northroad.ai"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
                    >
                        Book a Demo
                    </a>
                </div>
             </div>
        </div>

      </main>

      {/* اضافه کردن فوتر به انتهای صفحه */}
      <SiteFooter />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <span className="text-slate-400 text-sm">{text}</span>
        </div>
    );
}

function PersonaCard({ image, icon, title, desc }: any) {
    return (
        <div className="group relative h-[320px] rounded-2xl overflow-hidden border border-white/10">
            <Image src={image} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
                <div className="mb-3 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 transform">
                    {desc}
                </p>
            </div>
        </div>
    )
}

function PrincipleItem({ icon, title, text }: any) {
    return (
        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
            </div>
        </div>
    )
}
