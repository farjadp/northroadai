// src/components/system-health-panel.tsx
import React from "react";
import { Activity, Wifi, Cpu } from "lucide-react";

export function SystemHealthPanel({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-t-lg border-b-0 ${className}`}>
      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Core: Online</span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
          <Activity size={10} />
          <span>Latency: 12ms</span>
        </div>
      </div>
      <div className="flex gap-3 text-slate-600">
        <Wifi size={12} />
        <Cpu size={12} />
      </div>
    </div>
  );
}