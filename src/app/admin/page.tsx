"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Cpu, Users, AlertTriangle, Search } from "lucide-react";

// --- COMPONENTS ---

const StatCard = ({ title, value, sub, color = "blue" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition-opacity text-${color}-500`}>
        <Cpu size={40} />
    </div>
    <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">{title}</h3>
    <div className="text-3xl font-bold text-white mb-1 font-mono">{value}</div>
    <div className={`text-xs flex items-center gap-1 ${color === 'red' ? 'text-red-400' : 'text-cyan-400'}`}>
      {sub}
    </div>
  </motion.div>
);

const LiveLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const templates = [
    "User_293 asked about 'SAFE Agreement'",
    "Model_GPT4o initiated for 'Market Sizing'",
    "Alert: Start_77 burn rate > 80%",
    "New Founder registered from Toronto",
    "Database sync: Founder_Profile_Updated",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${templates[Math.floor(Math.random() * templates.length)]}`;
      setLogs((prev) => [newLog, ...prev].slice(0, 8));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-xs space-y-3">
      {logs.map((log, i) => (
        <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1 - i * 0.1, x: 0 }} 
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
    <div className="max-w-6xl mx-auto">
      
      {/* HEADER */}
      <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Command Center</h1>
            <p className="text-slate-500 text-sm font-mono">System Status: <span className="text-green-500">OPERATIONAL</span></p>
        </div>
        <div className="flex gap-4">
             <div className="flex items-center bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400">
                <Search size={14} className="mr-2"/>
                <input type="text" placeholder="Search entity ID..." className="bg-transparent outline-none w-32 md:w-48 placeholder:text-slate-700"/>
             </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Active Founders" value="142" sub="+12% this week" color="cyan" />
        <StatCard title="AI Interactions" value="8,902" sub="2.3s avg latency" color="blue" />
        <StatCard title="Knowledge Nodes" value="45 TB" sub="Vector DB Healthy" color="purple" />
        <StatCard title="Risk Flags" value="3" sub="Requires Human Review" color="red" />
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Live Neural Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-mono text-slate-400 uppercase">/// Live Neural Activity</h3>
                <Activity size={16} className="text-cyan-500 animate-pulse"/>
            </div>
            <div className="bg-black/50 rounded-lg p-4 border border-white/5 h-[300px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10"></div>
                <LiveLog />
            </div>
        </div>

        {/* RIGHT: Quick Actions / Escalations */}
        <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/20 backdrop-blur-md">
             <h3 className="text-sm font-mono text-slate-400 uppercase mb-6">/// Pending Escalations</h3>
             
             <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-white bg-red-500/20 text-red-400 px-2 py-0.5 rounded">HIGH PRIORITY</span>
                            <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition"/>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">Founder <span className="text-white">#882</span> is asking about complex IP assignment in Canada.</p>
                        <p className="text-xs text-slate-600 font-mono">Waiting for Human Mentor (2h)</p>
                    </div>
                ))}
             </div>

             <button className="w-full mt-6 py-3 border border-white/10 rounded-lg text-xs font-mono text-slate-400 hover:bg-white/5 hover:text-white transition uppercase">
                View All Queues
             </button>
        </div>

      </div>
    </div>
  );
}