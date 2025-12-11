// ============================================================================
// 📁 Hardware Source: src/app/api/admin/scrape/route.ts
// 🕒 Date: 2025-11-30 23:45
// 🧠 Version: v2.0 (Jina AI Powered Scraper)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. Uses 'r.jina.ai' to handle JavaScript & Anti-bot sites (Medium, YC).
// 2. Returns clean Markdown instead of raw HTML.
// 3. Better Error Logging.
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        const { url, targetAgents } = await req.json();

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        console.log(`🕷️ Scraping via Jina: ${url} [Agents: ${targetAgents?.join(',') || 'all'}]`);

        // 1. Use Jina Reader to extract clean text
        const jinaUrl = `https://r.jina.ai/${url}`;

        const res = await fetch(jinaUrl, {
            headers: {
                "X-No-Cache": "true",
                "Accept": "text/plain"
            }
        });

        if (!res.ok) {
            console.error(`Jina Failed: ${res.status}`);
            return NextResponse.json({ error: `Failed to scrape: Site blocked or unreachable (${res.status})` }, { status: 400 });
        }

        // Get Markdown
        const rawText = await res.text();

        // Clean Markdown
        const cleanText = rawText.replace(/!\[.*?\]\(.*?\)/g, "");

        // Extract Title
        const titleMatch = cleanText.match(/^#\s+(.*)/);
        const title = titleMatch ? titleMatch[1] : url;

        // Check Length
        if (cleanText.length < 200) {
            return NextResponse.json({ error: "Content too short. Jina couldn't extract text." }, { status: 400 });
        }

        // 2. Chunking
        const chunks = splitTextIntoChunks(cleanText, 1500);
        console.log(`🔪 Split "${title}" into ${chunks.length} chunks.`);

        // 3. Embedding & Saving
        const embedModel = createGenAI().getGenerativeModel({ model: "text-embedding-004" });
        const batch = adminDb.batch();
        const collectionRef = adminDb.collection("knowledge_base");

        const CONCURRENCY = 5;
        let savedCount = 0;

        for (let i = 0; i < chunks.length; i += CONCURRENCY) {
            const batchChunks = chunks.slice(i, i + CONCURRENCY);
            console.log(`Processing batch ${Math.ceil((i + 1) / CONCURRENCY)} (Size: ${batchChunks.length})...`);

            const promises = batchChunks.map(async (chunk) => {
                try {
                    const embeddingResult = await embedModel.embedContent(chunk);
                    const vector = embeddingResult.embedding.values;

                    const docRef = collectionRef.doc();
                    batch.set(docRef, {
                        text: `SOURCE: ${title}\nURL: ${url}\nCONTENT: ${chunk}`,
                        embedding: FieldValue.vector(vector),
                        source: "Web Scraper",
                        originalUrl: url,
                        title: title,
                        targetAgents: targetAgents || ['all'], // 🔥 Access Control Restored
                        createdAt: new Date()
                    });
                    return true; // Success
                } catch (e) {
                    console.error("Embedding chunk failed, skipping...", e);
                    return false; // Failed
                }
            });

            const results = await Promise.all(promises);
            savedCount += results.filter(r => r).length;
        }

        if (savedCount > 0) {
            await batch.commit();

            // Log
            await adminDb.collection("ingest_logs").add({
                dataset: title.substring(0, 50),
                count: savedCount,
                status: "success",
                source: "Web Scraper",
                timestamp: FieldValue.serverTimestamp()
            });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully learned: "${title}" (${savedCount} chunks)`
        });

    } catch (error: any) {
        console.error("Scrape Critical Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// تابع کمکی برای شکستن متن (بدون قطع کردن کلمات)
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    let currentChunk = "";

    // تقسیم بر اساس پاراگراف
    const paragraphs = text.split("\n");

    for (const para of paragraphs) {
        if ((currentChunk.length + para.length) > chunkSize) {
            chunks.push(currentChunk);
            currentChunk = para;
        } else {
            currentChunk += "\n" + para;
        }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks;
}
