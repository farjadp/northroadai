// ============================================================================
// 📁 Hardware Source: src/app/mentor/layout.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v2.0 (Overseer Mode with Navigation)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Enforces "Mentor" role access.
// - Sidebar navigation menu.
// - "Overseer Mode" aesthetic (Gold/Slate/Deep Black).
// ============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { UserService } from "@/lib/user-service";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
    Shield,
    LayoutDashboard,
    User,
    Users,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";

const MENU_ITEMS = [
    { id: "dashboard", label: "Overseer Console", icon: LayoutDashboard, path: "/mentor/dashboard" },
    { id: "profile", label: "Profile", icon: User, path: "/mentor/profile/edit" },
    { id: "founders", label: "My Founders", icon: Users, path: "/mentor/founders" },
    { id: "settings", label: "Settings", icon: Settings, path: "/mentor/settings" }
];

export default function MentorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const isMentor = await UserService.isMentor(user.uid);
                if (isMentor) {
                    setAuthorized(true);
                    setUserEmail(user.email);
                } else {
                    router.push("/dashboard");
                }
            } else {
                router.push("/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center text-amber-500 font-mono">
                INITIALIZING UPLINK...
            </div>
        );
    }

    if (!authorized) return null;

    return (
        <div className="min-h-screen bg-[#020202] text-slate-300 font-sans selection:bg-amber-500/20 selection:text-amber-200">

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-[#0a0a0a] border-r border-white/10 transition-all duration-300 z-50 ${sidebarOpen ? "w-64" : "w-20"
                }`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center w-full"}`}>
                        <div className="p-2 bg-amber-950/20 rounded-lg border border-amber-900/50">
                            <Shield size={20} className="text-amber-500" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-bold text-white uppercase text-sm tracking-wider">
                                Mentor <span className="text-amber-500">HQ</span>
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/5 rounded-lg transition text-slate-400 hover:text-white"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {MENU_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");

                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                    ? "bg-amber-950/20 border border-amber-500/50 text-amber-200"
                                    : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} className={isActive ? "text-amber-500" : ""} />
                                {sidebarOpen && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info + Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    {sidebarOpen ? (
                        <div className="mb-3">
                            <p className="text-xs text-slate-500 font-mono mb-1">LOGGED IN AS</p>
                            <p className="text-sm text-white truncate">{userEmail}</p>
                        </div>
                    ) : null}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 hover:text-red-300 transition text-sm"
                    >
                        <LogOut size={16} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>

            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                {children}
            </main>

        </div>
    );
}
