// ============================================================================
// 📁 Hardware Source: src/app/api/admin/settings/chat/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.0 (Deploy Safe Configuration)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Force Dynamic: Prevents build failure on Cloud Run.
// 2. GET/POST: Manages global guest limit.
// ============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { headers } from "next/headers";


// ⚠️ حیاتی برای بیلد
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!db || !db.type) return NextResponse.json({ limit: 5 }); // Fallback for build time

        const settingsRef = doc(db, "settings", "chat");
        const settingsSnap = await getDoc(settingsRef);
        const limit = settingsSnap.exists() ? settingsSnap.data().guestLimit || 5 : 5;

        return NextResponse.json({ limit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const headersList = headers();
const secret = headersList.get("x-admin-secret");
if (secret !== process.env.ADMIN_SECRET) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

    try {
        const { limit } = await req.json();

        if (typeof limit !== 'number' || limit < 0) {
            return NextResponse.json({ error: "Invalid limit value" }, { status: 400 });
        }

        if (!db || !db.type) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

        const settingsRef = doc(db, "settings", "chat");
        await setDoc(settingsRef, { guestLimit: limit }, { merge: true });

        return NextResponse.json({ success: true, limit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}