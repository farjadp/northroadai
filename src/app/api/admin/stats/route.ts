// ============================================================================
// 📁 Hardware Source: src/app/api/admin/stats/route.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0 (Real Aggregation)
// ----------------------------------------------------------------------------
// ✅ Logic: Aggregates system metrics from 'system_logs'.
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Total Requests (Count)
        // Note: count() is efficient and cheap in Firestore.
        const totalReqSnap = await adminDb.collection("system_logs").count().get();
        const totalRequests = totalReqSnap.data().count;

        // 2. Total Tokens & Revenue (Approximation via Recent Logs)
        // Warning: Aggregating ALL docs for tokens is expensive/slow. 
        // We will sum the last 1000 logs as a "Sampled Metric" or maintain a counter properly in production.
        // For this task, we will just fetch the last 100 logs to estimate "Active" metrics to avoid reading DB too much.
        const recentLogsSnap = await adminDb.collection("system_logs")
            .orderBy("timestamp", "desc")
            .limit(100)
            .get();

        let totalTokensSample = 0;
        let activeUsers = new Set();

        recentLogsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.metadata?.tokens?.totalTokens) {
                totalTokensSample += data.metadata.tokens.totalTokens;
            }
            if (data.metadata?.userId && data.metadata.userId !== "guest") {
                activeUsers.add(data.metadata.userId);
            }
        });

        // 3. Founders Count
        const usersSnap = await adminDb.collection("users").count().get();
        const totalFounders = usersSnap.data().count;


        return NextResponse.json({
            metrics: {
                totalFounders,
                totalRequests, // Real total
                activeUsers24h: activeUsers.size, // Sampled from recent 100 logs
                totalTokensRecent: totalTokensSample, // Sampled
            }
        });

    } catch (error: any) {
        console.error("Stats Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
