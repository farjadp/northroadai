
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { UserRole } from "@/lib/user-service";

// Security helper
async function verifyAdmin(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Check role claim
    const role = (decoded as any).role || decoded.firebase?.sign_in_attributes?.role;
    if (role !== "admin" && role !== "superadmin") {
        // Fallback to DB check
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
        const dbRole = userDoc.data()?.role;
        if (dbRole !== "admin" && dbRole !== "superadmin") {
            throw new Error("Access denied: Admin role required");
        }
    }
    return decoded;
}

export async function GET(request: Request) {
    try {
        await verifyAdmin(request);
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const roleFilter = searchParams.get("role") as UserRole | "all" | null;

        let query: FirebaseFirestore.Query = adminDb.collection("users");

        if (roleFilter && roleFilter !== "all") {
            query = query.where("role", "==", roleFilter);
        }

        const countSnapshot = await query.count().get();
        const total = countSnapshot.data().count;

        const usersSnap = await query
            .orderBy("createdAt", "desc")
            .offset((page - 1) * limit)
            .limit(limit)
            .get();

        const users = usersSnap.docs.map(doc => {
            const data = doc.data();
            let createdIso = new Date().toISOString();
            if (data.createdAt?.toDate) {
                createdIso = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
                createdIso = data.createdAt;
            }

            return {
                uid: doc.id,
                email: data.email || "",
                displayName: data.displayName || data.fullName || "Unknown",
                role: (data.role as UserRole) || "user",
                createdAt: createdIso,
                lastLogin: data.lastLogin?.toDate?.()?.toISOString()
            };
        });

        return NextResponse.json({ users, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
