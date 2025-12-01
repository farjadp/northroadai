// ============================================================================
// 📁 Hardware Source: src/app/api/admin/logs/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Admin Logs API)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Fetches latest admin/user/activity logs from Firestore `logs` collection.
// - Returns normalized fields for UI consumption.
// - Force dynamic to avoid caching.
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("logs")
      .orderBy("ts", "desc")
      .limit(50)
      .get();

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: (data.type as "admin" | "user" | "activity") || "user",
        title: data.title || "Untitled",
        detail: data.detail || "",
        severity: (data.severity as "info" | "warn" | "critical") || "info",
        ts: data.ts?.toDate ? data.ts.toDate().toISOString() : data.ts || "",
        meta: data.meta || "",
      };
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Admin Logs API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
