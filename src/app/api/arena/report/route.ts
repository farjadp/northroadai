// ============================================================================
// 📁 Hardware Source: src/app/api/arena/report/route.ts
// 🧠 Version: v1.0 (The Verdict Engine)
// ----------------------------------------------------------------------------
// ✅ Logic: Analyzes the fight history and returns a JSON scorecard.
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { history, opponent, dna } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `
    You are the Judge of a Startup Arena Battle.
    The Founder (User) just fought against ${opponent.name} (${opponent.role}).
    
    Startup Context: ${JSON.stringify(dna)}
    
    Conversation History:
    ${history.map((m: any) => `${m.role}: ${m.content}`).join("\n")}

    TASK: Analyze the founder's performance. Be harsh but fair.
    OUTPUT JSON format:
    {
        "score": number (0-100),
        "verdict": "Pass" or "Fail",
        "killing_blow": "The exact sentence or reason why they failed/won",
        "weakness": "Strategy / Finance / Product / Sales",
        "prescription": "One actionable advice to fix the weakness"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    return NextResponse.json(response);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}