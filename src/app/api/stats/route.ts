// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({
        totalVectors: 0,
        ragPercentage: 0,
        totalQueries: 0,
      });
    }

    // 1) Count vectors (knowledge_base)
    let totalVectors = 0;
    try {
      totalVectors = (await adminDb.collection("knowledge_base").count().get()).data().count || 0;
    } catch {
      totalVectors = 0;
    }

    // 2) System stats doc (rag hits, total queries)
    let ragPercentage = 0;
    let totalQueries = 0;
    try {
      const statsDoc = await adminDb.collection("system_stats").doc("global").get();
      if (statsDoc.exists) {
        const data = statsDoc.data() || {};
        totalQueries = Number(data.total_queries) || 0;
        const ragHits = Number(data.rag_hits) || 0;
        if (totalQueries > 0) {
          ragPercentage = Math.round((ragHits / totalQueries) * 100);
        }
      }
    } catch {
      ragPercentage = 0;
      totalQueries = 0;
    }

    return NextResponse.json({
      totalVectors,
      ragPercentage,
      totalQueries,
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { totalVectors: 0, ragPercentage: 0, totalQueries: 0, error: error.message },
      { status: 500 }
    );
  }
}
