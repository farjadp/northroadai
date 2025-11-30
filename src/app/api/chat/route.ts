// ============================================================================
// 📁 Hardware Source: src/app/api/chat/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v7.0 (Uncensored + Chat History Support)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. Adds 'safetySettings' to prevent "I cannot answer" errors on Visa/Legal topics.
// 2. Injects 'history' into the prompt so AI remembers context.
// 3. Keeps Smart Model Selection.
// ============================================================================

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { KnowledgeService } from "@/lib/api/knowledge";
import { UserService } from "@/lib/user-service";
import { getAgentById, getDefaultAgent } from "@/lib/agents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // دریافت history از درخواست
    const { message, startupContext, fileData, agentId, userId, history } = await req.json();

    // 1. Validate Access
    const requestedAgentId = agentId || "navigator";
    if (userId && requestedAgentId !== "navigator") {
      const hasAccess = await UserService.checkAgentAccess(userId, requestedAgentId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Access Denied." }, { status: 403 });
      }
    }

    // 2. Setup Agent
    const agent = getAgentById(requestedAgentId) || getDefaultAgent();

    // 3. Smart Model Selection
    let targetModel = "gemini-2.0-flash"; 
    try {
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const listData = await listReq.json();
        if (listData.models) {
            const names = listData.models.map((m: any) => m.name);
            const priorities = ["models/gemini-2.0-flash", "models/gemini-2.5-flash", "models/gemini-1.5-flash"];
            const found = priorities.find(p => names.includes(p));
            if (found) targetModel = found.replace("models/", ""); 
        }
    } catch (e) {}

    // ⚠️ SAFETY SETTINGS (حیاتی برای پاسخ به سوالات ویزا و حقوقی)
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

    // 4. RAG Layers
    const globalDocs = await KnowledgeService.getGlobalDocs();
    let userDocs: any[] = [];
    if (userId) userDocs = await KnowledgeService.getUserDocs(userId);

    // 5. Construct Payload
    const contentParts: any[] = [];

    // Inject Files (RAG)
    [...globalDocs, ...userDocs].forEach((doc: any) => {
        if (doc.fileUri) contentParts.push({ fileData: { mimeType: doc.mimeType, fileUri: doc.fileUri } });
    });
    if (fileData?.fileUri) {
        contentParts.push({ fileData: { mimeType: fileData.mimeType, fileUri: fileData.fileUri } });
    }

    // Inject Text Prompt
    const systemInstruction = `
${agent.systemPrompt}

=== CONTEXT & MEMORY ===
1. STARTUP DNA: ${startupContext ? JSON.stringify(startupContext) : "None"}
2. GLOBAL KNOWLEDGE: Use attached docs as primary truth.
    `;

    // ساختار جدید: اضافه کردن تاریخچه چت به پرامپت
    let fullConversation = systemInstruction + "\n\n=== CONVERSATION HISTORY ===\n";
    
    // اگر تاریخچه وجود دارد، آن را اضافه کن (حداکثر ۵ پیام آخر برای جلوگیری از پر شدن توکن)
    if (history && Array.isArray(history)) {
        history.slice(-5).forEach((msg: any) => {
            if (msg.role !== 'system') {
                fullConversation += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
            }
        });
    }

    // اضافه کردن پیام جدید
    fullConversation += `User: ${message}\nAI:`;

    contentParts.push({ text: fullConversation });

    // 6. Generate
    console.log(`🚀 Sending to ${targetModel} (With History & Safety Fix)`);
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("❌ AI Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}