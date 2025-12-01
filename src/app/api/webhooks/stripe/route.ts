// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin"; // دسترسی ادمین برای آپدیت دیتابیس
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event;

  try {
    // 1. تایید اینکه پیام واقعاً از طرف استرایپ است
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook Signature Error:", error.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // 2. پردازش پرداخت موفق
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    // خواندن اطلاعات مخفی شده
    const userId = session.metadata?.userId;
    const agentId = session.metadata?.agentId;

    if (userId && agentId) {
      console.log(`💰 Payment success! Unlocking ${agentId} for ${userId}`);

      // 3. آپدیت فایربیس (اضافه کردن ایجنت به لیست کاربر)
      await adminDb.collection("users").doc(userId).set({
        unlockedAgents: FieldValue.arrayUnion(agentId), // اضافه کردن به آرایه بدون حذف بقیه
        isPro: true // شاید بخواهید تگ پرو هم بزنید
      }, { merge: true });
    }
  }

  return NextResponse.json({ received: true });
}