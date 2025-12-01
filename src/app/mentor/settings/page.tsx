// ============================================================================
// 📁 Hardware Source: src/app/mentor/settings/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.1 (Added Role Switcher)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Mentor preferences and settings.
// - Notification preferences, availability, etc.
// - Added: Ability to switch role to Founder via RoleSwitcher.
// ============================================================================

"use client";

import React from "react";
import { Settings } from "lucide-react";
import { RoleSwitcher } from "@/components/role-switcher"; // ✅ اضافه شده

export default function MentorSettings() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="p-2 bg-amber-950/20 rounded-lg text-amber-500 border border-amber-900/50">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Settings</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-mono mt-1">
                        CONFIGURE PREFERENCES • NOTIFICATIONS
                    </p>
                </div>
            </div>

            {/* Coming Soon (دست نخورده) */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center mb-12">
                <div className="max-w-md mx-auto">
                    <div className="p-4 bg-amber-950/20 rounded-full inline-flex mb-6 border border-amber-900/50">
                        <Settings size={48} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
                    <p className="text-slate-400 mb-6">
                        Configure your notification preferences, availability windows, and other mentor-specific settings.
                    </p>
                    <div className="text-xs text-slate-600 font-mono">
                        MODULE STATUS: IN DEVELOPMENT
                    </div>
                </div>
            </div>

            {/* ✅ Role Switcher Section (اضافه شده) */}
            <div className="border-t border-white/10 pt-8">
                <h2 className="text-xl font-bold text-white mb-6">Account Actions</h2>
                <div className="max-w-3xl">
                    <RoleSwitcher />
                </div>
            </div>

        </div>
    );
}