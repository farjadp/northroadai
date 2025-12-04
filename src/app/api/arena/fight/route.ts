// ============================================================================
// 📁 Hardware Source: src/app/api/arena/fight/route.ts
// 🧠 Version: v1.0
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { logServiceStatus, logSystemAlert } from "@/lib/system-status";

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, opponent, dna, history } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ساخت پرامپت تهاجمی
    let prompt = `
    ${opponent.systemPrompt}

    STARTUP CONTEXT:
    ${JSON.stringify(dna)}

    CONVERSATION HISTORY:
    ${history.slice(-6).map((m:any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

    USER LATEST DEFENSE: "${message}"

    INSTRUCTION:
    - Respond directly to the user's defense.
    - Be critical. Find logical fallacies.
    - Keep it under 3 sentences.
    - If the user is vague, call them out.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    logServiceStatus("Arena Fight API", true, "Critical bot answered the arena defense");

    return NextResponse.json({ reply: response });

  } catch (error: any) {
    logServiceStatus("Arena Fight API", false, error.message || "Arena fail");
    logSystemAlert({
      service: "Arena Fight API",
      message: error.message || "Arena fight failure",
      severity: "critical",
      detail: error.stack,
      resolution: "Check Gemini quota + opponent prompt formatting, resend request.",
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
