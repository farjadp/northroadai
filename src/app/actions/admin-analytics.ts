// ============================================================================
// 📁 Hardware Source: src/app/actions/admin-analytics.ts
// 🧠 Version: v2.1 (Fix: Local Stripe Instantiation)
// ----------------------------------------------------------------------------
// ✅ Logic: Initializes Stripe INSIDE the function to ensure env vars are ready.
// ============================================================================

"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import Stripe from "stripe"; // 🔥 ایمپورت مستقیم کلاس، نه متغیر از lib

export interface UserAnalytics {
  uid: string;
  email: string;
  name: string;
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  revenue: number;
  usageCount: number;
  nextBillingDate: string;
  daysRemaining: number;
}

export async function getBusinessMetrics() {
  // 🔥 اینجا Stripe را میسازیم تا مطمئن شویم کلید وجود دارد
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing!");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-11-20.acacia", // یا آخرین ورژن
    typescript: true,
  });

  try {
    // A. دریافت داده‌ها از استرایپ
    const [subscriptions, recentInvoices] = await Promise.all([
      // 1. لیست اشتراک‌ها
      stripe.subscriptions.list({
        limit: 100,
        status: 'all',
        expand: ['data.customer']
      }),
      // 2. لیست فاکتورهای پرداخت شده
      stripe.invoices.list({
        limit: 100,
        status: 'paid',
        created: { gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) } 
      })
    ]);

    // B. متغیرهای محاسبه کلی
    let totalRevenueMRR = 0;
    let activeSubs = 0;
    let canceledSubs = 0;

    // C. پردازش یوزرها
    const userReports = await Promise.all(subscriptions.data.map(async (sub) => {
      
      const amount = (sub.items.data[0].price.unit_amount || 0) / 100;
      
      if (sub.status === 'active' || sub.status === 'trialing') {
        totalRevenueMRR += amount;
        activeSubs++;
      }
      if (sub.cancel_at_period_end || sub.status === 'canceled') {
        canceledSubs++;
      }

      const endDate = new Date(sub.current_period_end * 1000);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const daysRemaining = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

      const customerEmail = (sub.customer as any).email;
      let userData = { uid: "unknown", name: "Unknown User" };
      let usageCount = 0;

      if (customerEmail) {
        try {
          // تلاش برای پیدا کردن یوزر در فایربیس
          // نکته: اگر دسترسی ادمین روی سرور محدود باشد، اینجا ممکن است خطا دهد
          // پس try/catch جداگانه دارد
          const userRecord = await adminAuth.getUserByEmail(customerEmail);
          userData = { uid: userRecord.uid, name: userRecord.displayName || "No Name" };
          
          const sessionsSnap = await adminDb
            .collection("users")
            .doc(userRecord.uid)
            .collection("sessions")
            .count()
            .get();
          usageCount = sessionsSnap.data().count;
        } catch (e) {
          console.warn(`User sync skipped for ${customerEmail}`);
        }
      }

      return {
        uid: userData.uid,
        email: customerEmail || "No Email",
        name: userData.name,
        plan: "Premium",
        status: sub.cancel_at_period_end ? "canceled" : sub.status as any,
        revenue: amount,
        usageCount: usageCount,
        nextBillingDate: endDate.toLocaleDateString(),
        daysRemaining: daysRemaining
      };
    }));

    // D. ساخت نمودار واقعی
    const salesMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        salesMap.set(key, 0);
    }

    recentInvoices.data.forEach(inv => {
        const date = new Date(inv.created * 1000);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const amount = (inv.amount_paid || 0) / 100;
        if (salesMap.has(key)) {
            salesMap.set(key, salesMap.get(key)! + amount);
        }
    });

    const salesChart = Array.from(salesMap.entries()).map(([name, sales]) => ({
        name,
        sales
    }));

    return {
      overview: {
        mrr: totalRevenueMRR,
        active: activeSubs,
        churn: canceledSubs,
        lifetimeValue: totalRevenueMRR * 12 
      },
      users: userReports,
      chart: salesChart
    };

  } catch (error: any) {
    console.error("Analytics Error Full:", error);
    // بازگرداندن دیتای خالی در صورت خطا تا صفحه کرش نکند
    return {
        overview: { mrr: 0, active: 0, churn: 0, lifetimeValue: 0 },
        users: [],
        chart: []
    };
  }
}