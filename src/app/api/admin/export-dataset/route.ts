// src/app/api/admin/export-dataset/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await adminDb.collection("golden_dataset")
        .orderBy("timestamp", "desc")
        .limit(1000) // فعلا ۱۰۰۰ تای آخر (قابل تغییر)
        .get();

    const dataset = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            prompt: data.instruction,
            completion: data.output,
            agent: data.agent,
            created_at: data.timestamp?.toDate()
        };
    });

    return NextResponse.json(dataset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}