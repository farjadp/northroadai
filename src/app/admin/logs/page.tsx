// ============================================================================
// 📁 Hardware Source: src/app/admin/logs/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (System Logs Center)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Shows grouped logs: Admin Alerts, User Events, Activity Metrics.
// - Mock data for now; wire to real backend later.
// - Provides quick filters and severity badges.
// ============================================================================

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { ShieldAlert, Bell, Activity, Users, Filter, Clock, Server, CheckCircle2, AlertTriangle, Flame } from "lucide-react";
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
          <p className="text-sm text-slate-500 font-mono">Admin alerts, user events, and operational activity.</p>
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
        <BrainStats variant="compact" />
        <div className="flex gap-3 text-xs text-slate-400 font-mono">
          <Badge icon={<Bell size={12} />} text="Admin alerts x2" />
          <Badge icon={<Users size={12} />} text="User events x2" />
          <Badge icon={<Activity size={12} />} text="Ops events x2" />
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

        {!loading && !error && filtered.map((log) => (
          <article
            key={log.id}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/20 transition"
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
            <h3 className="text-white font-semibold">{log.title}</h3>
            <p className="text-slate-400 text-sm">{log.detail}</p>
            {log.meta && <p className="text-xs text-slate-500 font-mono mt-1">{log.meta}</p>}
          </article>
        ))}

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
      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
        active ? "border-cyan-500/50 text-white bg-cyan-500/10" : "border-white/10 text-slate-400 hover:border-white/30"
      }`}
    >
      {label}
    </button>
  );
}

function Badge({ icon, text }: { icon: JSX.Element; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-white/10 bg-black/30">
      {icon}
      {text}
    </span>
  );
}
