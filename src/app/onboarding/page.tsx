// ============================================================================
// 📁 Hardware Source: src/app/onboarding/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v2.0 (Client-Side Logic)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Writes role directly to Firestore using Client SDK.
// 2. Redirects user to the correct dashboard.
// ============================================================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // توابع دیتابیس
import { db } from "@/lib/firebase"; // اتصال دیتابیس
import { User, Rocket, Loader2, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, refreshUserRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<"founder" | "mentor" | null>(null);

  const handleSelectRole = async (role: "founder" | "mentor") => {
    if (!user) return;
    setLoading(role);

    try {
      console.log(`Setting role to ${role} for user ${user.uid}...`);

      // 1. ذخیره مستقیم در فایراستور
      const userRef = doc(db, "users", user.uid);
      
      await setDoc(userRef, {
        role: role,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: serverTimestamp(),
        // اگر فیلد createdAt نیست، یعنی بار اول است
        createdAt: serverTimestamp() 
      }, { merge: true }); // merge: true یعنی اطلاعات قبلی پاک نشود
      
      console.log("Role saved to Firestore.");

      // 2. رفرش کردن کانتکست (تا اپ بفهمد نقش عوض شده)
      await refreshUserRole();

      // 3. هدایت به مسیر درست
      if (role === "founder") {
        router.push("/dashboard/profile"); // فاندر میره پروفایل استارتاپ بسازه
      } else {
        router.push("/mentor/profile/edit"); // منتور میره پروفایل شخصی بسازه
      }

    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("Failed to save role. Check console for details.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Path</span>.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            North Road connects visionary builders with experienced guides. How will you participate?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Founder Card */}
          <button
            onClick={() => handleSelectRole("founder")}
            disabled={!!loading}
            className="group relative p-8 rounded-3xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 transition-all hover:border-cyan-500/50 text-left disabled:opacity-50"
          >
            <div className="absolute top-6 right-6 p-3 bg-cyan-950/30 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
              {loading === "founder" ? <Loader2 className="animate-spin" /> : <Rocket size={32} />}
            </div>
            <div className="mt-12 space-y-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">I am a Founder</h3>
              <p className="text-slate-400 leading-relaxed">
                I'm building a startup. I need AI tools, mentorship, and a roadmap to scale my business.
              </p>
              <ul className="space-y-2 pt-4">
                {["AI Copilot", "Traction Roadmap", "Investor Matching"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle2 size={14} className="text-cyan-500"/> {item}
                    </li>
                ))}
              </ul>
            </div>
          </button>

          {/* Mentor Card */}
          <button
            onClick={() => handleSelectRole("mentor")}
            disabled={!!loading}
            className="group relative p-8 rounded-3xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 transition-all hover:border-amber-500/50 text-left disabled:opacity-50"
          >
            <div className="absolute top-6 right-6 p-3 bg-amber-950/30 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
               {loading === "mentor" ? <Loader2 className="animate-spin" /> : <User size={32} />}
            </div>
            <div className="mt-12 space-y-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">I am a Mentor</h3>
              <p className="text-slate-400 leading-relaxed">
                I want to guide founders, share my expertise, and track the impact of my mentorship sessions.
              </p>
              <ul className="space-y-2 pt-4">
                {["Founder Tracking", "Impact Analytics", "Paid Sessions"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle2 size={14} className="text-amber-500"/> {item}
                    </li>
                ))}
              </ul>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
}