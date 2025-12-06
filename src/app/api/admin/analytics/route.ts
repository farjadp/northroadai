
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function GET() {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-11-20.acacia" as any,
        typescript: true,
    });

    try {
        const [subscriptions, recentInvoices] = await Promise.all([
            stripe.subscriptions.list({
                limit: 100,
                status: 'all',
                expand: ['data.customer']
            }),
            stripe.invoices.list({
                limit: 100,
                status: 'paid',
                created: { gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) }
            })
        ]);

        let totalRevenueMRR = 0;
        let activeSubs = 0;
        let canceledSubs = 0;

        const userReports = await Promise.all(subscriptions.data.map(async (sub) => {
            const amount = (sub.items.data[0].price.unit_amount || 0) / 100;
            if (sub.status === 'active' || sub.status === 'trialing') {
                totalRevenueMRR += amount;
                activeSubs++;
            }
            if (sub.cancel_at_period_end || sub.status === 'canceled') {
                canceledSubs++;
            }

            const endDate = new Date((sub as any).current_period_end * 1000);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            const daysRemaining = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

            const customerEmail = (sub.customer as any).email;
            let userData = { uid: "unknown", name: "Unknown User" };
            let usageCount = 0;

            if (customerEmail) {
                try {
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

        return NextResponse.json({
            overview: {
                mrr: totalRevenueMRR,
                active: activeSubs,
                churn: canceledSubs,
                lifetimeValue: totalRevenueMRR * 12
            },
            users: userReports,
            chart: salesChart
        });

    } catch (error: any) {
        console.error("Analytics Error:", error);
        return NextResponse.json({
            overview: { mrr: 0, active: 0, churn: 0, lifetimeValue: 0 },
            users: [],
            chart: []
        }, { status: 500 }); // Return formatted error data with 500 implicitly or just success:false logic
    }
}
