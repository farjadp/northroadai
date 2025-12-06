// ============================================================================
// 📁 Hardware Source: src/app/api/stripe/checkout/route.ts
// 🧠 Version: v2.0 (Direct Email Injection)
// ----------------------------------------------------------------------------
// ✅ Fixes: Removes dependency on adminAuth.getUser() which might fail on Cloud Run.
// ✅ Logic: Accepts email directly from client request.
// ============================================================================

// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

// 1. Initialize Stripe directly here
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://northroadai.run.app";

export async function POST(req: Request) {
  try {
    const { userId, userEmail, agentId } = await req.json();

    if (!userId || !agentId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Create Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Unlock Agent: ${agentId.toUpperCase()}`,
              description: "Lifetime access to specialized AI mentor.",
            },
            unit_amount: 900, // $9.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${APP_URL}/dashboard/chat?agent=${agentId}&payment=success`,
      cancel_url: `${APP_URL}/dashboard/chat?payment=cancelled`,
      customer_email: userEmail,
      
      // 3. Metadata for Webhook
      metadata: {
        userId,
        agentId,
        type: "AGENT_UNLOCK"
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}