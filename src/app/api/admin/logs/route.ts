// ============================================================================
// 📁 Hardware Source: src/app/api/admin/logs/route.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0 (Real Logs)
// ----------------------------------------------------------------------------
// ✅ Logic: Fetches paginated logs from 'system_logs' collection.
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type"); // admin | user | activity

    let query = adminDb.collection("system_logs").orderBy("timestamp", "desc").limit(limit);

    if (type && type !== "all") {
      query = query.where("type", "==", type);
    }

    const snapshot = await query.get();

    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || "activity",
        title: data.title || "Untitled Log",
        detail: data.detail || "",
        severity: data.severity || "info",
        ts: data.timestamp ? data.timestamp.toDate().toLocaleString() : new Date().toLocaleString(), // Simple formatting
        meta: data.metadata ? JSON.stringify(data.metadata) : undefined
      };
    });

    return NextResponse.json({ logs });

  } catch (error: any) {
    console.error("Logs Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
