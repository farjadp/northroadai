// ============================================================================
// 📁 Hardware Source: src/app/dashboard/settings/page.tsx
// 🕒 Date: 2025-12-04
// 🧠 Version: v5.0 (All Features Restored + Better Design)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Gamification Header (XP/Level).
// 2. Billing: Upgrade UI (Restored) + Invoices + Portal.
// 3. Critical: Role Switcher + Safe Delete.
// 4. Activity & Legal Tabs.
// ============================================================================

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchUserHistory } from "@/lib/api-services";
import {
    User, CreditCard, History, Trophy, Star, Crown, Zap, CheckCircle2,
    Shield, AlertTriangle, ArrowRightLeft, Trash2, Scale, Lock, Loader2, LogOut, Swords, MessageSquare, FileText, Download, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProfileTab } from "@/components/settings/profile-tab";
import { getApiUrl } from "@/lib/api-config";

export default function SettingsPage() {
    const { user, userTier, userRole, refreshUserRole, logout } = useAuth();
    const isPremium = (userTier as string) === "ROCKET" || (userTier as string) === "AGENCY";
    const [activeTab, setActiveTab] = useState<"profile" | "billing" | "activity" | "legal" | "critical">("profile");

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Delete Account States
    const [deleteStep, setDeleteStep] = useState(0);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (user?.uid) {
            user.getIdToken().then(token => {
                fetchUserHistory(user.uid, token).then(res => {
                    setData(res);
                    setLoading(false);
                });
            });
        }
    }, [user]);

    // --- ACTIONS ---

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const handlePortal = async () => {
        setProcessing(true);
        try {
            const res = await fetch(getApiUrl("/api/stripe/portal"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?.uid })
            });
            const d = await res.json();
            if (d.url) window.location.href = d.url;
        } catch (e) { alert("Error connecting to Stripe."); }
        setProcessing(false);
    };

    const handleUpgrade = async () => {
        setProcessing(true);
        try {
            const res = await fetch(getApiUrl("/api/stripe/checkout"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.uid,
                    userEmail: user?.email,
                    agentId: "subscription"
                })
            });
            const d = await res.json();
            if (d.url) window.location.href = d.url;
        } catch (e) { alert("Upgrade failed."); }
        setProcessing(false);
    };

    const handleRoleSwitch = async () => {
        if (!user) return;
        const targetRole = userRole === "mentor" ? "founder" : "mentor";

        if (!confirm(`Switch to ${targetRole.toUpperCase()} mode?`)) return;

        setProcessing(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { role: targetRole });
            await refreshUserRole();
            if (targetRole === "mentor") router.push("/mentor/dashboard");
            else router.push("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to switch role.");
        } finally {
            setProcessing(false);
        }
    };

    const handleSoftDelete = async () => {
        if (deleteConfirmText !== "DELETE") return;
        if (!user) return;

        setProcessing(true);
        try {
            const deletionDate = new Date();
            deletionDate.setMonth(deletionDate.getMonth() + 6);

            await updateDoc(doc(db, "users", user.uid), {
                accountStatus: "scheduled_for_deletion",
                deletedAt: serverTimestamp(),
                permanentDeleteDate: Timestamp.fromDate(deletionDate),
                isActive: false
            });

            alert("Account deactivated. Data will be wiped in 6 months.");
            await handleLogout();
        } catch (error) {
            console.error(error);
            alert("Delete failed.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-cyan-500" /></div>;

    const { gamification } = data || { gamification: { xp: 0, level: 1, nextLevelXp: 1000, badges: [], stats: { arenaCount: 0 } } };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24">

            {/* --- HEADER: GAMIFICATION (RESTORED) --- */}
            <div className="relative bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar Ring */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-[#1a1a1a] bg-black flex items-center justify-center overflow-hidden shadow-lg">
                            {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-500" />}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-[#1a1a1a] shadow-lg">
                            LVL {gamification.level}
                        </div>
                    </div>

                    {/* Stats & Progress */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {user?.displayName}
                                {isPremium && <Zap size={16} className="text-cyan-400 fill-cyan-400" />}
                            </h2>
                            <div className="flex gap-2 mt-2 md:mt-0">
                                {gamification.badges.map((b: string) => (
                                    <div key={b} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-300 flex items-center gap-1" title={b}>
                                        <Crown size={12} className={b.includes("Pro") ? "text-green-400" : "text-slate-400"} /> {b}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-6 text-xs text-slate-400 mb-4 font-mono">
                            <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500" /> {gamification.xp} XP Earned</span>
                            <span className="flex items-center gap-1.5"><Swords size={14} className="text-red-500" /> {gamification.stats.arenaCount} Battles</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-2 border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(gamification.xp / gamification.nextLevelXp) * 100}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 relative"
                            >
                                <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                            </motion.div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono text-right">
                            NEXT LEVEL IN {gamification.nextLevelXp - gamification.xp} XP
                        </p>
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
                {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "billing", label: "Membership", icon: CreditCard },
                    { id: "activity", label: "History", icon: History },
                    { id: "legal", label: "Legal", icon: Scale },
                    { id: "critical", label: "Danger Zone", icon: AlertTriangle, color: "text-red-500" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "border-cyan-500 text-white bg-white/[0.02]"
                            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]"
                            } ${tab.color || ""}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">

                {/* --- 1. PROFILE --- */}
                {/* --- 1. PROFILE TAB --- */}
                {activeTab === "profile" && (
                    <ProfileTab
                        user={user}
                        userRole={userRole}
                        initialData={data?.rawData} // دیتای KYC اینجا میره
                    />
                )}

                {/* --- 2. BILLING (RESTORED FEATURES) --- */}
                {activeTab === "billing" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                        {/* Status Bar */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${isPremium ? "bg-green-900/20 text-green-400" : "bg-slate-800 text-slate-400"}`}>
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Current Plan</h3>
                                    <p className={`text-sm ${isPremium ? "text-green-400" : "text-slate-500"}`}>
                                        {isPremium ? "ROCKET (Premium)" : "BICYCLE (Free Tier)"}
                                    </p>
                                </div>
                            </div>
                            {isPremium && (
                                <button onClick={handlePortal} disabled={processing} className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 disabled:opacity-50 transition w-full md:w-auto">
                                    {processing ? <Loader2 className="animate-spin" /> : "Manage on Stripe"}
                                </button>
                            )}
                        </div>

                        {/* Pricing Cards (Only if NOT Premium) */}
                        {!isPremium && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Free */}
                                <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col grayscale opacity-60">
                                    <h3 className="text-xl font-bold text-white">Bicycle</h3>
                                    <p className="text-3xl font-black my-4 text-white">$0 <span className="text-sm font-normal text-slate-500">/mo</span></p>
                                    <ul className="space-y-3 text-sm text-slate-400 mb-8 flex-1">
                                        <li>• Limited Chat Access</li>
                                        <li>• Basic Arena Mode</li>
                                        <li>• No Document Uploads</li>
                                    </ul>
                                    <button disabled className="w-full py-4 rounded-xl border border-white/10 text-slate-400 text-xs font-bold uppercase">Current Plan</button>
                                </div>

                                {/* Pro */}
                                <div className="p-8 rounded-3xl border border-cyan-500/50 bg-cyan-950/10 relative overflow-hidden flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                                    <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-4 py-1 rounded-bl-xl">RECOMMENDED</div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap size={20} className="text-cyan-400 fill-cyan-400" /> Rocket</h3>
                                    <p className="text-3xl font-black my-4 text-white">$9 <span className="text-sm font-normal text-slate-400">/mo</span></p>
                                    <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Unlimited AI Mentorship</li>
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Full Arena Access + Reports</li>
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Legal & Finance Agents</li>
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Priority Support</li>
                                    </ul>
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={processing}
                                        className="w-full py-4 rounded-xl bg-cyan-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                    >
                                        {processing ? "Processing..." : "Upgrade to Pro"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Invoice History (Restored) */}
                        {data?.invoices?.length > 0 && (
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Billing History</h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {data.invoices.map((inv: any) => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white/5 text-slate-400 rounded-lg"><FileText size={18} /></div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">{inv.date}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">{inv.number}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-white font-mono font-bold text-sm">${inv.amount}</span>
                                                <a href={inv.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition">
                                                    <Download size={12} /> Invoice
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 3. ACTIVITY --- */}
                {activeTab === "activity" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 pl-2">Session Log</h3>
                        {data?.activities.map((act: any) => (
                            <div key={act.id} className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition">
                                <div className={`p-3 rounded-lg ${act.type === 'arena' ? 'bg-red-900/10 text-red-500 border border-red-500/20' : 'bg-blue-900/10 text-blue-500 border border-blue-500/20'}`}>
                                    {act.type === 'arena' ? <Swords size={20} /> : <MessageSquare size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm truncate">{act.title}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{act.type} • {act.date}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-600" />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- 4. LEGAL --- */}
                {activeTab === "legal" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-3xl">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Scale size={20} className="text-slate-400" /> Platform Terms & Usage
                            </h3>
                            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
                                <div>
                                    <h4 className="text-white font-bold mb-1">1. AI Limitations</h4>
                                    <p className="opacity-80">PIRAI is an artificial intelligence. It may hallucinate facts. Always verify critical financial and legal advice with a human professional.</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">2. Data Privacy</h4>
                                    <p className="opacity-80">Your "Startup DNA" and uploaded files are used solely to provide context for your mentorship. We do not sell your data to third parties.</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">3. Payments & Refunds</h4>
                                    <p className="opacity-80">All payments are processed securely via Stripe. Refunds are handled on a case-by-case basis within 7 days of purchase.</p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10 flex gap-6">
                                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline">Terms of Service</a>
                                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 5. CRITICAL --- */}
                {activeTab === "critical" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-2xl">

                        {/* A. Role Switcher */}
                        <div className="bg-amber-950/10 border border-amber-900/30 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 text-amber-500"><ArrowRightLeft size={80} /></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-2">Switch Context</h3>
                                <p className="text-slate-400 text-sm mb-6 max-w-md">
                                    Toggle between <strong>Founder</strong> and <strong>Mentor</strong> views. Your data is preserved for each role separately.
                                </p>
                                <button
                                    onClick={handleRoleSwitch}
                                    disabled={processing}
                                    className="px-4 py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-500 border border-amber-500/50 rounded-lg transition text-sm font-bold flex items-center gap-2"
                                >
                                    {processing ? <Loader2 className="animate-spin" size={16} /> : <ArrowRightLeft size={16} />}
                                    Switch to {userRole === "mentor" ? "Founder" : "Mentor"} Mode
                                </button>
                            </div>
                        </div>

                        {/* B. Delete Account */}
                        <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 text-red-500"><Trash2 size={80} /></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>

                                {deleteStep === 0 && (
                                    <>
                                        <p className="text-slate-400 text-sm mb-6 max-w-md">
                                            Permanently delete your account and all associated data. This action triggers a 6-month data retention period for legal auditing before permanent wipe.
                                        </p>
                                        <button
                                            onClick={() => setDeleteStep(1)}
                                            className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-500 transition"
                                        >
                                            Request Deletion
                                        </button>
                                    </>
                                )}

                                {deleteStep === 1 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="bg-red-950/40 p-4 rounded-lg border border-red-500/30 mb-4 text-xs text-red-200">
                                            <p className="font-bold mb-2 uppercase flex items-center gap-2"><Lock size={12} /> Security Retention Policy</p>
                                            <ul className="list-disc pl-4 space-y-1 opacity-80">
                                                <li>Your account will be <strong>deactivated immediately</strong>.</li>
                                                <li>Your data will be kept in a "Soft Delete" state for <strong>6 months</strong>.</li>
                                                <li>After 6 months, all data is permanently wiped.</li>
                                            </ul>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setDeleteStep(0)} className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg font-medium hover:bg-slate-700">Cancel</button>
                                            <button onClick={() => setDeleteStep(2)} className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-500">I Understand, Continue</button>
                                        </div>
                                    </motion.div>
                                )}

                                {deleteStep === 2 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <p className="text-slate-300 text-sm mb-2">
                                            To confirm, type <span className="font-bold text-white bg-red-900/50 px-1 rounded">DELETE</span> below:
                                        </p>
                                        <input
                                            type="text"
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            className="w-full bg-black/50 border border-red-500/30 rounded-lg p-3 text-white outline-none mb-4 focus:border-red-500 focus:bg-black transition-colors placeholder:text-slate-700"
                                            placeholder="Type DELETE here..."
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => setDeleteStep(0)} className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg font-medium hover:bg-slate-700">Cancel</button>
                                            <button
                                                onClick={handleSoftDelete}
                                                disabled={deleteConfirmText !== "DELETE" || processing}
                                                className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                            >
                                                {processing ? "Deactivating..." : "Confirm Deactivation"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}