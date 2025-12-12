import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
    try {
        // 1. Auth Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        console.log(`⚠️ Starting Account Deletion for User: ${userId}`);

        // 2. Delete Firestore Data
        // A. User Profile
        await adminDb.collection("users").doc(userId).delete();

        // B. User Chats (Batch Delete)
        // Note: If user has >500 chats, we need multiple batches.
        const chatsSnapshot = await adminDb.collection("chats").where("userId", "==", userId).get();

        if (!chatsSnapshot.empty) {
            const batch = adminDb.batch();
            chatsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Deleted ${chatsSnapshot.size} chats.`);
        }

        // 3. Delete Storage Files (Recursively)
        const bucket = adminStorage.bucket(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        try {
            await bucket.deleteFiles({
                prefix: `uploads/${userId}/`
            });
            console.log(`Deleted storage files for ${userId}`);
        } catch (e) {
            console.warn("Storage deletion warning (might be empty):", e);
        }

        // 4. Delete Auth Account
        await adminAuth.deleteUser(userId);

        console.log(`✅ User ${userId} successfully deleted.`);

        return NextResponse.json({
            success: true,
            message: "Account and data permanently deleted."
        });

    } catch (error: any) {
        console.error("❌ Account Deletion Failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
