// ============================================================================
// 📁 Hardware Source: src/app/admin/logs/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v2.0 (Real Logs)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Shows REAL grouped logs from /api/admin/logs
// - Displays rich metadata (Tokens, Latency, Model)
// - Provides quick filters and severity badges.
// ============================================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { ShieldAlert, Bell, Activity, Users, Filter, Clock, Server, CheckCircle2, AlertTriangle, Flame, Cpu, Database } from "lucide-react";
import BrainStats from "@/components/BrainStats";

type LogEntry = {
  id: string;
  type: "admin" | "user" | "activity";
  title: string;
  detail: string;
  severity: "info" | "warn" | "critical";
  ts: string;
  meta?: string;
};

const severityStyle: Record<LogEntry["severity"], string> = {
  info: "bg-blue-900/30 text-blue-300 border border-blue-500/30",
  warn: "bg-yellow-900/30 text-yellow-300 border border-yellow-500/30",
  critical: "bg-red-900/30 text-red-300 border border-red-500/30",
};

const typeIcon: Record<LogEntry["type"], JSX.Element> = {
  admin: <ShieldAlert size={16} />,
  user: <Users size={16} />,
  activity: <Activity size={16} />,
};

export default function AdminLogsPage() {
  const [filter, setFilter] = useState<LogEntry["type"] | "all">("all");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/logs");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load logs");
        setLogs(data.logs || []);
      } catch (err: any) {
        setError(err.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    const source = filter === "all" ? logs : logs.filter((l) => l.type === filter);
    return source;
  }, [filter, logs]);

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">System Logs</p>
          <h1 className="text-3xl font-bold text-white">Observability Center</h1>
          <p className="text-sm text-slate-500 font-mono">Real-time system telemetry and user events.</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" />
          <FilterButton active={filter === "admin"} onClick={() => setFilter("admin")} label="Admin" />
          <FilterButton active={filter === "user"} onClick={() => setFilter("user")} label="Users" />
          <FilterButton active={filter === "activity"} onClick={() => setFilter("activity")} label="Activity" />
        </div>
      </header>

      {/* Quick Stats */}
      <section className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-widest">
          <Server size={16} className="text-cyan-500" /> Live Signals
        </div>

        {/* Mock BrainStats or remove if broken. Keeping simple Stats row here for now */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white/5 rounded border border-white/5">
            <div className="text-xs text-slate-400">Total Logs</div>
            <div className="text-xl font-bold text-white font-mono">{logs.length}</div>
          </div>
          <div className="p-3 bg-white/5 rounded border border-white/5">
            <div className="text-xs text-slate-400">Errors</div>
            <div className="text-xl font-bold text-red-400 font-mono">{logs.filter(l => l.severity === 'critical').length}</div>
          </div>
        </div>

      </section>

      {/* Logs List */}
      <section className="space-y-3">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-900/20 text-red-200 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && filtered.map((log) => {
          let metaObj: any = null;
          try { if (log.meta) metaObj = JSON.parse(log.meta); } catch (e) { }

          return (
            <article
              key={log.id}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/20 transition group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-2 ${severityStyle[log.severity]}`}>
                  {log.severity === "critical" ? <Flame size={12} /> : log.severity === "warn" ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  <span className="uppercase">{log.severity}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {typeIcon[log.type]}
                  <span className="uppercase font-mono">{log.type}</span>
                  <span className="text-slate-600">•</span>
                  <span>{log.ts}</span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold tracking-tight">{log.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{log.detail}</p>
                </div>
              </div>

              {/* Metadata Preview */}
              {metaObj && (
                <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/5 text-xs font-mono text-slate-400 flex flex-wrap gap-4">
                  {metaObj.model && <div className="flex items-center gap-1 text-cyan-300"><Cpu size={12} /> {metaObj.model}</div>}
                  {metaObj.tokens?.totalTokens && <div className="flex items-center gap-1 text-emerald-300"><Database size={12} /> {metaObj.tokens.totalTokens} toks</div>}
                  {metaObj.latencyMs && <div className="flex items-center gap-1 text-amber-300"><Clock size={12} /> {metaObj.latencyMs}ms</div>}
                </div>
              )}
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-6 rounded-xl border border-white/10 bg-black/40 text-slate-500 text-sm">
            No logs in this category.
          </div>
        )}
      </section>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${active ? "border-cyan-500/50 text-white bg-cyan-500/10" : "border-white/10 text-slate-400 hover:border-white/30"
        }`}
    >
      {label}
    </button>
  );
}

