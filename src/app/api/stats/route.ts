// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. تعداد کل دانش‌ها (Vectors)
    // نکته: count() در فایربیس بهینه است
    const kbSnapshot = await adminDb.collection("knowledge_base").count().get();
    const totalVectors = kbSnapshot.data().count;

    // 2. آمار استفاده (Hits)
    const statsDoc = await adminDb.collection("system_stats").doc("global").get();
    let ragPercentage = 0;
    let totalQueries = 0;

    if (statsDoc.exists) {
        const data = statsDoc.data();
        totalQueries = data?.total_queries || 0;
        const ragHits = data?.rag_hits || 0;
        
        if (totalQueries > 0) {
            ragPercentage = Math.round((ragHits / totalQueries) * 100);
        }
    }

    return NextResponse.json({
        totalVectors,
        ragPercentage,
        totalQueries
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}