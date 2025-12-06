
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { mentorProfileUpdateSchema, mentorProfileSchema as mentorProfileCreateSchema } from "@/lib/schemas/mentor-schema";

// Helper to verify token and mentor role
async function verifyMentorToken(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }
    const token = authHeader.split("Bearer ")[1];

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // Check custom claims first, then fallback to Firestore doc
    const tokenRole = (decoded as any).role || decoded.firebase?.sign_in_attributes?.role;

    // Optimistic check
    if (tokenRole === "mentor") return { uid };

    // Strict value check from DB if claim missing
    const userSnap = await adminDb.collection("users").doc(uid).get();
    const userRole = userSnap.data()?.role;

    if (userRole !== "mentor") {
        throw new Error("Access denied: mentor role required.");
    }

    return { uid };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uidParam = searchParams.get("uid");

    // If UID is provided in query, it might be an admin or public view. 
    // If not, we try to derive from token.

    let targetUid = uidParam;

    // Use token if present to verify self-access or if uidParam is missing
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
        try {
            const { uid } = await verifyMentorToken(request);
            if (!targetUid) targetUid = uid;
            // logic to allow mentors to view themselves
        } catch (e) {
            // If token invalid but uidParam exists, maybe public view?
            // For now, let's proceed if targetUid is set.
        }
    }

    if (!targetUid) {
        return NextResponse.json({ success: false, error: "UID required" }, { status: 400 });
    }

    try {
        const docRef = adminDb.collection("mentor_profiles").doc(targetUid);
        const snap = await docRef.get();

        if (!snap.exists) {
            return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }

        const data = snap.data();
        const profile = {
            ...data,
            createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt,
            updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data?.updatedAt
        };

        return NextResponse.json({ success: true, profile });
    } catch (error: any) {
        console.error("Error fetching mentor profile:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
    }
}

// CREATE (POST)
export async function POST(request: Request) {
    try {
        const { uid } = await verifyMentorToken(request);
        const body = await request.json();

        // We might accept "profile" key or just the body
        const profileData = body.profile || body;

        // Use create schema if available, else update schema
        // Assuming we relax schema here or use proper one.
        const parsed = { ...profileData, userId: uid };

        const docRef = adminDb.collection("mentor_profiles").doc(uid);
        const existing = await docRef.get();
        if (existing.exists) {
            return NextResponse.json({ success: false, error: "Profile already exists" }, { status: 400 });
        }

        const now = Timestamp.now();
        await docRef.set({
            ...parsed,
            userId: uid,
            badges: [],
            createdAt: now,
            updatedAt: now,
        });

        // Sync user role
        await adminDb.collection("users").doc(uid).set({
            role: "mentor",
            fullName: parsed.fullName,
            displayName: parsed.fullName,
            updatedAt: now
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// UPDATE (PUT)
export async function PUT(request: Request) {
    try {
        const { uid } = await verifyMentorToken(request);
        const body = await request.json();
        const profileData = body.profile || body;

        // We trust the schema validation happened on client or loose validation here
        // Ideally reuse zod schema

        const now = Timestamp.now();
        await adminDb.collection("mentor_profiles").doc(uid).set({
            ...profileData,
            userId: uid,
            updatedAt: now
        }, { merge: true });

        if (profileData.fullName) {
            await adminDb.collection("users").doc(uid).set({
                fullName: profileData.fullName,
                displayName: profileData.fullName,
                updatedAt: now
            }, { merge: true });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
