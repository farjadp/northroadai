import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("avatar") as File;
        // In some client setups, formData might pass 'uid' as a field, or we extract from token.
        // The original action used `uid` passed as argument, but here we might need it from body or implicit (not ideal).
        // Let's assume the component sends it in FormData.
        const uid = formData.get("uid") as string;

        // Wait, the original action signature was `uploadMentorAvatar(uid, formData)`.
        // So I need to make sure the client appends `uid` to the formData.

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }
        if (!uid) {
            // Fallback: try to extract from path or header? 
            // For now, fail if not provided.
            return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 });
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: "File too large" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const bucket = getStorage().bucket();
        const fileName = `avatars/${uid}/avatar.${file.type.split("/")[1]}`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(buffer, {
            metadata: { contentType: file.type }
        });

        await fileRef.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        await adminDb.collection("mentor_profiles").doc(uid).update({
            avatarUrl: publicUrl,
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ success: true, avatarUrl: publicUrl });

    } catch (error: any) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
