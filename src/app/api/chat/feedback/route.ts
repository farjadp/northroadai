
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { messageId, rating, userId, agentId } = await req.json();

        if (!messageId || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Store Feedback in dedicated collection
        await adminDb.collection("chat_feedback").add({
            messageId,
            rating: rating === 1 ? "LIKE" : "DISLIKE",
            userId,
            agentId: agentId || "unknown",
            timestamp: FieldValue.serverTimestamp()
        });

        // 2. (Optional) Update Golden Dataset if it was a good response
        // This logic can be expanded later to fine-tune the model

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Feedback Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
