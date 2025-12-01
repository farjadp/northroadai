// src/components/role-switcher.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowRightLeft, Loader2, AlertTriangle } from "lucide-react";

export function RoleSwitcher() {
  const { user, userRole, refreshUserRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const targetRole = userRole === "mentor" ? "founder" : "mentor";

  const handleSwitch = async () => {
    if (!user) return;
    if (!confirm(`Are you sure you want to switch to ${targetRole.toUpperCase()} mode?`)) return;

    setLoading(true);
    try {
      // 1. آپدیت دیتابیس
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { role: targetRole });

      // 2. رفرش کردن کانتکست (حیاتی)
      await refreshUserRole();

      // 3. هدایت به داشبورد جدید
      if (targetRole === "mentor") {
        router.push("/mentor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to switch role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6 mt-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-900/20 rounded-lg text-red-500">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">Change Role</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            You are currently viewing North Road as a <span className="text-white font-mono uppercase">{userRole}</span>. 
            If you selected this by mistake, or want to switch contexts, you can toggle your role below.
            <br/>
            <span className="text-xs text-red-400 mt-1 block opacity-70">
              * Your profile data for the current role will be saved, but hidden until you switch back.
            </span>
          </p>
          
          <button
            onClick={handleSwitch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg transition text-sm font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRightLeft size={16} />}
            Switch to {targetRole === "mentor" ? "Mentor" : "Founder"} Mode
          </button>
        </div>
      </div>
    </div>
  );
}