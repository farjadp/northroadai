// ============================================================================
// 📁 Hardware Source: src/app/api/stripe/checkout/route.ts
// 🧠 Version: v2.0 (Direct Email Injection)
// ----------------------------------------------------------------------------
// ✅ Fixes: Removes dependency on adminAuth.getUser() which might fail on Cloud Run.
// ✅ Logic: Accepts email directly from client request.
// ============================================================================

import { NextResponse } from "next/server";
import { stripe, APP_URL } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // دریافت ایمیل مستقیم از کلاینت
    const { userId, userEmail, agentId } = await req.json();

    if (!userId || !userEmail) {
        return NextResponse.json({ error: "Missing user credentials" }, { status: 400 });
    }

    // چک کردن کلید استرایپ
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("❌ STRIPE_SECRET_KEY is missing in env vars");
        return NextResponse.json({ error: "Server misconfiguration: Stripe Key missing" }, { status: 500 });
    }

    console.log(`💳 Creating checkout for: ${userEmail}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "North Road AI - Agent Unlock",
              description: "Lifetime access to Premium Agent",
              images: ["https://northroad.ai/logo.png"], // اختیاری
            },
            unit_amount: 900, // $9.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${APP_URL}/dashboard/chat?payment=success`,
      cancel_url: `${APP_URL}/dashboard/chat?payment=cancelled`,
      customer_email: userEmail, // ایمیل را مستقیم ست میکنیم
      metadata: {
        userId: userId,
        agentId: agentId || "general", // ذخیره میکنیم که چه چیزی خریده
        type: "AGENT_UNLOCK"
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}