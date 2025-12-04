"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, Terminal, Globe, Cpu, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import { SystemHealthPanel } from "@/components/system-health-panel";

// --- COMPONENTS ---

function MouseSpotlight({ children }: { children: React.ReactNode }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative w-full h-full overflow-hidden bg-black text-slate-200 selection:bg-cyan-500/30"
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

const FloatingBadge = ({ text, delay }: { text: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-md text-xs text-cyan-400 font-mono mb-6"
  >
    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mr-2"></span>
    {text}
  </motion.div>
);

export default function CreativeHome() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Guide your startup through the chaos.";

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 50);
    return () => clearInterval(typing);
  }, []);

  return (
    <MouseSpotlight>
      <div className="min-h-screen flex flex-col relative">

        <TopNav className="absolute top-0 left-0 right-0" />

        {/* --- MAIN INTERFACE --- */}
        <main className="flex-grow flex flex-col justify-center items-center px-4 relative">

          {/* Background Grid Decoration */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[40rem] h-[40rem] bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <FloatingBadge text="SYSTEM STATUS: ONLINE" delay={0.2} />

          <div className="max-w-4xl w-full text-center z-20">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-600 mb-6">
              North Road
            </h1>

            <div className="h-12 md:h-16 flex justify-center items-center mb-12">
              <p className="text-xl md:text-2xl text-cyan-400/80 font-mono">
                {typedText}
                <span className="animate-blink">_</span>
              </p>
            </div>

            {/* THE INPUT PORTAL (Instead of buttons) */}
            <SystemHealthPanel className="w-full mb-8" />
            <ChatInterface />
          </div>
        </main>

        {/* --- FLOATING INFO CARDS (Bottom) --- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-900/50 border-t border-slate-800">
          {[
            { title: "24/7 AI Mentor", icon: <Cpu />, desc: "Context-aware guidance." },
            { title: "Global Network", icon: <Globe />, desc: "Connect with peers." },
            { title: "Data Driven", icon: <Terminal />, desc: "Real startup datasets." }
          ].map((item, idx) => (
            <div key={idx} className="group p-8 bg-black hover:bg-slate-950 transition-colors duration-500 cursor-default border-r border-slate-800 last:border-r-0">
              <div className="text-slate-600 group-hover:text-cyan-400 transition-colors mb-4">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 font-mono">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </MouseSpotlight>
  );
}

function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          setError(data.error);
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="relative max-w-2xl mx-auto group w-full"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>

      <div className="relative bg-black border border-slate-800 rounded-lg overflow-hidden flex flex-col">

        {/* Chat History Area (Visible only if there are messages) */}
        {messages.length > 0 && (
          <div
            ref={scrollRef}
            className="p-4 h-64 overflow-y-auto space-y-4 border-b border-slate-800 bg-slate-950/50"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm font-mono ${msg.role === 'user'
                  ? 'bg-cyan-900/20 text-cyan-100 border border-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 text-cyan-500 p-3 rounded-lg text-xs font-mono animate-pulse">
                  PIRAI IS THINKING...
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-900/20 text-red-400 p-2 rounded border border-red-500/20 text-xs font-mono">
                  {error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-center p-2 pr-4 bg-black">
          <div className="p-3 text-slate-500">
            <Terminal size={20} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={messages.length === 0 ? "Ask PIRAI: Is my valuation realistic?" : "Type your reply..."}
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-600 font-mono text-sm"
            disabled={!!error}
          />
          <button
            onClick={handleSend}
            disabled={loading || !!error}
            className="ml-2 p-2 bg-slate-800 rounded hover:bg-cyan-600 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {messages.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-xs text-slate-500 font-mono text-center"
        >
          POWERED BY MULTI-AGENT ARCHITECTURE • CONTEXT AWARE • FOUNDER FIRST
        </motion.p>
      )}
    </motion.div>
  );
}
