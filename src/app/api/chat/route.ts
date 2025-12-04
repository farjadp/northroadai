// ============================================================================
// 📁 Hardware Source: src/app/api/chat/route.ts
// 🕒 Date: 2025-12-04
// 🧠 Version: v16.0 (Ultimate Merge: Vector Search + Logging + Self-Healing)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Force Dynamic (Cloud Run Safe).
// 2. Smart Model Selection (Auto 1.5/2.0).
// 3. Vector Search (Hugging Face Data).
// 4. File RAG (Uploaded Docs).
// 5. Self-Healing (Retries if files are expired).
// 6. Dataset Logging (Saves Q&A for training).
// ============================================================================

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { KnowledgeService } from "@/lib/api/knowledge";
import { UserService } from "@/lib/user-service";
import { getAgentById, getDefaultAgent } from "@/lib/agents";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logServiceStatus, logSystemAlert } from "@/lib/system-status";


export const dynamic = 'force-dynamic';

const createGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {

  try {
    const { message, startupContext, fileData, agentId, userId, history } = await req.json();

    // 1. ACCESS CONTROL
    const requestedAgentId = agentId || "navigator";
    if (userId && requestedAgentId !== "navigator") {
      const hasAccess = await UserService.checkAgentAccess(userId, requestedAgentId);
      if (!hasAccess) return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const agent = getAgentById(requestedAgentId) || getDefaultAgent();

    // 2. SMART MODEL SELECTION
    let targetModel = "gemini-1.5-flash"; 
    try {
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const listData = await listReq.json();
        if (listData.models) {
            const names = listData.models.map((m: any) => m.name);
            const priorities = ["models/gemini-2.0-flash", "models/gemini-2.5-flash", "models/gemini-1.5-flash", "models/gemini-pro"];
            const found = priorities.find(p => names.includes(p));
            if (found) targetModel = found.replace("models/", ""); 
        }
    } catch (e) { console.warn("Model check failed"); }

    // 3. SPECIAL CASE: WELCOME MESSAGE
    if (message === "GENERATE_WELCOME_MESSAGE" && startupContext) {
        const model = createGenAI().getGenerativeModel({ model: targetModel });
        const res = await model.generateContent(`
            You are PIRAI. Greet this founder based on profile: ${JSON.stringify(startupContext)}. 
            Keep it under 40 words. Motivating but professional.
        `);
        return NextResponse.json({ reply: res.response.text() });
    }

    // 4. MODEL CONFIG
    const model = createGenAI().getGenerativeModel({ 
        model: targetModel,
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
    });

    // 5. VECTOR SEARCH (Hugging Face Data)
    let vectorContext = "";
    try {
        // الف: تبدیل سوال به وکتور
        const embedModel = createGenAI().getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embedModel.embedContent(message);
        const vector = embeddingResult.embedding.values;

        // ب: جستجو در فایربیس
        const vectorQuery = await adminDb.collection("knowledge_base").findNearest("embedding", vector, {
            limit: 3,
            distanceMeasure: "COSINE",
        });
        const snapshot = await vectorQuery.get();
        
        if (!snapshot.empty) {
            vectorContext = snapshot.docs.map(doc => doc.data().text).join("\n\n---\n\n");
            console.log(`🔍 Vector DB: Found ${snapshot.size} relevant facts.`);
        }
    } catch (error) {
        // اگر ایندکس نباشد یا دیتابیس خالی باشد، نادیده بگیر
        console.warn("⚠️ Vector Search skipped.");
    }

    // 6. FILE CONTEXT (Global + User Docs)
    const globalDocs = await KnowledgeService.getGlobalDocs();
    let userDocs: any[] = [];
    if (userId) userDocs = await KnowledgeService.getUserDocs(userId);

    const contentParts: any[] = [];

    [...globalDocs, ...userDocs].forEach((doc: any) => {
        if (doc.fileUri) contentParts.push({ fileData: { mimeType: doc.mimeType, fileUri: doc.fileUri } });
    });
    if (fileData?.fileUri) {
        contentParts.push({ fileData: { mimeType: fileData.mimeType, fileUri: fileData.fileUri } });
    }

    // 7. PROMPT ENGINEERING
    const systemInstruction = `
${agent.systemPrompt}

=== 🧠 KNOWLEDGE BASE (Verified Facts) ===
${vectorContext || "No specific database match."}

=== 📁 ATTACHED FILES ===
(See attached documents for Global Rules & User Docs)

=== 🧬 STARTUP DNA ===
${startupContext ? JSON.stringify(startupContext) : "Not provided"}

INSTRUCTIONS:
- Prioritize "KNOWLEDGE BASE" and "FILES".
- Be concise.
    `;

    // Add History
    let fullConversation = systemInstruction + "\n\n=== HISTORY ===\n";
    if (history && Array.isArray(history)) {
        history.slice(-5).forEach((msg: any) => {
            if (msg.role !== 'system') {
                fullConversation += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
            }
        });
    }
    fullConversation += `User: ${message}\nAI:`;
    contentParts.push({ text: fullConversation });

    // 8. GENERATION (With Self-Healing Logic)
    let textResponse = "";
    try {
        console.log(`🚀 Sending to ${targetModel} (Parts: ${contentParts.length})...`);
        const result = await model.generateContent(contentParts);
        textResponse = result.response.text();
    } catch (error: any) {
        // 🔥 Self-Healing: If files fail (403/404), retry without files
        if (error.message.includes("403") || error.message.includes("404") || error.message.includes("access the File")) {
            console.warn("⚠️ Stale file detected! Retrying text-only...");
            const textParts = contentParts.filter(p => !p.fileData);
            textParts[textParts.length - 1].text += "\n[NOTE: Some files were inaccessible. Answer based on text only.]";
            
            const retryResult = await model.generateContent(textParts);
            textResponse = retryResult.response.text();
        } else {
            throw error; // Other errors are real errors
        }
    }

    // 9. DATASET LOGGING (Save for Training)
    try {
        await adminDb.collection("golden_dataset").add({
            instruction: message,
            output: textResponse,
            agent: agent.name,
            userId: userId || "guest",
            timestamp: FieldValue.serverTimestamp(),
            meta: { model: targetModel, has_vector: !!vectorContext }
        });
    } catch (e) { console.warn("Log failed"); }

    logServiceStatus("Core Chat API", true, `Model ${targetModel} responded in ${agent.name}`);
    return NextResponse.json({ reply: textResponse });

  } catch (error: any) {
    console.error("❌ AI Error:", error.message);
    logServiceStatus("Core Chat API", false, error.message || "AI pipeline failure");
    logSystemAlert({
      service: "Core Chat API",
      message: error.message || "AI pipeline failure",
      severity: "critical",
      detail: error.stack,
      resolution: "Check Gemini API quota, vector DB connectivity, and retry with trimmed files.",
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

}
