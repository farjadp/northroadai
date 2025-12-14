'use client';

import React, { useState } from 'react';
import {
    Compass,
    Hammer,
    CircleDollarSign,
    Scale,
    Zap,
    CheckCircle,
    Menu,
    Terminal,
    ChevronRight,
    Copy,
    Check
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function localCn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function BrandBookPage() {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* Toast Notification */}
            <div className={localCn(
                "fixed top-24 right-6 z-50 bg-neutral-900 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 transition-all duration-300 transform",
                copiedText ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
            )}>
                <Check className="w-4 h-4" />
                <span className="text-sm font-bold">Copied to clipboard</span>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Logo Icon */}
                        <div className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center bg-cyan-900/10">
                            <div className="text-cyan-400 font-bold text-xs leading-none">NR</div>
                        </div>
                        <span className="font-bold tracking-tight text-white">NORTH ROAD AI</span>
                        <span className="text-xs text-slate-500 border border-slate-800 rounded px-2 py-0.5 ml-2">BRAND BOOK v1.0</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
                        <button onClick={() => scrollToSection('1-brand-story')} className="hover:text-cyan-400 transition">Story</button>
                        <button onClick={() => scrollToSection('2-visual-identity')} className="hover:text-cyan-400 transition">Visuals</button>
                        <button onClick={() => scrollToSection('3-color-system')} className="hover:text-cyan-400 transition">Colors</button>
                        <button onClick={() => scrollToSection('5-agent-system')} className="hover:text-cyan-400 transition">Agents</button>
                        <button onClick={() => scrollToSection('6-design-elements')} className="hover:text-cyan-400 transition">Design</button>
                    </div>

                    <button className="md:hidden">
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden" id="1-brand-story">
                {/* Ferrofluid Background */}
                <div className="ferrofluid-blob top-[10%] left-[20%] opacity-40"></div>
                <div className="ferrofluid-blob top-[40%] right-[10%] opacity-40 animation-delay-2000"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-2 text-cyan-400 mb-6">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-sm font-mono uppercase tracking-widest">Official Brand Guidelines</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tightest text-white leading-none mb-8">
                            DIGITAL<br />
                            NERVE CENTER
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl">
                            Every founder, regardless of background or budget, deserves access to world-class expertise. We make this possible with AI.
                        </p>
                    </div>
                </div>
            </section>

            {/* 1. Brand Story */}
            <section className="py-24 border-t border-white/5 bg-neutral-950/50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <span className="text-cyan-500">01.</span>
                                Brand Story
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-xl font-bold text-white mb-4">North Star</h3>
                                <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 bg-cyan-950/10 mb-8 italic text-lg text-cyan-100/80">
                                    "Every founder, regardless of background or budget, deserves access to world-class expertise. We make this possible with AI."
                                </blockquote>

                                <h3 className="text-xl font-bold text-white mb-4">Brand Personality</h3>
                                <ul className="space-y-3 text-slate-400 mb-8">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 shrink-0" />
                                        <span>A <strong>Seasoned CTO</strong> who has launched 3 startups</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 shrink-0" />
                                        <span>35 years old, energetic, honest, no fluff</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 shrink-0" />
                                        <span>Motto: <strong>"Ship fast, break things, learn faster"</strong></span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass-card-dark p-8 rounded-xl relative overflow-hidden group">
                                <div className="shimmer"></div>
                                <h3 className="text-xl font-bold text-white mb-6">Core Values</h3>
                                <div className="space-y-4">
                                    {[
                                        { title: "Democratization of Knowledge", desc: "Access for everyone, not just the wealthy" },
                                        { title: "Expertise > Generalism", desc: "5 specialists are better than 1 generalist" },
                                        { title: "Speed > Perfection", desc: "MVP is better than a perfect product that never launches" },
                                        { title: "Transparency > Fluff", desc: "The hard truth is better than a sweet lie" },
                                        { title: "Action > Theory", desc: "Actionable frameworks, not just chat" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition">
                                            <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-mono text-sm">0{i + 1}</div>
                                            <div>
                                                <h4 className="font-bold text-white">{item.title}</h4>
                                                <p className="text-sm text-slate-500">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Visual Identity */}
            <section id="2-visual-identity" className="py-24 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-cyan-500">02.</span>
                        Visual Identity
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Logo Showcase */}
                        <div className="space-y-8">
                            <div className="bg-black border border-white/10 rounded-2xl p-12 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-cyan-500/30 transition-all" onClick={() => copyToClipboard('North Road AI Logo Asset')}>
                                {/* Horizontal Grid Lines */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                                {/* Constructed Logo Representation */}
                                <div className="relative z-10 text-center transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="text-6xl font-black tracking-tighter text-white mb-2 flex items-center justify-center gap-4">
                                        <div className="w-16 h-16 border-4 border-cyan-500 rounded-lg flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                            <div className="text-4xl text-cyan-500 font-mono font-bold">NR</div>
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_#22D3EE]"></div>
                                        </div>
                                        <span>NORTH ROAD</span>
                                    </div>
                                    <div className="text-xl tracking-[0.3em] text-cyan-500 font-bold uppercase">Artificial Intelligence</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-8 rounded-xl flex items-center justify-center group cursor-pointer" onClick={() => copyToClipboard('Dark Logo Version')}>
                                    <h3 className="text-black font-black text-2xl tracking-tighter group-hover:scale-105 transition-transform">NORTH ROAD</h3>
                                </div>
                                <div className="bg-cyan-500 p-8 rounded-xl flex items-center justify-center group cursor-pointer" onClick={() => copyToClipboard('Light Logo Version')}>
                                    <h3 className="text-black font-black text-2xl tracking-tighter group-hover:scale-105 transition-transform">NORTH ROAD</h3>
                                </div>
                            </div>
                        </div>

                        {/* Construction & Spacing */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Clear Space & Construction</h3>
                                <p className="text-slate-400 mb-6">Logo must have at least 20% of its height as clear space on all sides.</p>
                            </div>

                            <div className="bg-neutral-900/50 p-8 rounded-xl border border-white/5 font-mono text-sm text-cyan-300 relative group">
                                <button className="absolute top-4 right-4 text-slate-500 hover:text-white transition opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard('const minWidth = "120px";\nconst safeZone = height * 0.2;')}>
                                    <Copy className="w-4 h-4" />
                                </button>
                                <div className="mb-4 text-slate-500">// Logo Clear Space Rule</div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-purple-400">const</span>
                                        <span className="text-yellow-400">minWidth</span>
                                        <span className="text-white">=</span>
                                        <span className="text-green-400">"120px"</span>;
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-purple-400">const</span>
                                        <span className="text-yellow-400">safeZone</span>
                                        <span className="text-white">=</span>
                                        <span className="text-green-400">height * 0.2</span>;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Color System */}
            <section id="3-color-system" className="py-24 border-t border-white/5 bg-neutral-950/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-cyan-500">03.</span>
                        Color System
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Cyan Neon", hex: "#06B6D4", class: "bg-[#06B6D4]", role: "Primary / Brand" },
                            { name: "Cyan Bright", hex: "#22D3EE", class: "bg-[#22D3EE]", role: "Hover State" },
                            { name: "Purple Deep", hex: "#7C3AED", class: "bg-[#7C3AED]", role: "Accent" },
                            { name: "Black Pure", hex: "#000000", class: "bg-[#000000] border border-white/10", role: "Background" },
                        ].map((color, i) => (
                            <div key={i} className="group cursor-pointer" onClick={() => copyToClipboard(color.hex)}>
                                <div className={localCn("h-32 rounded-xl mb-4 shadow-lg transition-transform group-hover:-translate-y-1 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]", color.class)}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
                                        <Copy className="w-6 h-6 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{color.name}</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <code className="text-xs text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{color.hex}</code>
                                    <span className="text-xs text-slate-400">{color.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-xl font-bold text-white mt-16 mb-8">Agent Color System</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { name: "Navigator", color: "#10B981", class: "bg-emerald-500" },
                            { name: "Builder", color: "#3B82F6", class: "bg-blue-500" },
                            { name: "Ledger", color: "#F59E0B", class: "bg-amber-500" },
                            { name: "Counsel", color: "#A855F7", class: "bg-purple-500" },
                            { name: "Rainmaker", color: "#F43F5E", class: "bg-rose-500" },
                        ].map((agent, i) => (
                            <div key={i} className="text-center p-4 rounded-xl glass-card-dark hover:bg-white/5 transition cursor-pointer group" onClick={() => copyToClipboard(agent.color)}>
                                <div className={localCn("w-12 h-12 rounded-full mx-auto mb-3 shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all group-hover:scale-110", agent.class)} style={{ boxShadow: `0 0 20px ${agent.color}40` }}></div>
                                <div className="font-bold text-sm text-white mb-1 group-hover:text-cyan-400 transition">{agent.name}</div>
                                <code className="text-[10px] text-slate-500 group-hover:text-slate-300">{agent.color}</code>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Agent System */}
            <section id="5-agent-system" className="py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-cyan-500">05.</span>
                        AI Agent System
                    </h2>

                    <div className="grid gap-12">
                        {[
                            {
                                id: "navigator",
                                name: "Navigator",
                                role: "Strategy Leader",
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10",
                                border: "border-emerald-500/20",
                                icon: Compass,
                                desc: "Empathetic but brutally honest. Acts like a YC partner.",
                                quote: "Does this idea fit the market? What validation did you do? Did 10 people pay?"
                            },
                            {
                                id: "builder",
                                name: "Builder",
                                role: "Product Leader",
                                color: "text-blue-400",
                                bg: "bg-blue-500/10",
                                border: "border-blue-500/20",
                                icon: Hammer,
                                desc: "Technical, practical, obsessed with speed. Focused on MVP.",
                                quote: "You don't need complex AI for an MVP. Launch next week."
                            },
                            {
                                id: "ledger",
                                name: "Ledger",
                                role: "Finance Leader",
                                color: "text-amber-400",
                                bg: "bg-amber-500/10",
                                border: "border-amber-500/20",
                                icon: CircleDollarSign,
                                desc: "Analytical, cautious, precise. Fundraising expert.",
                                quote: "With $50K burn rate and $200K in the bank, you only have 4 months runway."
                            },
                            {
                                id: "counsel",
                                name: "Counsel",
                                role: "Legal Leader",
                                color: "text-purple-400",
                                bg: "bg-purple-500/10",
                                border: "border-purple-500/20",
                                icon: Scale,
                                desc: "Formal, cautious, protective. Cites specific laws.",
                                quote: "⚠️ This is educational guidance, not legal advice."
                            },
                            {
                                id: "rainmaker",
                                name: "Rainmaker",
                                role: "Growth Leader",
                                color: "text-rose-400",
                                bg: "bg-rose-500/10",
                                border: "border-rose-500/20",
                                icon: Zap,
                                desc: "Aggressive, energetic, results-oriented. GTM expert.",
                                quote: "Your landing page has a 2% conversion rate? It needs to be 10%."
                            }
                        ].map((agent, i) => (
                            <div key={i} className={localCn("glass-card-dark p-8 rounded-2xl border transition-all duration-500 hover:scale-[1.01]", agent.border)}>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0">
                                        <div className={localCn("w-16 h-16 rounded-2xl flex items-center justify-center", agent.bg)}>
                                            <agent.icon className={localCn("w-8 h-8", agent.color)} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={localCn("text-2xl font-bold uppercase tracking-wider", agent.color)}>{agent.name}</h3>
                                            <span className="text-slate-500 text-sm">// {agent.role}</span>
                                        </div>
                                        <p className="text-slate-300 mb-6">{agent.desc}</p>

                                        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm border border-white/5 relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50 rounded-l-lg" style={{ color: agent.color.replace('text-', 'bg-').replace('400', '500') }}></div>
                                            <div className="flex gap-3">
                                                <span className={agent.color}>{">"}</span>
                                                <span className="text-slate-300 italic">"{agent.quote}"</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Design Elements */}
            <section id="6-design-elements" className="py-24 border-t border-white/5 bg-neutral-950/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-cyan-500">06.</span>
                        Design Elements
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Buttons */}
                        <div className="glass-card-dark p-8 rounded-xl">
                            <h3 className="text-white font-bold mb-6">Button Styles</h3>
                            <div className="flex flex-col gap-4 items-start">
                                <button className="bg-gradient-to-br from-cyan-500 to-cyan-400 text-black px-8 py-3 rounded-lg font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all">
                                    Primary Button
                                </button>
                                <button className="bg-transparent text-cyan-400 border-2 border-cyan-500/50 px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition-all">
                                    Secondary Button
                                </button>
                            </div>
                        </div>

                        {/* Design Cards */}
                        <div className="glass-card-neon p-8 rounded-xl">
                            <h3 className="text-cyan-400 font-bold mb-6">Neon Glass Card</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Used for special items and highlights. Features a soft cyan glow.
                            </p>
                            <div className="h-2 w-24 bg-cyan-500/50 rounded-full"></div>
                        </div>

                        {/* Terminal */}
                        <div className="glass-card-dark p-6 rounded-xl md:col-span-2 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                                <Terminal className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-emerald-500 uppercase tracking-wider">Terminal UI</span>
                            </div>
                            <div className="font-mono text-sm space-y-2">
                                <div className="flex gap-2">
                                    <span className="text-emerald-500">➜</span>
                                    <span className="text-slate-300">init north_road_protocol</span>
                                </div>
                                <div className="text-emerald-500/80 pl-6 terminal-line overflow-hidden" style={{ width: 'auto' }}>
                                    Loading neural networks... [OK]
                                </div>
                                <div className="text-emerald-500/80 pl-6 terminal-line overflow-hidden" style={{ width: 'auto', animationDelay: '1s' }}>
                                    Establishing secure connection... [OK]
                                </div>
                                <div className="flex gap-2 pl-6 mt-2">
                                    <span className="terminal-cursor"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Examples */}
            <section id="9-examples" className="py-24 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="text-cyan-500">09.</span>
                        Examples
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Pricing Card Example */}
                        <div className="relative pt-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                                Most Popular
                            </div>
                            <div className="glass-card-neon p-8 rounded-xl h-full flex flex-col items-center text-center">
                                <Zap className="w-8 h-8 text-cyan-400 mb-4" />
                                <h3 className="text-2xl font-bold text-cyan-400 uppercase mb-2">Vanguard</h3>
                                <div className="flex items-baseline justify-center gap-1 mb-6">
                                    <span className="text-5xl font-black text-white">$39</span>
                                    <span className="text-slate-400">/mo</span>
                                </div>
                                <ul className="space-y-3 mb-8 w-full text-left">
                                    {[1, 2, 3].map((_, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-cyan-400" />
                                            <span>All 5 AI agents unlocked</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg uppercase tracking-wider transition-colors mt-auto">
                                    Activate Vanguard
                                </button>
                            </div>
                        </div>

                        {/* Chat UI Example */}
                        <div className="border border-white/10 rounded-xl bg-black overflow-hidden flex flex-col">
                            <div className="bg-neutral-900 border-b border-white/5 p-4 flex items-center justify-between">
                                <span className="text-sm font-mono text-slate-400">Session ID: #8X92</span>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6 flex-1 bg-gradient-to-b from-black to-neutral-950">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <Compass className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="glass-card-light p-4 rounded-xl rounded-tl-none">
                                        <p className="text-sm text-white/90 leading-relaxed">
                                            Does this idea fit the market? What validation did you do? Did 10 people pay?
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold">
                                        YO
                                    </div>
                                    <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl rounded-tr-none">
                                        <p className="text-sm text-white/90 leading-relaxed">
                                            Not yet, just talked to my friends.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-black text-center text-slate-500 text-sm">
                <div className="mb-4">
                    <span className="text-cyan-500 font-bold">NORTH ROAD AI</span> · BRAND BOOK 1.0
                </div>
                <p>© 2024 North Road AI. All rights reserved.</p>
            </footer>
        </div>
    );
}
