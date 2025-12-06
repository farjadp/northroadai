
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

async function verifyAuth(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Missing Authorization header");
    }
    const token = authHeader.split("Bearer ")[1];
    return adminAuth.verifyIdToken(token);
}

export async function GET(request: Request) {
    try {
        const snapshot = await adminDb
            .collection("mentor_profiles")
            .where("visibility", "==", "public")
            .get();

        const mentors = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                userId: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return NextResponse.json({ success: true, mentors });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const decoded = await verifyAuth(request);
        const { mentorId } = await request.json();

        if (!mentorId) return NextResponse.json({ success: false, error: "Mentor ID required" }, { status: 400 });

        const founderId = decoded.uid;

        if (founderId === mentorId) {
            return NextResponse.json({ success: false, error: "You cannot mentor yourself." }, { status: 400 });
        }

        const existing = await adminDb
            .collection("mentor_assignments")
            .where("mentorId", "==", mentorId)
            .where("founderId", "==", founderId)
            .get();

        if (!existing.empty) {
            return NextResponse.json({ success: false, error: "Request already sent or active." }, { status: 400 });
        }

        await adminDb.collection("mentor_assignments").add({
            mentorId,
            founderId,
            status: "pending",
            createdAt: Timestamp.now(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
