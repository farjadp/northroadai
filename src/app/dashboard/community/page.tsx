"use client";
import React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Construction size={40} className="text-slate-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Module Under Construction</h1>
      <p className="text-slate-400 max-w-md mb-8">
        We are curating a list of top-tier mentors and building a private community for founders. This module will unlock in the next update.
      </p>
      <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-widest rounded hover:bg-slate-200 transition">
        Return to Mission Control
      </Link>
    </div>
  );
}