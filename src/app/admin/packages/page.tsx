// ============================================================================
// 📁 Hardware Source: src/app/admin/packages/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Admin Packages)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Loads plan configs from Firestore (plans/{tier}).
// - Allows editing price, description, features, and included agents per tier.
// - Saves updates back to Firestore.
// ============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { Plan, PlanService } from "@/lib/plan-service";
import { UserTier } from "@/lib/user-service";
import { AGENTS } from "@/lib/agents";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

const TIER_ORDER: UserTier[] = ["SCOUT", "VANGUARD", "COMMAND"];

export default function PackagesPage() {
  const [plans, setPlans] = useState<Record<UserTier, Plan> | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const fetched = await PlanService.getPlans();
      const mapped = fetched.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<UserTier, Plan>);
      setPlans(mapped);
    };
    load();
  }, []);

  const updatePlanField = (tier: UserTier, key: keyof Plan, value: any) => {
    if (!plans) return;
    setPlans({
      ...plans,
      [tier]: { ...plans[tier], [key]: value },
    });
  };

  const toggleAgent = (tier: UserTier, agentId: string) => {
    if (!plans) return;
    const included = plans[tier].includedAgents;
    const next = included.includes(agentId)
      ? included.filter((a) => a !== agentId)
      : [...included, agentId];
    updatePlanField(tier, "includedAgents", next);
  };

  const handleSave = async () => {
    if (!plans) return;
    setSaving(true);
    try {
      await Promise.all(Object.values(plans).map((plan) => PlanService.updatePlan(plan)));
      alert("Plans updated.");
    } catch (err) {
      console.error("Failed to save plans", err);
      alert("Failed to save plans.");
    } finally {
      setSaving(false);
    }
  };

  if (!plans) {
    return (
      <div className="p-10 text-slate-400 font-mono flex items-center gap-3">
        <Loader2 className="animate-spin" /> Loading plans...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-start flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Packages & Pricing</h1>
          <p className="text-slate-500 text-sm font-mono">Manage tiers, included agents, and feature lists.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save all"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIER_ORDER.map((tier) => (
          <PlanCard
            key={tier}
            tier={tier}
            plan={plans[tier]}
            onChange={(key, val) => updatePlanField(tier, key, val)}
            onToggleAgent={(agentId) => toggleAgent(tier, agentId)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  tier,
  plan,
  onChange,
  onToggleAgent,
}: {
  tier: UserTier;
  plan: Plan;
  onChange: (key: keyof Plan, value: any) => void;
  onToggleAgent: (agentId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{plan.name}</h2>
        <span className="text-xs font-mono text-slate-500">{tier}</span>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-500 font-mono">Price</label>
        <input
          value={plan.price}
          onChange={(e) => onChange("price", e.target.value)}
          className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
          placeholder="$29/mo"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-500 font-mono">Description</label>
        <textarea
          value={plan.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none min-h-[60px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-500 font-mono">Features (one per line)</label>
        <textarea
          value={plan.features.join("\n")}
          onChange={(e) => onChange("features", e.target.value.split("\n").filter(Boolean))}
          className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-500 font-mono">Included Agents</label>
        <div className="grid grid-cols-2 gap-2">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const active = plan.includedAgents.includes(agent.id);
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => onToggleAgent(agent.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${
                  active
                    ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                    : "border-white/10 bg-black text-slate-400 hover:border-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{agent.name}</span>
                {active && <CheckCircle2 className="w-4 h-4 text-cyan-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
