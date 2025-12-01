// ============================================================================
// 📁 Hardware Source: src/app/api/chat/route.ts
// 🕒 Date: 2025-12-01 11:30
// 🧠 Version: v15.0 (Feature Added: Dataset Collection)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Force Dynamic (Cloud Run).
// 2. Smart Model Selection (Preserved).
// 3. True RAG (Preserved).
// 4. Safety (Preserved).
// 5. Smart Welcome (Preserved).
// 6. NEW: Saves Q&A pairs to 'golden_dataset' for future training.
// ============================================================================

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { KnowledgeService } from "@/lib/api/knowledge";
import { UserService } from "@/lib/user-service";
import { getAgentById, getDefaultAgent } from "@/lib/agents";
// 👇 ایمپورت‌های جدید برای دسترسی به دیتابیس ادمین
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Force dynamic rendering for Cloud Run/Vercel
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, startupContext, fileData, agentId, userId, history } = await req.json();

    // =================================================================
    // 1. SECURITY & ACCESS CONTROL
    // =================================================================
    const requestedAgentId = agentId || "navigator";
    if (userId && requestedAgentId !== "navigator") {
      const hasAccess = await UserService.checkAgentAccess(userId, requestedAgentId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Access Denied." }, { status: 403 });
      }
    }

    // =================================================================
    // 2. AGENT SETUP
    // =================================================================
    const agent = getAgentById(requestedAgentId) || getDefaultAgent();

    // =================================================================
    // 3. SMART MODEL SELECTION
    // =================================================================
    let targetModel = "gemini-pro"; // Safe fallback
    try {
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const listData = await listReq.json();
        
        if (listData.models) {
            const names = listData.models.map((m: any) => m.name);
            const priorities = [
                "models/gemini-2.0-flash", 
                "models/gemini-2.5-flash", 
                "models/gemini-1.5-flash",
                "models/gemini-pro"
            ];
            const found = priorities.find(p => names.includes(p));
            if (found) targetModel = found.replace("models/", ""); 
            console.log(`🎯 Targeted Model: ${targetModel}`);
        }
    } catch (e) {
        console.warn("⚠️ Model discovery failed, using default:", targetModel);
    }

    // =================================================================
    // 4. PERSONALIZED WELCOME (SPECIAL CASE)
    // =================================================================
    if (message === "GENERATE_WELCOME_MESSAGE" && startupContext) {
        const welcomeModel = genAI.getGenerativeModel({ model: targetModel });
        const welcomePrompt = `
        You are PIRAI, a startup mentor.
        The user has just logged in. They have the following profile:
        ${JSON.stringify(startupContext)}

        Task:
        1. Greet them warmly.
        2. Acknowledge their stage ("I see you are at Seed stage...") or industry.
        3. Propose ONE specific, high-value action they should take right now based on their profile.
        
        Keep it under 40 words. Be motivating but professional.
        `;
        const result = await welcomeModel.generateContent(welcomePrompt);
        return NextResponse.json({ reply: result.response.text() });
    }

    // =================================================================
    // 5. MODEL CONFIGURATION
    // =================================================================
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
        model: targetModel,
        safetySettings: safetySettings 
    });

    // =================================================================
    // 6. GATHER CONTEXT (FILES & RAG)
    // =================================================================
    const globalDocs = await KnowledgeService.getGlobalDocs();
    let userDocs: any[] = [];
    if (userId) userDocs = await KnowledgeService.getUserDocs(userId);

    const contentParts: any[] = [];

    // Inject Global Files
    globalDocs.forEach((doc: any) => {
        if (doc.fileUri) contentParts.push({ fileData: { mimeType: doc.mimeType, fileUri: doc.fileUri } });
    });
    
    // Inject User Files
    userDocs.forEach((doc: any) => {
        if (doc.fileUri) contentParts.push({ fileData: { mimeType: doc.mimeType, fileUri: doc.fileUri } });
    });

    // Inject Current Attachment
    if (fileData?.fileUri) {
        contentParts.push({ fileData: { mimeType: fileData.mimeType, fileUri: fileData.fileUri } });
    }

    // =================================================================
    // 7. PROMPT ENGINEERING
    // =================================================================
    const systemInstruction = `
${agent.systemPrompt}

=== KNOWLEDGE PROTOCOL ===
1. GLOBAL RULES (Attached Files): Highest Priority.
2. USER DOCS (Attached Files): Analyze if relevant.
3. STARTUP DNA: ${startupContext ? JSON.stringify(startupContext) : "None"}
    `;

    // Add History Context
    let fullConversation = systemInstruction + "\n\n=== CONVERSATION HISTORY ===\n";
    if (history && Array.isArray(history)) {
        history.slice(-5).forEach((msg: any) => {
            if (msg.role !== 'system') {
                fullConversation += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
            }
        });
    }
    fullConversation += `User: ${message}\nAI:`;

    contentParts.push({ text: fullConversation });

    // =================================================================
    // 8. GENERATION
    // =================================================================
    console.log(`🚀 Sending to ${targetModel}...`);
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();

    // =================================================================
    // 9. LOGGING & DATASET COLLECTION (NEW FEATURE)
    // =================================================================
    try {
        const timestamp = FieldValue.serverTimestamp();

        // الف: آپدیت آمار کلی سیستم (Stats)
        const statsRef = adminDb.collection("system_stats").doc("global");
        await statsRef.set({
            total_queries: FieldValue.increment(1),
            // چون در این نسخه وکتور سرچ نداریم، هیت را صفر میگذاریم یا بعدا اضافه میکنیم
            last_updated: timestamp
        }, { merge: true });

        // ب: ذخیره در دیتاست طلایی (Golden Dataset) برای آموزش‌های آینده
        await adminDb.collection("golden_dataset").add({
            instruction: message, // سوال کاربر
            output: text,         // جواب هوش مصنوعی
            agent: agent.name,    // کدام ایجنت
            userId: userId || "guest",
            timestamp: timestamp,
            meta: {
                model: targetModel,
                has_files: contentParts.length > 1 // آیا فایلی پیوست بود؟
            }
        });
    } catch (e) {
        console.warn("⚠️ Logging failed (non-critical)");
    }

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("❌ AI Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}