// ============================================================================
// 📁 Hardware Source: src/app/api/guest-chat/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v3.0 (Deploy Ready)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Force Dynamic: Vital for Cloud Run deployment.
// 2. Auto-selects best available Gemini Model.
// 3. Logs conversation to 'guest_chats'.
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { headers } from "next/headers";
import { logServiceStatus, logSystemAlert } from "@/lib/system-status";

// ⚠️ این خط برای دپلوی روی Cloud Run حیاتی است
export const dynamic = 'force-dynamic';

const createGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY missing");
  }
  return new GoogleGenerativeAI(key);
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const fingerprint = `${ip}-${userAgent}`;

    // چک کردن db قبل از استفاده (برای اطمینان در زمان بیلد)
    if (!db || !db.type) { 
       return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    // 1. Get Global Limit
    const settingsRef = doc(db, "settings", "chat");
    const settingsSnap = await getDoc(settingsRef);
    const limit = settingsSnap.exists() ? settingsSnap.data().guestLimit || 5 : 5;

    // 2. Check Usage for Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const chatsRef = collection(db, "guest_chats");
    const q = query(
      chatsRef,
      where("fingerprint", "==", fingerprint),
      where("createdAt", ">=", todayTimestamp)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size >= limit) {
      return NextResponse.json(
        { error: "Daily demo limit reached. Please sign up for free unlimited access." },
        { status: 429 }
      );
    }

    // 3. Smart Model Selection
    let targetModel = "gemini-1.5-flash"; 
    try {
        // تلاش برای پیدا کردن بهترین مدل (برای جلوگیری از 404)
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const listData = await listReq.json();
        
        if (listData.models) {
            const names = listData.models.map((m: any) => m.name);
            const priorities = ["models/gemini-2.0-flash", "models/gemini-1.5-flash", "models/gemini-pro"];
            const found = priorities.find(p => names.includes(p));
            if (found) targetModel = found.replace("models/", ""); 
        }
    } catch (e) {
        // Fallback silently
    }

    const model = createGenAI().getGenerativeModel({ model: targetModel });

    // 4. Call AI
    const prompt = `
You are PIRAI, the AI mentor at North Road.
You are chatting with a GUEST on the landing page.
GUIDELINES: Keep answers SHORT (max 3 sentences). Be engaging.
USER QUESTION: "${message}"
    `;

    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const text = response.text();
    logServiceStatus("Guest Chat API", true, `Model ${targetModel} responded`);

    // 5. Save Chat Log
    await addDoc(chatsRef, {
      fingerprint,
      ip,
      userAgent,
      message,
      response: text,
      createdAt: Timestamp.now(),
      modelUsed: targetModel
    });

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("❌ Guest Chat Error:", error.message);
    logServiceStatus("Guest Chat API", false, error.message || "Unknown guest chat failure");
    logSystemAlert({
      service: "Guest Chat API",
      message: error.message ?? "Unknown guest chat failure",
      severity: "critical",
      detail: error.stack,
    });
    return NextResponse.json(
      { error: "System overload. Please try again later." },
      { status: 500 }
    );
  }
}
