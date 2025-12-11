// src/components/system-health-panel.tsx
import React from "react";
import { Activity, Wifi, Cpu, ShieldCheck, Database } from "lucide-react";

export function SystemHealthPanel({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden flex items-center justify-between px-6 py-2.5 bg-[#0a0a0a]/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg shadow-cyan-900/5 ${className}`}>

      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />

      {/* Left: System Status */}
      <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest relative z-10">

        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            Core: Online
          </span>
        </div>

        {/* Metrics (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5">
            <Activity size={12} />
            <span>12ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database size={12} />
            <span>RAG Active</span>
          </div>
        </div>
      </div>

      {/* Right: Hardware Icons */}
      {/* Right: Hardware Icons */}
      <div className="flex gap-4 text-slate-600 relative z-10">
        <span title="Neural Engine: Nominal" className="hover:text-cyan-400 transition-colors cursor-help">
          <Cpu size={14} />
        </span>
        <span title="Encryption: AES-256" className="hover:text-emerald-400 transition-colors cursor-help">
          <ShieldCheck size={14} />
        </span>
        <span title="Uplink: Stable" className="hover:text-blue-400 transition-colors cursor-help">
          <Wifi size={14} />
        </span>
      </div>
    </div>
  );
}