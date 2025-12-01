// ============================================================================
// 📁 Hardware Source: src/components/top-nav.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Global Top Navigation)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Renders consistent header links (About, Protocol, Manifesto, Access).
// - Shows login/initialize button and highlights active route.
// ============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type TopNavProps = {
  className?: string;
  translucent?: boolean;
};

export function TopNav({ className, translucent = false }: TopNavProps) {
  const pathname = usePathname();

  const items = [
    { label: "About", href: "/about" },
    { label: "Protocol", href: "/protocol" },
    { label: "Manifesto", href: "/manifesto" },
    { label: "Access", href: "/access" },
  ];

  return (
    <header
      className={cn(
        "w-full flex items-center justify-between px-6 md:px-10 py-6 z-50",
        translucent && "bg-black/40 backdrop-blur-md border-b border-white/5",
        className
      )}
    >
      <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-mono">
        N<span className="text-cyan-500">R</span>_AI
      </Link>

      <nav className="hidden md:flex gap-8 text-sm font-mono text-slate-400">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-cyan-400 transition-colors duration-300",
                active && "text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/login">
        <button className="px-6 py-2 text-xs font-bold uppercase tracking-widest border border-slate-800 hover:border-cyan-500 hover:bg-cyan-500/10 text-white transition-all duration-500">
          Initialize
        </button>
      </Link>
    </header>
  );
}
