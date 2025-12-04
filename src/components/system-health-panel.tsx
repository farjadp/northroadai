"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import type { SystemAlert, SystemServiceStatus } from "@/lib/system-status";

type SystemHealthPayload = {
  services: SystemServiceStatus[];
  alerts: SystemAlert[];
};

const POLL_INTERVAL = 7000;

export function SystemHealthPanel({ className }: { className?: string }) {
  const [payload, setPayload] = useState<SystemHealthPayload>({
    services: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval>;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/system-status", { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to reach system telemetry.");
        const data = await res.json();
        if (!mounted) return;
        setPayload(data);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Status refresh failed.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStatus();
    timer = setInterval(fetchStatus, POLL_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const hasIssues = payload.services.some((service) => !service.healthy);
  const label = hasIssues ? "DEGRADED" : "OPERATIONAL";
  const tone = hasIssues ? "text-amber-300" : "text-emerald-300";
  const dotTone = hasIssues ? "bg-amber-500/60" : "bg-emerald-500/60";
  const lastUpdated = payload.services.reduce<string>((latest, state) => {
    if (!state.lastUpdated) return latest;
    return state.lastUpdated > latest ? state.lastUpdated : latest;
  }, new Date().toISOString());

  const displayedAlerts = payload.alerts.slice(0, 3);

  return (
    <div className={`bg-black/60 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur ${className || ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-1">System Health</p>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 text-sm font-semibold ${tone}`}>
              <span className={`h-2 w-2 rounded-full ${dotTone}`}></span>
              {label}
            </span>
            {loading && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <RefreshCw size={12} className="animate-spin" />
                polling
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {error && (
          <div className="text-[11px] text-rose-400 flex items-center gap-1">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        {payload.services.length === 0 && !loading ? (
          <p className="text-slate-500 col-span-2">Awaiting telemetry...</p>
        ) : (
          payload.services.map((service) => (
            <div
              key={service.service}
              className={`rounded-xl border border-white/5 px-3 py-2 bg-white/5 flex flex-col gap-1`}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
                <span>{service.service}</span>
                <span className={`px-2 rounded-full ${service.healthy ? "text-emerald-200 bg-emerald-500/10" : "text-amber-200 bg-amber-500/10"}`}>
                  {service.healthy ? "OK" : "Issue"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{service.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
          <span>Incident Log</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Remedies ready
          </span>
        </div>
        <div className="space-y-2">
          {displayedAlerts.length === 0 ? (
            <p className="text-[12px] text-slate-500">No recent incidents.</p>
          ) : (
            displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono tracking-[0.02em] uppercase text-slate-400">{alert.service}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      alert.severity === "critical"
                        ? "bg-rose-500/20 text-rose-300"
                        : alert.severity === "warning"
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-teal-500/20 text-teal-200"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-snug">{alert.message}</p>
                {alert.detail && (
                  <p className="text-[11px] text-slate-500 font-mono leading-snug">
                    {alert.detail.length > 120 ? `${alert.detail.slice(0, 120)}...` : alert.detail}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 font-mono">
                  Remedy: {alert.resolution}
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
