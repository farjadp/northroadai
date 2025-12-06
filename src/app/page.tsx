// ============================================================================
// 📁 Hardware Source: src/app/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v3.0 (Liquid Command Hybrid)
// ----------------------------------------------------------------------------
// ✅ Design: Combines "Digital Ferrofluid" visuals with "Guest Chat" logic.
// ✅ Features: 
// - Living Gooey Background & Custom Cursor.
// - Functional Guest Chat connected to API.
// - Integrated TopNav & SystemHealth.
// ============================================================================

"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Activity, Zap, Command } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/top-nav"; // فرض بر این است که این کامپوننت وجود دارد
import { SystemHealthPanel } from "@/components/system-health-panel"; // فرض بر این است که این کامپوننت وجود دارد

// --- 1. CUSTOM CURSOR (The Lens) ---
function FluidCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springConfig = { damping: 20, stiffness: 400 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      style={{ x, y }}
      className="fixed top-0 left-0 w-5 h-5 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-difference shadow-[0_0_20px_rgba(34,211,238,0.8)] hidden md:block"
    />
  );
}

// --- 2. LIQUID BACKGROUND (The Living Core) ---
const LivingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505] pointer-events-none z-0">
      {/* SVG Filter for Gooey Effect */}
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 w-full h-full" style={{ filter: "url(#goo)" }}>
        <motion.div 
          animate={{ x: [0, 80, -80, 0], y: [0, -80, 80, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-blue-950/30 rounded-full blur-[80px] opacity-40"
        />
        <motion.div 
          animate={{ x: [0, -100, 100, 0], y: [0, 100, -100, 0], scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[20%] w-[600px] h-[600px] bg-indigo-950/30 rounded-full blur-[80px] opacity-40"
        />
        <motion.div 
           animate={{ x: [0, 50, -50, 0], y: [0, 50, -50, 0] }}
           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-[10%] left-[40%] w-[300px] h-[300px] bg-cyan-900/20 rounded-full blur-[60px] opacity-30"
        />
      </div>
      
      {/* Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
export default function LiquidHome() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden cursor-none font-sans flex flex-col">
      <FluidCursor />
      <LivingBackground />

      {/* Navbar sits on top */}
      <div className="relative z-50">
        <TopNav />
      </div>

      <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 w-full max-w-[1400px] mx-auto pt-20 pb-10">
        
        {/* HERO TYPOGRAPHY */}
        <div className="relative z-0 mb-8 text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 select-none mix-blend-overlay"
            >
                NORTH ROAD
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-lg md:text-xl text-cyan-400/80 font-mono mt-4"
            >
                Guide your startup through the chaos_
            </motion.p>
        </div>

        {/* SYSTEM STATUS WIDGET */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-2xl mb-8 relative z-20"
        >
             <SystemHealthPanel />
        </motion.div>

        {/* CHAT INTERFACE (The Centerpiece) */}
        <ChatInterface />

      </main>

      {/* FOOTER INFO */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 w-full border-t border-white/5 bg-black/20 backdrop-blur-sm py-4 px-8 flex justify-between items-center text-[10px] md:text-xs font-mono text-slate-600"
      >
         <div>/// SYSTEM V2.1 • LIQUID CORE</div>
         <div className="flex gap-4">
            <span>CONTEXT AWARE</span>
            <span>MULTI-AGENT</span>
            <span>SECURE</span>
         </div>
      </motion.div>
    </div>
  );
}

// --- 4. CHAT COMPONENT (Refined & Integrated) ---
function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/guest-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
            // Special handling for rate limit
            setMessages(prev => [...prev, { role: 'ai', content: "🛑 Daily Limit Reached. Please login to continue." }]);
            setTimeout(() => { window.location.href = "/login"; }, 3000);
        } else {
            setError(data.error || "System anomaly detected.");
        }
        return;
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setError("Uplink failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="relative w-full max-w-2xl z-30"
    >
      {/* Outer Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>

      {/* Main Container - Smoked Glass */}
      <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 hover:border-cyan-500/30">
        
        {/* Header inside Chat */}
        {messages.length === 0 && (
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400 border border-cyan-500/20">
                        <Activity size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">PIRAI GUEST UPLINK</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Restricted Access • 5 Queries/Day</p>
                    </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                    "I can analyze your startup idea, calculate runway, or critique your pitch. What's on your mind?"
                </p>
            </div>
        )}

        {/* Chat History Area */}
        {messages.length > 0 && (
          <div
            ref={scrollRef}
            className="p-6 h-[300px] overflow-y-auto space-y-4 border-b border-white/10 bg-black/40 scrollbar-thin scrollbar-thumb-white/10"
          >
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20'
                    : 'bg-[#1a1a1a] text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 px-4 py-2 rounded-full">
                    <Zap size={14} className="text-cyan-400 animate-pulse fill-cyan-400" />
                    <span className="text-xs text-slate-400 font-mono">Computing...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-500/20">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex items-center bg-black/60 p-2 group-focus-within:bg-black/80 transition-colors">
          <div className="pl-4 pr-3 text-slate-500">
            <Terminal size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={messages.length === 0 ? "Type command: 'Validate my SaaS idea'..." : "Reply..."}
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-600 font-mono text-sm h-12"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="mx-2 h-9 px-4 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-400 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Send <ArrowRight size={14} />
          </button>
        </div>
        
        {/* Loading Progress Bar */}
        {loading && <div className="h-0.5 w-full bg-cyan-500/20 overflow-hidden"><div className="h-full bg-cyan-400 w-1/3 animate-[loading_1s_ease-in-out_infinite]"></div></div>}
      </div>
    </motion.div>
  );
}