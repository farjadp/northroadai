// ============================================================================
// 📁 Hardware Source: src/app/api/admin/ingest/route.ts
// 🕒 Date: 2025-12-01 00:30
// 🧠 Version: v3.1 (Expanded Logic + Full Preservation)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Robust URL Parsing (Preserved).
// 2. Batch Processing & Error Handling (Preserved).
// 3. Audit Logging to 'ingest_logs' (Preserved).
// 4. FIX: Added support for 'prompt', 'completion', 'reasoning' columns.
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
        const { datasetName, targetAgents } = await req.json();

        if (!datasetName) {
            return NextResponse.json({ error: "Dataset name required" }, { status: 400 });
        }

        // 1. تمیز کردن ورودی (Cleaning Logic)
        let cleanName = datasetName.trim();
        // حذف پیشوند URL و پروتکل‌ها
        cleanName = cleanName.replace(/^https?:\/\/(www\.)?huggingface\.co\/datasets\//, "");
        // حذف اسلش‌های اضافی
        cleanName = cleanName.replace(/\/$/, "");

        console.log(`🔹 Target Dataset: ${cleanName}`);

        // 2. دریافت دیتا از Hugging Face API
        const hfUrl = `https://datasets-server.huggingface.co/rows?dataset=${cleanName}&config=default&split=train&offset=0&length=50`;

        console.log(`📥 Fetching from: ${hfUrl}`);
        const hfRes = await fetch(hfUrl);

        if (!hfRes.ok) {
            const errorText = await hfRes.text();
            console.error("HF Error Body:", errorText);
            return NextResponse.json({ error: `Hugging Face Error: ${hfRes.status} ${hfRes.statusText}. Check dataset name.` }, { status: 400 });
        }

        const hfData = await hfRes.json();

        if (!hfData.rows || !Array.isArray(hfData.rows)) {
            return NextResponse.json({ error: "Invalid dataset format received from Hugging Face." }, { status: 400 });
        }

        const rows = hfData.rows;
        console.log(`📦 Found ${rows.length} items. Starting embedding...`);

        // 3. آماده‌سازی برای پردازش
        const embedModel = createGenAI().getGenerativeModel({ model: "text-embedding-004" });
        const batch = adminDb.batch();
        const collectionRef = adminDb.collection("knowledge_base");

        let processedCount = 0;

        // 4. حلقه پردازش
        for (const row of rows) {
            const item = row.row;

            // --- تغییرات جدید اینجاست (اضافه کردن ستون‌های بیشتر) ---
            // پیدا کردن فیلدهای سوال (با اولویت‌بندی)
            const question = item.question || item.instruction || item.input || item.text || item.prompt || "N/A";

            // پیدا کردن فیلدهای جواب (شامل completion و reasoning)
            const answer = item.answer || item.output || item.response || item.label || item.completion || item.reasoning || "N/A";

            if (question === "N/A" && answer === "N/A") continue;

            const textContent = `Q: ${question}\n\nA: ${answer}`;

            try {
                // تولید وکتور
                const embeddingResult = await embedModel.embedContent(textContent);
                const vector = embeddingResult.embedding.values;

                const docRef = collectionRef.doc();
                batch.set(docRef, {
                    text: textContent,
                    embedding: FieldValue.vector(vector),
                    source: `hf://${cleanName}`,
                    targetAgents: targetAgents || ['all'], // 🔥 Access Control
                    originalId: row.row_idx || null,
                    createdAt: new Date()
                });
                processedCount++;

            } catch (err: any) {
                console.error(`⚠️ Embedding skipped for item: ${err.message}`);
            }
        }

        // 5. ذخیره نهایی و لاگ کردن
        if (processedCount > 0) {
            // الف: ذخیره وکتورها
            await batch.commit();
            console.log(`✅ Successfully saved ${processedCount} vectors.`);

            // ب: ثبت در تاریخچه (Audit Log) - این بخش کاملاً حفظ شده است
            try {
                await adminDb.collection("ingest_logs").add({
                    dataset: cleanName,
                    count: processedCount,
                    status: "success",
                    source: "Hugging Face",
                    timestamp: FieldValue.serverTimestamp()
                });
                console.log("📝 Audit log created.");
            } catch (logErr) {
                console.warn("⚠️ Failed to create audit log, but data is safe.");
            }

        } else {
            return NextResponse.json({ error: "No valid text data found in these rows to embed." }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully ingested ${processedCount} items from ${cleanName}`
        });

    } catch (error: any) {
        console.error("❌ Ingest Critical Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
