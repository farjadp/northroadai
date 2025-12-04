// ============================================================================
// 📁 Hardware Source: src/app/admin/business/page.tsx
// 🕒 Date: 2025-12-04
// 🧠 Version: v1.0 (The CEO Dashboard)
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { getBusinessMetrics, UserAnalytics } from "@/app/actions/admin-analytics";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
    DollarSign, Users, UserX, TrendingUp, Loader2, Calendar, MessageSquare 
} from "lucide-react";

export default function BusinessPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBusinessMetrics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
            <p className="text-slate-500 font-mono text-sm">Syncing with Stripe & Firebase...</p>
        </div>
    </div>
  );

  const { overview, users, chart } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Business Intelligence</h1>
        <p className="text-slate-400 text-sm">Live financial & usage tracking.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
            title="Monthly Revenue (MRR)" 
            value={`$${overview.mrr}`} 
            icon={DollarSign} 
            color="text-green-400" 
            trend="+12%" 
        />
        <KPICard 
            title="Active Subscriptions" 
            value={overview.active} 
            icon={Users} 
            color="text-blue-400" 
            trend="Stable"
        />
        <KPICard 
            title="Churn / Cancellations" 
            value={overview.churn} 
            icon={UserX} 
            color="text-red-400" 
            trend={overview.churn > 0 ? "High Risk" : "Low Risk"}
        />
        <KPICard 
            title="Avg Usage / User" 
            value="14 Sessions" 
            icon={TrendingUp} 
            color="text-purple-400" 
            trend="High Engagement"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-6">Revenue Growth (30 Days)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} prefix="$" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="sales" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                            {chart.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index === chart.length - 1 ? '#22c55e' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* RECENT SALES FEED */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-6">Recent Transactions</h3>
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-2">
                {users.slice(0, 5).map((u: UserAnalytics) => (
                    <div key={u.uid} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-900/20 text-green-400 flex items-center justify-center font-bold text-xs">
                                $
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">{u.name}</p>
                                <p className="text-[10px] text-slate-500">{u.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-green-400 font-bold">+${u.revenue}</p>
                            <p className="text-[10px] text-slate-600">Today</p>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <p className="text-slate-500 text-sm">No recent sales.</p>}
            </div>
        </div>
      </div>

      {/* DETAILED USER TABLE */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Premium Subscribers</h3>
            <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
                TOTAL: {users.length}
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-400 font-mono uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Usage (Sessions)</th>
                        <th className="px-6 py-4">Revenue</th>
                        <th className="px-6 py-4">Renewal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map((u: UserAnalytics) => (
                        <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={u.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={14} className="text-slate-500"/>
                                    <span className="text-white font-mono">{u.usageCount}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-green-400">
                                ${u.revenue}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-500"/>
                                    <span className="text-slate-300 font-mono text-xs">
                                        {u.nextBillingDate}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${u.daysRemaining < 3 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"}`}>
                                        {u.daysRemaining} days left
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function KPICard({ title, value, icon: Icon, color, trend }: any) {
    return (
        <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={60} />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">{title}</p>
                <h2 className="text-4xl font-bold text-white mb-2">{value}</h2>
                <div className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${color}`}>
                    {trend}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'active') return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold uppercase border border-green-500/30">Active</span>;
    if (status === 'canceled') return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold uppercase border border-red-500/30">Canceled</span>;
    return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold uppercase border border-yellow-500/30">{status}</span>;
}