import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET() {
    try {
        const settingsRef = doc(db, "settings", "chat");
        const settingsSnap = await getDoc(settingsRef);
        const limit = settingsSnap.exists() ? settingsSnap.data().guestLimit || 5 : 5;

        return NextResponse.json({ limit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { limit } = await req.json();

        if (typeof limit !== 'number' || limit < 0) {
            return NextResponse.json({ error: "Invalid limit value" }, { status: 400 });
        }

        const settingsRef = doc(db, "settings", "chat");
        await setDoc(settingsRef, { guestLimit: limit }, { merge: true });

        return NextResponse.json({ success: true, limit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
