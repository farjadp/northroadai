// ============================================================================
// 📁 Hardware Source: src/app/api/stripe/webhook/route.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0 (Secure Fulfillment)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Verifies Stripe Signature (Security Critical).
// 2. Unlocks Agent for User (in Firestore).
// 3. Records Financial Transaction (for Admin Dashboard).
// ============================================================================
// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin"; // Ensure this path is correct
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

// Initialize Stripe (Handle build-time missing key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2025-11-17.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers(); // Fix: await headers() in Next.js 15
    const sig = headersList.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) throw new Error("Missing Signature/Secret");
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, agentId, type } = session.metadata || {};

        if (type === "AGENT_UNLOCK" && userId && agentId) {
            console.log(`💰 Unlocking ${agentId} for ${userId}`);

            try {
                const batch = adminDb.batch();

                // A. باز کردن قفل برای کاربر
                const userRef = adminDb.collection("users").doc(userId);
                batch.set(userRef, {
                    unlockedAgents: FieldValue.arrayUnion(agentId),
                    lastPurchase: FieldValue.serverTimestamp()
                }, { merge: true });

                // B. ثبت تراکنش
                const txRef = adminDb.collection("transactions").doc(session.id);
                batch.set(txRef, {
                    userId,
                    amount: session.amount_total! / 100,
                    currency: session.currency,
                    agentId,
                    status: "succeeded",
                    timestamp: FieldValue.serverTimestamp()
                });

                await batch.commit();
                console.log("✅ Success!");

            } catch (dbError) {
                console.error("🔥 DB Error:", dbError);
                return NextResponse.json({ error: "DB Update Failed" }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}