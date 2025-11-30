import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: "dark" | "light" | "neon";
}

export function GlassCard({ 
  children, 
  className, 
  hoverEffect = false,
  variant = "dark" 
}: GlassCardProps) {
  
  const baseStyles = "rounded-2xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden";
  
  const variants = {
    dark: "bg-[#0a0a0a]/80 border-white/10",
    light: "bg-white/5 border-white/10",
    neon: "bg-cyan-900/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
  };

  const hoverStyles = hoverEffect 
    ? "hover:border-cyan-500/30 hover:-translate-y-1 hover:shadow-lg" 
    : "";

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)}>
      {/* Noise Texture (optional, adds realism) */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}