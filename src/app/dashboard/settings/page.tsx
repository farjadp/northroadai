// src/app/dashboard/settings/page.tsx
"use client";

import React from "react";
import { Settings, Sliders } from "lucide-react";
import { RoleSwitcher } from "@/components/role-switcher";

export default function FounderSettings() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
             <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                    <Sliders size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 text-sm">Manage your account and startup preferences.</p>
                </div>
            </div>

            {/* Other settings... */}
            
            {/* Role Switcher */}
            <RoleSwitcher />
        </div>
    );
}