import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 1. Auth Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        console.log(`📦 Starting Data Export for User: ${userId}`);

        // 2. Fetch User Profile
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        // 3. Fetch User Chats
        // Note: Assuming 'chats' collection stores user chats with 'userId' field
        const chatsSnapshot = await adminDb.collection("chats")
            .where("userId", "==", userId)
            .get();

        const chats = chatsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 4. Construct Export Bundle
        const exportBundle = {
            meta: {
                exportDate: new Date().toISOString(),
                userId: userId,
                version: "1.0"
            },
            profile: userData,
            chats: chats,
            // Add other data sources here (e.g., usage logs, transactions) if applicable
        };

        // 5. Return JSON
        // For larger datasets, we would upload to Storage and return a link, 
        // but for text-based chats, direct JSON is usually within limits (4MB Lambda limit might be tight for huge histories).
        // If user has >10MB data, this might fail on Vercel/Cloud Run. 
        // Optimization: Stream response or use Storage if needed. 
        // For now, simple return.
        return NextResponse.json(exportBundle);

    } catch (error: any) {
        console.error("❌ Data Export Failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
