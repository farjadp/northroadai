// ============================================================================
// 📁 Hardware Source: src/app/admin/page.tsx
// 🕒 Date: 2025-12-04
// 🧠 Version: v2.1 (Bug-Free & Self-Contained)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Removes dependency on missing 'BrainStats' component.
// 2. Uses internal 'StatCard' for all metrics.
// 3. Simulates Real-time Logs.
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Cpu, Users, AlertTriangle, Search, TrendingUp, ShieldCheck, Database, DollarSign } from "lucide-react";
import { SystemHealthPanel } from "@/components/system-health-panel";

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, sub, icon: Icon, color = "blue" }: any) => {
  // Color Maps for dynamic styling
  const colorMap: any = {
    blue: "text-blue-400 bg-blue-900/10 border-blue-500/20",
    cyan: "text-cyan-400 bg-cyan-900/10 border-cyan-500/20",
    red: "text-red-400 bg-red-900/10 border-red-500/20",
    green: "text-green-400 bg-green-900/10 border-green-500/20",
    purple: "text-purple-400 bg-purple-900/10 border-purple-500/20",
  };

  const styleClass = colorMap[color] || colorMap.blue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${styleClass.split(" ")[2]} ${styleClass.split(" ")[1]} relative overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition-opacity ${styleClass.split(" ")[0]}`}>
          {Icon ? <Icon size={40} /> : <Cpu size={40} />}
      </div>
      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
      <div className="text-3xl font-bold text-white mb-1 font-mono">{value}</div>
      <div className={`text-xs flex items-center gap-1 ${styleClass.split(" ")[0]}`}>
        {sub}
      </div>
    </motion.div>
  );
};

const LiveLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  // Fake logs generator
  const templates = [
    "User_293 asked about 'SAFE Agreement'",
    "Model_GPT4o initiated for 'Market Sizing'",
    "Alert: Start_77 burn rate > 80%",
    "New Founder registered from Toronto",
    "Database sync: Founder_Profile_Updated",
    "Vector Search: Found 3 matching docs",
    "Ingestion: Added new Paul Graham essay",
  ];

  useEffect(() => {
    // Initial population
    setLogs(templates.slice(0, 5).map(t => `[INIT] ${t}`));

    const interval = setInterval(() => {
        const randIdx = Math.floor(Math.random() * templates.length);
        const newLog = `[${new Date().toLocaleTimeString()}] ${templates[randIdx]}`;
        setLogs((prev) => [newLog, ...prev].slice(0, 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-xs space-y-3">
      {logs.map((log, i) => (
        <motion.div 
            key={i} // In production use unique ID
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-3 text-cyan-300/80 border-b border-white/5 pb-2"
        >
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
            {log}
        </motion.div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Mission Control</h1>
            <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
                System Status: <span className="text-green-500 font-bold">OPERATIONAL</span>
            </p>
        </div>
        <div className="flex gap-4">
             <div className="flex items-center bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400 focus-within:border-cyan-500/50 transition-colors">
                <Search size={14} className="mr-2"/>
                <input type="text" placeholder="Search entity ID..." className="bg-transparent outline-none w-32 md:w-48 placeholder:text-slate-700 text-white"/>
             </div>
        </div>
      </header>

      <SystemHealthPanel className="w-full" />

      {/* 2. MAIN METRICS */}
      <section>
        <h2 className="text-sm font-mono text-slate-500 uppercase mb-4 pl-1">{'/// Neural Metrics'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Founders" value="142" sub="+12% this week" color="blue" icon={Users} />
            <StatCard title="Active Chats" value="1,204" sub="24h Volume" color="cyan" icon={Activity} />
            <StatCard title="Knowledge Base" value="450 MB" sub="Vectorized Data" color="purple" icon={Database} />
            <StatCard title="Revenue (MRR)" value="$3,240" sub="+8% MoM" color="green" icon={DollarSign} />
        </div>
      </section>

      {/* 3. LOGS & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Live Neural Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-mono text-slate-400 uppercase">{'/// Live Neural Activity'}</h3>
                <Activity size={16} className="text-cyan-500 animate-pulse"/>
            </div>
            <div className="bg-black/50 rounded-lg p-4 border border-white/5 h-[300px] overflow-hidden relative">
                {/* Fade overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none z-10"></div>
                <LiveLog />
            </div>
        </div>

        {/* RIGHT: Pending Escalations */}
        <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/20 backdrop-blur-md flex flex-col">
             <h3 className="text-sm font-mono text-slate-400 uppercase mb-6">{'/// Risk Flags'}</h3>
             
             <div className="space-y-4 flex-1">
                {[1, 2].map((item) => (
                    <div key={item} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/30 transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">CRITICAL</span>
                            <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition"/>
                        </div>
                        <p className="text-sm text-slate-300 mb-1">Unusual token usage spike.</p>
                        <p className="text-xs text-slate-600 font-mono">User ID: #8829</p>
                    </div>
                ))}
             </div>

             <button className="w-full mt-6 py-3 border border-white/10 rounded-lg text-xs font-mono text-slate-400 hover:bg-white/5 hover:text-white transition uppercase">
                System Diagnostics
             </button>
        </div>

      </div>
    </div>
  );
}
