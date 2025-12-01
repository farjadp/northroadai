// ============================================================================
// 📁 Hardware Source: src/app/admin/layout.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v3.0 (Admin Guard & Nav)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Admin Dashboard Layout with Access Guard.
// - Navigation for Admin modules including Mentors.
// ============================================================================

"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Database, Settings, LogOut, TerminalSquare, KeySquare } from "lucide-react";
import { cn } from "@/lib/utils"; // مطمئن شوید فایل utils دارید یا این را حذف کنید
import { useAuth } from "@/context/auth-context";

// --- REUSING THE SPOTLIGHT EFFECT ---
function AdminSpotlight({ children }: { children: React.ReactNode }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative min-h-screen bg-black text-slate-300 selection:bg-cyan-500/30 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.08), transparent 40%)`,
        }}
      />
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 flex h-screen">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAdmin } = useAuth();

  const navItems = [
    { name: "Overview", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Users", href: "/admin/users", icon: <Users size={18} /> },
    { name: "Guest Chats", href: "/admin/guest-chats", icon: <TerminalSquare size={18} /> },
    { name: "Founders", href: "/admin/founders", icon: <Users size={18} /> },
    { name: "Knowledge Base", href: "/admin/knowledge", icon: <Database size={18} /> },
    { name: "Packages", href: "/admin/packages", icon: <KeySquare size={18} /> },
    { name: "Chat Settings", href: "/admin/settings/chat", icon: <Settings size={18} /> },
    { name: "Mentors", href: "/dashboard/mentors", icon: <Users size={18} /> },
    { name: "System Logs", href: "/admin/logs", icon: <TerminalSquare size={18} /> },
  ];

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/login");
    }
  }, [loading, isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-slate-300 flex items-center justify-center">
        {loading ? "Checking access..." : "Access denied. Admins only."}
      </div>
    );
  }

  return (
    <AdminSpotlight>
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-md flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-cyan-900/20 border border-cyan-500/50 rounded flex items-center justify-center text-cyan-400 font-bold text-xs">
              NR
            </div>
            <span className="font-mono font-bold text-white tracking-tight">ADMIN_CORE</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-mono transition-all duration-300 ${isActive
                    ? "bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                    }`}>
                    {item.icon}
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 px-3 py-2 text-red-400/70 hover:text-red-400 cursor-pointer transition text-sm font-mono">
            <LogOut size={16} />
            <span>Terminate Session</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {children}
      </main>
    </AdminSpotlight>
  );
}
