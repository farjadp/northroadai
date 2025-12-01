// ============================================================================
// 📁 Hardware Source: src/app/login/page.tsx
// 🕒 Date: 2025-11-29 16:45
// 🧠 Version: v1.2 (Google Workspace Gate)
// ----------------------------------------------------------------------------
// ✅ Features:
// 1) Clean, minimalist UI matching the "North Road" aesthetic.
// 2) Direct integration with Google Auth.
// 3) Auto-redirect to Dashboard upon success.
// ============================================================================

// src/app/login/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { user, loginWithGoogle, loading, userRole } = useAuth();
  const router = useRouter();

  // "Traffic Cop" Logic
  useEffect(() => {
    if (!loading && user) {
      if (userRole === "mentor") {
        router.push("/mentor/dashboard");
      } else if (userRole === "founder") {
        router.push("/dashboard");
      } else if (userRole === "admin") {
        router.push("/admin");
      } else {
        // کاربر لاگین کرده ولی نقش ندارد -> برو آنبوردینگ
        router.push("/onboarding");
      }
    }
  }, [user, loading, userRole, router]);

  const handleLogin = async () => {
    await loginWithGoogle();
    // useEffect بالا بقیه کار را انجام میدهد
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[100px]" />
      
      <div className="z-10 text-center space-y-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white tracking-tighter">
          North Road <span className="text-blue-500">AI</span>
        </h1>
        
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <h2 className="text-xl text-white font-medium mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-8">Access your startup command center.</p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G"/>
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-slate-600">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}