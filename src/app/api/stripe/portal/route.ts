// ============================================================================
// 📁 Hardware Source: src/app/api/stripe/portal/route.ts
// 🧠 Version: v1.0 (Stripe Customer Portal)
// ----------------------------------------------------------------------------
// ✅ Logic: Generates a link for users to manage their billing on Stripe.
// ============================================================================

import { NextResponse } from "next/server";
import { stripe, APP_URL } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // 1. دریافت اطلاعات کاربر از فایربیس
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
        return NextResponse.json({ error: "No billing history found." }, { status: 404 });
    }

    // 2. ساخت لینک پرتال
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error: any) {
    console.error("Portal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}