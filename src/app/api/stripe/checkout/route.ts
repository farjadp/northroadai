// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { AGENTS } from "@/lib/agents"; // فایل ایجنت‌ها
import { useAuth } from "@/context/AuthContext"; // (اینجا سمت سرور هستیم، کانتکست نداریم، از بادی میگیریم)

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { agentId, userId } = await req.json();

    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 400 });

    // ساخت لینک پرداخت
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Unlock ${agent.name}`,
              description: `Lifetime access to ${agent.name} (${agent.role})`,
              images: ["https://northroad.ai/logo.png"], // لینک لوگوی خودتان را بگذارید
            },
            unit_amount: 900, // 9.00 دلار (به سنت)
          },
          quantity: 1,
        },
      ],
      mode: "payment", // پرداخت یکبار (برای اشتراک بذارید subscription)
      success_url: `${process.env.BASE_URL}/dashboard/chat?success=true`,
      cancel_url: `${process.env.BASE_URL}/dashboard/chat?canceled=true`,
      // 🔥 بخش حیاتی: ذخیره اطلاعات برای وب‌هوک
      metadata: {
        userId: userId,
        agentId: agentId,
        type: "agent_unlock"
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}