import { NextResponse } from 'next/server';
import { adminDb, adminAuth, adminStorage } from '@/lib/firebase-admin';
import { env } from '@/lib/env';

// FORCE DYNAMIC: This API performs write operations and uses auth headers
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 1. Security Check: Admin Authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Optional: Check for specific admin role/claim here if needed, 
        // but assuming valid ID token + known admin UID or email is sufficient for now.
        // For strictness, you could check `if (decodedToken.email !== 'admin@northroad.ai') ...`

        // 2. Query Configuration
        const RetentionPeriodHours = 24;
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - RetentionPeriodHours);

        console.log(`🧹 Archive Dumper: Looking for chats older than ${thresholdDate.toISOString()}`);

        const snapshot = await adminDb.collection('guest_chats')
            .where('createdAt', '<', thresholdDate)
            .limit(500) // Batch processing to avoid memory overflow
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ message: "No chats to archive", archivedCount: 0 });
        }

        // 3. Transform to JSONL (AI Dataset Format)
        // Structure: {"messages": [{"role": "user", "content": "..."}, {"role": "model", "content": "..."}]}
        let jsonlContent = "";
        const batch = adminDb.batch();
        let count = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();

            // Basic validation to ensure meaningful data
            if (data.message && data.response) {
                const jsonLine = JSON.stringify({
                    messages: [
                        { role: "user", content: data.message },
                        { role: "model", content: data.response }
                    ],
                    meta: {
                        model: data.modelUsed,
                        date: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
                    }
                });
                jsonlContent += jsonLine + "\n";
            }

            // Add delete op to batch
            batch.delete(doc.ref);
            count++;
        });

        // 4. Upload to Storage
        if (jsonlContent.length > 0) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `datasets/raw/guest-chats-${timestamp}.jsonl`;
            const bucket = adminStorage.bucket(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
            const file = bucket.file(filename);

            await file.save(jsonlContent, {
                contentType: 'application/x-jsonlines',
                metadata: {
                    source: 'guest_chats_archiver',
                    count: count
                }
            });
            console.log(`💾 Archived ${count} chats to ${filename}`);
        }

        // 5. Commit Deletions (Atomic)
        await batch.commit();
        console.log(`🗑️ Deleted ${count} chats from Firestore`);

        return NextResponse.json({
            success: true,
            archivedCount: count,
            message: "Archival and deletion complete"
        });

    } catch (error: any) {
        console.error("❌ Archive Dumper Failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
