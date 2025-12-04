// ============================================================================
// 📁 Hardware Source: src/app/actions/user-history.ts
// 🕒 Date: 2025-12-04
// 🧠 Version: v2.0 (With Gamification & XP Logic)
// ============================================================================

"use server";

import { adminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function getUserHistory(userId: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();

    // 1. دریافت سشن‌ها (برای محاسبه امتیاز)
    const sessionsSnap = await adminDb
        .collection("users")
        .doc(userId)
        .collection("sessions")
        .orderBy("updatedAt", "desc")
        .get(); // همه را میگیریم برای محاسبه دقیق

    const sessions = sessionsSnap.docs.map(doc => doc.data());
    const arenaCount = sessions.filter(s => s.type === 'arena').length;
    const chatCount = sessions.filter(s => !s.type || s.type === 'chat').length;

    // 2. محاسبه امتیاز (XP)
    let xp = 100; // امتیاز پایه
    if (userData?.isPremium) xp += 1000;
    if (userData?.name) xp += 500; // فرض بر اینکه DNA پر شده
    xp += (arenaCount * 50);
    xp += (chatCount * 10);

    // 3. محاسبه سطح (Level)
    // Level 1: 0-500, Level 2: 500-1500, Level 3: 1500-3000...
    let level = 1;
    let nextLevelXp = 500;
    if (xp > 500) { level = 2; nextLevelXp = 1500; }
    if (xp > 1500) { level = 3; nextLevelXp = 3000; }
    if (xp > 3000) { level = 4; nextLevelXp = 5000; }
    if (xp > 5000) { level = 5; nextLevelXp = 10000; }

    const badges = [];
    if (userData?.isPremium) badges.push("Pro Member");
    if (arenaCount > 0) badges.push("Arena Survivor");
    if (arenaCount > 5) badges.push("Gladiator");
    if (chatCount > 10) badges.push("Curious Mind");

    // 4. دریافت فاکتورها (Stripe)
    let invoices: any[] = [];
    if (userData?.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-11-20.acacia",
            typescript: true,
        });
        const stripeInvoices = await stripe.invoices.list({
            customer: userData.stripeCustomerId,
            limit: 10,
            status: "paid"
        });
        invoices = stripeInvoices.data.map(inv => ({
            id: inv.id,
            date: new Date(inv.created * 1000).toLocaleDateString(),
            amount: (inv.amount_paid / 100).toFixed(2),
            pdf: inv.hosted_invoice_url,
            number: inv.number
        }));
    }

    // فرمت کردن فعالیت‌ها برای نمایش
    const recentActivity = sessionsSnap.docs.slice(0, 10).map(doc => ({
        id: doc.id,
        title: doc.data().title || "Untitled Session",
        type: doc.data().type || "chat",
        date: doc.data().updatedAt?.toDate().toLocaleDateString() || "N/A",
    }));

    const sanitizedUserData = sanitizeFirestoreObject(userData);

    return {
        invoices,
        activities: recentActivity,
        plan: userData?.isPremium ? "Rocket (Pro)" : "Bicycle (Free)",
        isPremium: !!userData?.isPremium,
        gamification: {
            xp,
            level,
            nextLevelXp,
            progress: Math.min(((xp % nextLevelXp) / (nextLevelXp - (nextLevelXp/2))) * 100, 100), // محاسبه درصد حدودی
            badges,
            stats: { arenaCount, chatCount },
            rawData: sanitizedUserData
        }
    };

  } catch (error: any) {
    console.error("History Error:", error);
    return null;
  }
}

function sanitizeFirestoreObject(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFirestoreObject(item));
  }
  if (value && typeof value === "object") {
    if (typeof value.toDate === "function") {
      return value.toDate().toISOString();
    }
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeFirestoreObject(val);
    }
    return sanitized;
  }
  return value;
}
