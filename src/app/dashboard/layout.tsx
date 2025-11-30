// ============================================================================
// 📁 Hardware Source: src/app/dashboard/layout.tsx
// 🕒 Date: 2025-11-29 17:00
// 🧠 Version: v1.1 (Connected Shell)
// ----------------------------------------------------------------------------
// ✅ Changes:
// 1) Integrated useAuth() to fetch real user data.
// 2) Display Google Avatar instead of placeholder.
// 3) Logout button is now functional.
// ============================================================================

"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // useRouter added
import { useAuth } from "@/context/auth-context"; // Auth hook added
import { 
  User, 
  MessageSquare, 
  LayoutGrid, 
  Settings, 
  Zap,
  LogOut,
  Users // Icon for mentors
} from "lucide-react";

// --- SPOTLIGHT WRAPPER ---
function DashboardSpotlight({ children }: { children: React.ReactNode }) {
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
      className="relative min-h-screen bg-[#050505] text-slate-300 selection:bg-cyan-500/30 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.06), transparent 40%)`,
        }}
      />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
      <div className="relative z-10 flex h-screen">{children}</div>
    </div>
  );
}

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth(); // <--- Get User & Logout

  const handleLogout = async () => {
    await logout();
    router.push("/login"); // Redirect after logout
  };

  const navItems = [
    { name: "Mission Control", href: "/dashboard", icon: <LayoutGrid size={18} /> },
    { name: "PIRAI Chat", href: "/dashboard/chat", icon: <MessageSquare size={18} /> },
    { name: "Startup DNA", href: "/dashboard/profile", icon: <User size={18} /> },
    { name: "Mentors", href: "/dashboard/mentors", icon: <Users size={18} /> },
    { name: "Community", href: "/dashboard/community", icon: <Users size={18} /> },
  ];

  return (
    <DashboardSpotlight>
      {/* --- SIDEBAR --- */}
      <aside className="w-20 md:w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6 transition-all duration-300">
        <div>
          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-10 md:px-2 justify-center md:justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(8,145,178,0.4)]">
              NR
            </div>
            <span className="font-mono font-bold text-white tracking-tight hidden md:block">NORTH ROAD</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive 
                      ? "bg-white/5 text-white border border-white/10 shadow-inner" 
                      : "text-slate-500 hover:text-cyan-400 hover:bg-white/5"
                  }`}>
                    <div className={isActive ? "text-cyan-400" : "group-hover:text-cyan-400 transition"}>
                        {item.icon}
                    </div>
                    <span className="hidden md:block">{item.name}</span>
                    {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] hidden md:block"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
            {/* User Profile Mini-Card */}
            <div className="flex items-center gap-3 px-2 md:px-0 justify-center md:justify-start">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                    <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse"></div>
                )}
                <div className="hidden md:block overflow-hidden">
                    <p className="text-xs text-white font-bold truncate w-32">{user?.displayName || "Founder"}</p>
                    <p className="text-[10px] text-slate-500 truncate w-32">{user?.email}</p>
                </div>
            </div>
            
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-red-400 cursor-pointer transition text-sm font-medium justify-center md:justify-start"
            >
                <LogOut size={18} />
                <span className="hidden md:block">Disconnect</span>
            </button>
        </div>
      </aside>

      {/* --- CONTENT WRAPPER --- */}
      <main className="flex-1 overflow-y-auto relative">
         <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40">
             <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 SYSTEM: ONLINE
             </div>
             {/* Header Avatar (Mobile/Desktop) */}
             <div className="flex items-center gap-4">
                 {user?.photoURL && (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
                 )}
             </div>
         </header>
         
         <div className="p-8 md:p-12 pb-24 max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </DashboardSpotlight>
  );
}