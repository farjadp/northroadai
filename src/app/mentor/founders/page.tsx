// ============================================================================
// 📁 Hardware Source: src/app/mentor/founders/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Display list of founders assigned to this mentor.
// - Quick access to founder profiles and sessions.
// ============================================================================

"use client";

import React from "react";
import { Users } from "lucide-react";

export default function MentorFounders() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="p-2 bg-amber-950/20 rounded-lg text-amber-500 border border-amber-900/50">
                    <Users size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Founders</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-mono mt-1">
                        ASSIGNED CONNECTIONS • TRACK PROGRESS
                    </p>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                    <div className="p-4 bg-amber-950/20 rounded-full inline-flex mb-6 border border-amber-900/50">
                        <Users size={48} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
                    <p className="text-slate-400 mb-6">
                        This page will display all founders assigned to you, with detailed analytics and session history.
                    </p>
                    <div className="text-xs text-slate-600 font-mono">
                        MODULE STATUS: IN DEVELOPMENT
                    </div>
                </div>
            </div>

        </div>
    );
}
