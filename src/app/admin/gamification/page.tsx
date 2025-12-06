// ============================================================================
// 📁 Hardware Source: src/app/admin/gamification/page.tsx
// 🕒 Date: 2025-12-04
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Lists all Action Types.
// 2. Allows editing XP values.
// 3. Saves to 'settings/gamification'.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Loader2, Trophy, Gamepad2 } from "lucide-react";

type ActionType = "CHAT_MSG" | "ARENA_BATTLE" | "COMPLETE_DNA" | "UPLOAD_FILE" | "DAILY_LOGIN";

const ACTIONS: { key: ActionType; label: string }[] = [
    { key: "CHAT_MSG", label: "Chat Message" },
    { key: "ARENA_BATTLE", label: "Arena Battle" },
    { key: "COMPLETE_DNA", label: "Complete Startup DNA" },
    { key: "UPLOAD_FILE", label: "Upload Knowledge File" },
    { key: "DAILY_LOGIN", label: "Daily Login" },
];

export default function GamificationAdminPage() {
    const [values, setValues] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, "settings", "gamification");
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setValues(snap.data() as Record<string, number>);
            } else {
                // Defaults
                setValues({
                    "CHAT_MSG": 5,
                    "ARENA_BATTLE": 50,
                    "COMPLETE_DNA": 500,
                    "UPLOAD_FILE": 20,
                    "DAILY_LOGIN": 10
                });
            }
        } catch (err) {
            console.error("Failed to load settings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, "settings", "gamification");
            await setDoc(docRef, values);
            alert("Gamification settings saved!");
        } catch (err) {
            console.error("Failed to save", err);
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, val: string) => {
        setValues(prev => ({ ...prev, [key]: parseInt(val) || 0 }));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-white"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-500/30">
                        <Gamepad2 size={32} className="text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gamification Engine</h1>
                        <p className="text-slate-400">Configure XP rewards for user actions.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ACTIONS.map((action) => (
                    <div key={action.key} className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Trophy size={20} className="text-yellow-500" />
                                </div>
                                <label className="font-bold text-lg">{action.label}</label>
                            </div>
                            <span className="text-xs font-mono text-slate-500">{action.key}</span>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                value={values[action.key] || 0}
                                onChange={(e) => handleChange(action.key, e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xl font-mono text-purple-400 focus:border-purple-500 outline-none transition-colors"
                            />
                            <span className="absolute right-4 top-3.5 text-sm text-slate-500 font-bold">XP</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
