// ============================================================================
// 📁 Hardware Source: src/app/api/guest-chat/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.0 (Smart Model + Rate Limiting)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Identifies Guest via IP/User-Agent.
// 2. Checks Firestore for daily rate limit.
// 3. Auto-selects best available Gemini Model (2.0/1.5).
// 4. Logs conversation to 'guest_chats'.
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { headers } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const fingerprint = `${ip}-${userAgent}`;

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

    // -----------------------------------------------------------
    // 🔍 SMART MODEL SELECTION (Copy of Main Chat Logic)
    // -----------------------------------------------------------
    let targetModel = "gemini-1.5-flash"; // Default Fallback

    try {
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const listData = await listReq.json();
        
        if (listData.models) {
            const names = listData.models.map((m: any) => m.name);
            // Priorities: Speed is key for landing page
            const priorities = [
                "models/gemini-2.0-flash", 
                "models/gemini-1.5-flash",
                "models/gemini-pro"
            ];
            const found = priorities.find(p => names.includes(p));
            if (found) targetModel = found.replace("models/", ""); 
        }
    } catch (e) {
        console.warn("Guest Chat: Model discovery failed, using default.");
    }
    // -----------------------------------------------------------

    const model = genAI.getGenerativeModel({ model: targetModel });

    // 3. Call AI
    const prompt = `
You are PIRAI, the AI mentor at North Road.
You are chatting with a GUEST on the landing page.

GUIDELINES:
1. Keep answers SHORT (max 2-3 sentences).
2. Be engaging and professional.
3. If the question is complex, give a brief answer but suggest creating an account for a deep dive.
4. Do NOT hallucinate features. You help with Strategy, Product, Finance, and Legal.

USER QUESTION: "${message}"
    `;

    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const text = response.text();

    // 4. Save Chat Log
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
    
    // Friendly error for frontend
    return NextResponse.json(
      { error: "System overload. Please try again or sign up." },
      { status: 500 }
    );
  }
}