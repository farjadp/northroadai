"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    MessageSquare,
    Swords,
    User,
    Users,
    Settings
} from "lucide-react";

export function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: LayoutGrid, label: "Home" },
        { href: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
        { href: "/dashboard/arena", icon: Swords, label: "Arena" },
        { href: "/dashboard/profile", icon: User, label: "DNA" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 md:hidden pb-safe">
            <div className="flex justify-around items-center p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const isArena = item.href === "/dashboard/arena";

                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 p-2 w-full">
                            <div className={`p-1.5 rounded-xl transition-all ${isActive
                                    ? (isArena ? "text-red-500 bg-red-900/20" : "text-cyan-400 bg-cyan-900/20")
                                    : "text-slate-500 hover:text-slate-300"
                                }`}>
                                <Icon size={20} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? (isArena ? "text-red-500" : "text-cyan-400") : "text-slate-600"
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
