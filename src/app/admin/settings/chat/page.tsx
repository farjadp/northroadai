"use client";
import React, { useEffect, useState } from "react";
import { Save, AlertTriangle } from "lucide-react";

export default function ChatSettingsPage() {
    const [limit, setLimit] = useState<number>(5);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings/chat');
                const data = await res.json();
                if (data.limit !== undefined) {
                    setLimit(data.limit);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/settings/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: Number(limit) }),
            });

            if (!res.ok) throw new Error("Failed to save");

            setMessage({ type: 'success', text: "Settings updated successfully." });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update settings." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-400 font-mono">Loading configuration...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Chat Settings</h1>
                <p className="text-slate-500 text-sm font-mono">Configure the behavior of the public guest chat.</p>
            </header>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                        Daily Message Limit (Per Guest)
                    </label>
                    <p className="text-xs text-slate-500 mb-4">
                        How many messages can a guest send per day before being blocked?
                        This helps prevent abuse and manage API costs.
                    </p>

                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            min="0"
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="bg-black border border-slate-700 rounded-lg px-4 py-2 text-white w-32 focus:border-cyan-500 outline-none transition-colors font-mono"
                        />
                        <span className="text-slate-500 text-sm">messages / day</span>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-3 rounded-lg text-sm font-mono flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 'bg-red-900/20 text-red-400 border border-red-500/20'
                        }`}>
                        {message.type === 'error' && <AlertTriangle size={14} />}
                        {message.text}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
