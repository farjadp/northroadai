// src/components/BrainStats.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Brain, Zap, Database, Activity } from "lucide-react";

export default function BrainStats({ variant = "full" }: { variant?: "full" | "compact" }) {
  const [stats, setStats] = useState({ totalVectors: 0, ragPercentage: 0, totalQueries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="h-24 bg-white/5 animate-pulse rounded-xl"></div>;

  // حالت فشرده (برای سایدبار یا هدر)
  if (variant === "compact") {
    return (
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-black/20 p-2 rounded-lg border border-white/5">
            <div className="flex items-center gap-1">
                <Database size={12} className="text-purple-500"/>
                <span>{stats.totalVectors} Nodes</span>
            </div>
            <div className="w-px h-3 bg-white/10"></div>
            <div className="flex items-center gap-1">
                <Zap size={12} className="text-yellow-500"/>
                <span>{stats.ragPercentage}% Accuracy</span>
            </div>
        </div>
    );
  }

  // حالت کامل (برای داشبورد)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* CARD 1: KNOWLEDGE VOLUME */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-purple-500">
            <Database size={60} />
        </div>
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Brain size={20} />
            </div>
            <h3 className="text-sm font-mono text-slate-400 uppercase">Brain Volume</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{stats.totalVectors.toLocaleString()}</div>
        <p className="text-xs text-slate-500">Vectorized knowledge chunks</p>
      </div>

      {/* CARD 2: RAG COVERAGE */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-cyan-500">
            <Activity size={60} />
        </div>
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Zap size={20} />
            </div>
            <h3 className="text-sm font-mono text-slate-400 uppercase">Reliance Score</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{stats.ragPercentage}%</div>
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${stats.ragPercentage}%` }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Responses based on real data</p>
      </div>

      {/* CARD 3: TOTAL INTERACTIONS */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-5 relative overflow-hidden group">
         <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <Activity size={20} />
            </div>
            <h3 className="text-sm font-mono text-slate-400 uppercase">Neural Ops</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{stats.totalQueries.toLocaleString()}</div>
        <p className="text-xs text-slate-500">Total processed queries</p>
      </div>
    </div>
  );
}