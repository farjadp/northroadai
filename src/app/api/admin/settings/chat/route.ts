// ============================================================================
// 📁 Hardware Source: src/app/api/admin/settings/chat/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.0 (Deploy Safe Configuration)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Force Dynamic: Prevents build failure on Cloud Run.
// 2. GET/POST: Manages global guest limit.
// ============================================================================

// ============================================================================
// 📁 Hardware Source: src/app/api/admin/settings/chat/route.ts
// 🕒 Date: 2025-12-11
// 🧠 Version: v3.1 (Standardized Errors)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Force Dynamic.
// 2. SECURED: Requires Firebase ID Token.
// 3. HANDLED: Uses AppError and handleApiError.
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { ChatSettingsSchema } from "@/lib/schemas/admin-validation";
import { AppError, handleApiError } from "@/lib/api-error";

// ⚠️ حیاتی برای بیلد
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settingsRef = adminDb.collection("settings").doc("chat");
        const settingsSnap = await settingsRef.get();
        const limit = settingsSnap.exists ? settingsSnap.data()?.guestLimit || 5 : 5;

        return NextResponse.json({ limit });
    } catch (error: any) {
        return handleApiError(error);
    }
}

export async function POST(req: Request) {
    try {
        // 1. AUTHENTICATION
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Unauthorized", 401);
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // 2. INPUT PARSING & VALIDATION
        const body = await req.json();
        const validation = ChatSettingsSchema.safeParse(body);

        if (!validation.success) {
            throw new AppError("Invalid input", 400, validation.error.flatten());
        }

        const { limit } = validation.data;

        // 3. EXECUTION
        const settingsRef = adminDb.collection("settings").doc("chat");
        await settingsRef.set({ guestLimit: limit }, { merge: true });

        // 4. AUDIT LOG
        await adminDb.collection("audit_logs").add({
            action: "UPDATE_CHAT_SETTINGS",
            userId: decodedToken.uid,
            userEmail: decodedToken.email,
            details: { previousLimit: "unknown", newLimit: limit },
            timestamp: Timestamp.now(),
            status: "SUCCESS",
            ip: req.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({ success: true, limit });
    } catch (error: any) {
        return handleApiError(error);
    }
}