// ============================================================================
// 📁 Hardware Source: src/app/api/chat/route.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v18.0 (Self-Healing + Clean UI Fix)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. "String Slicing": Removes JSON metadata 100% reliably (No more leaking codes).
// 2. "Auto-Retry": If a file is expired (403 error), it retries automatically without files.
// 3. Smart Model: Auto-detects Gemini 2.0 vs 1.5.
// ============================================================================

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { KnowledgeService } from "@/lib/api/knowledge";
import { UserService } from "@/lib/user-service";
import { getAgentById, getDefaultAgent } from "@/lib/agents";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logServiceStatus, logSystemAlert } from "@/lib/system-status";
import { awardXP } from "@/lib/gamification-engine";
import { UsageService } from "@/lib/usage-service";

export const dynamic = 'force-dynamic';

const createGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {

    try {
        const startTime = Date.now();
        const { message, startupContext, fileData, agentId, userId, history } = await req.json();

        // 1. ACCESS CONTROL
        const requestedAgentId = agentId || "navigator";
        if (userId && requestedAgentId !== "navigator") {
            const hasAccess = await UserService.checkAgentAccess(userId, requestedAgentId);
            if (!hasAccess) return NextResponse.json({ error: "Access Denied." }, { status: 403 });
        }

        const agent = getAgentById(requestedAgentId) || getDefaultAgent();

        // 1.5 USAGE LIMIT CHECK
        if (userId) {
            const userRef = adminDb.collection("users").doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            const unlockedAgents = userData?.unlockedAgents || [];

            const usageCheck = await UsageService.checkAndIncrementUsage(userId, requestedAgentId, unlockedAgents);

            if (!usageCheck.canProceed) {
                return NextResponse.json({
                    error: usageCheck.message || "Daily Limit Exceeded",
                    isLimitReached: true // Flag for frontend to show upgrade modal
                }, { status: 429 });
            }
        }

        // 2. SMART MODEL SELECTION
        let targetModel = "gemini-pro";
        try {
            const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const listData = await listReq.json();
            if (listData.models) {
                const names = listData.models.map((m: any) => m.name);
                // Priority: 2.0 Flash -> 1.5 Pro -> 1.5 Flash
                const priorities = ["models/gemini-2.0-flash", "models/gemini-2.5-flash", "models/gemini-1.5-flash", "models/gemini-pro"];
                const found = priorities.find(p => names.includes(p));
                if (found) targetModel = found.replace("models/", "");
            }
        } catch (e) { console.warn("Model check failed"); }

        // 3. WELCOME MESSAGE
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

        // 5. VECTOR SEARCH
        let vectorContext = "";
        try {
            const embedModel = createGenAI().getGenerativeModel({ model: "text-embedding-004" });
            const embeddingResult = await embedModel.embedContent(message);
            const vector = embeddingResult.embedding.values;

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
            console.warn("⚠️ Vector Search skipped.");
        }

        // 6. FILE CONTEXT
        const globalDocs = await KnowledgeService.getGlobalDocs();
        let userDocs: any[] = [];
        if (userId) userDocs = await KnowledgeService.getUserDocs(userId);

        const contentParts: any[] = [];

        // Add Files
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
(See attached documents)

=== 🧬 STARTUP DNA ===
${startupContext ? JSON.stringify(startupContext) : "Not provided"}

INSTRUCTIONS:
1. Answer the user clearly.
2. **CRITICAL**: You MUST end your response with a JSON block containing metadata.
3. Do NOT wrap the JSON block in markdown code fences. Just the raw delimiters.

FORMAT:
[Your Answer Text Here]

|||START_SOURCES|||
{
  "sources": {
    "files": <number>,
    "knowledge_base": <boolean>,
    "internal_knowledge": <boolean>
  },
  "confidence_score": <number 0-100>
}
|||END_SOURCES|||
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

        // 8. GENERATION LOOP (With Auto-Retry)
        let textResponse = "";
        let sources = null;
        let confidenceScore = 0;
        let usageMetadata: any = null;

        try {
            console.log(`🚀 Sending to ${targetModel} (Parts: ${contentParts.length})...`);

            // ATTEMPT 1: Full Context (Files + Text)
            const result = await model.generateContent(contentParts);
            if (result.response.usageMetadata) usageMetadata = result.response.usageMetadata;

            const rawText = result.response.text();

            // Parse Response (String Slicing Method)
            const parsed = parseAIResponse(rawText);
            textResponse = parsed.text;
            sources = parsed.sources;
            confidenceScore = parsed.score;

        } catch (error: any) {
            // 🔥 SELF-HEALING LOGIC FOR 403/404 ERRORS
            // If files are expired/deleted, Google throws 403 or 404
            if (
                error.message.includes("403") ||
                error.message.includes("404") ||
                error.message.includes("access the File") ||
                error.message.includes("not exist")
            ) {
                console.warn("⚠️ Stale file detected! Retrying without files...");

                // Filter out ANY fileData parts, keep only text
                const textOnlyParts = contentParts.filter(p => !p.fileData);

                // Add a note to the prompt
                textOnlyParts[textOnlyParts.length - 1].text += "\n[SYSTEM NOTE: Some attached files were inaccessible. Answer based on text context and Knowledge Base only.]";

                // ATTEMPT 2: Text Only
                const retryResult = await model.generateContent(textOnlyParts);
                if (retryResult.response.usageMetadata) usageMetadata = retryResult.response.usageMetadata;

                const rawText = retryResult.response.text();

                const parsed = parseAIResponse(rawText);
                textResponse = parsed.text;
                sources = parsed.sources;
                confidenceScore = parsed.score;
            } else {
                throw error; // If it's another error, crash properly
            }
        }

        // 9. LOGGING & XP
        const endTime = Date.now();
        const latency = endTime - startTime;

        // Extract Usage Metadata (if available from Gemini)
        // Note: result.response.usageMetadata might be undefined depending on SDK version/model
        let usage = { promptTokens: 0, responseTokens: 0, totalTokens: 0 };
        if (usageMetadata) {
            usage = {
                promptTokens: usageMetadata.promptTokenCount || 0,
                responseTokens: usageMetadata.candidatesTokenCount || 0,
                totalTokens: usageMetadata.totalTokenCount || 0
            };
        }

        try {
            // A. Training Data (Golden Dataset)
            await adminDb.collection("golden_dataset").add({
                instruction: message,
                output: textResponse,
                agent: agent.name,
                userId: userId || "guest",
                timestamp: FieldValue.serverTimestamp(),
                meta: { model: targetModel, confidence: confidenceScore }
            });

            // B. System Logs (Admin Dashboard)
            await adminDb.collection("system_logs").add({
                type: "activity", // admin | user | activity
                title: `Chat Generation (${agent.name})`,
                detail: `User ${userId ? userId.substring(0, 5) : "Guest"} asked: "${message.substring(0, 30)}..."`,
                severity: "info",
                timestamp: FieldValue.serverTimestamp(),
                metadata: {
                    userId: userId || "guest",
                    model: targetModel,
                    latencyMs: latency,
                    tokens: usage,
                    hasFiles: !!fileData,
                    confidence: confidenceScore
                }
            });

            if (userId) awardXP(userId, "CHAT_MSG").catch(() => { });
        } catch (e) { console.error("Logging failed", e); }

        logServiceStatus("Core Chat API", true, `Model ${targetModel} responded (${usage.totalTokens} tokens)`);

        return NextResponse.json({ reply: textResponse, sources, confidenceScore });

    } catch (error: any) {
        console.error("❌ AI Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- HELPER: ROBUST PARSER ---
function parseAIResponse(rawText: string) {
    let text = rawText;
    let sources = null;
    let score = 0;

    const startTag = "|||START_SOURCES|||";
    const endTag = "|||END_SOURCES|||";

    const startIndex = rawText.indexOf(startTag);
    const endIndex = rawText.lastIndexOf(endTag);

    if (startIndex !== -1 && endIndex !== -1) {
        // 1. Clean Text
        text = rawText.substring(0, startIndex).trim();

        // 2. Extract JSON
        let jsonString = rawText.substring(startIndex + startTag.length, endIndex).trim();
        // Remove markdown wrappers if Gemini added them
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const metadata = JSON.parse(jsonString);
            if (metadata.sources) sources = metadata.sources;
            if (metadata.confidence_score) score = metadata.confidence_score;
        } catch (e) {
            console.warn("Metadata parse failed");
        }
    }

    return { text, sources, score };
}