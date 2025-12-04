// src/app/actions/admin-stats.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function getSystemStats() {
  try {
    // 1. Total Users (Approximate)
    const usersSnap = await adminDb.collection("users").count().get();
    const totalUsers = usersSnap.data().count;

    // 2. Active Chats (Today)
    // برای سرعت، ما فقط تعداد داکیومنت‌های guest_chats رو میشماریم 
    // یا اگر collection group برای sessions داریم
    const chatsSnap = await adminDb.collection("guest_chats").count().get();
    const totalChats = chatsSnap.data().count;

    // 3. Premium Users
    const premiumSnap = await adminDb.collection("users").where("isPremium", "==", true).count().get();
    const totalPremium = premiumSnap.data().count;

    // 4. Recent Logs (Last 10 activities)
    // فرض میکنیم یک کالکشن system_logs داریم (اگر ندارید پایین میگم چطور بسازید)
    // فعلا از guest_chats به عنوان لاگ استفاده میکنیم
    const logsSnap = await adminDb.collection("guest_chats")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
        
    const logs = logsSnap.docs.map(doc => ({
        id: doc.id,
        action: "Guest Chat",
        user: doc.data().ip || "Unknown",
        details: doc.data().message?.substring(0, 50) + "...",
        timestamp: doc.data().createdAt?.toDate().toISOString()
    }));

    return {
      stats: {
        users: totalUsers,
        chats: totalChats,
        premium: totalPremium,
        revenue: totalPremium * 9 // $9 per user (Simple Math)
      },
      logs
    };

  } catch (error) {
    console.error("Stats Error:", error);
    return { stats: { users: 0, chats: 0, premium: 0, revenue: 0 }, logs: [] };
  }
}