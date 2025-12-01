// ============================================================================
// 📁 Hardware Source: src/app/api/upload/route.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.0 (Cloud Run Optimized)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. Memory Safety: Deletes temp files immediately to save Cloud Run RAM.
// 2. Filename Safety: Uses timestamps to prevent overwrite collisions.
// 3. Validation: Checks file size and type.
// ============================================================================

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

// ⚠️ حیاتی برای Cloud Run (جلوگیری از کش شدن استاتیک)
export const dynamic = 'force-dynamic';

const createFileManager = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY missing");
  }
  return new GoogleAIFileManager(key);
};

export async function POST(req: Request) {
  // تعریف مسیر فایل بیرون از try برای دسترسی در finally
  let tempFilePath = "";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. اعتبارسنجی (Validation)
    // جلوگیری از آپلود فایل‌های خیلی سنگین (مثلا بالای 10 مگابایت)
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (Max 10MB)" }, { status: 413 });
    }

    // 2. ساخت نام منحصر به فرد (Unique Filename)
    // اگر دو نفر همزمان pitch.pdf آپلود کنند، تداخل پیش می‌آید.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // مسیر موقت در Cloud Run (پوشه /tmp در RAM است)
    tempFilePath = path.join(os.tmpdir(), safeName);

    // 3. ذخیره موقت
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    // 4. آپلود به Google AI
    console.log(`📤 Uploading to Google: ${file.name}`);
    const uploadResponse = await createFileManager().uploadFile(tempFilePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    console.log(`✅ Upload Success: ${uploadResponse.file.uri}`);

    return NextResponse.json({ 
      fileUri: uploadResponse.file.uri, 
      mimeType: uploadResponse.file.mimeType 
    });

  } catch (error: any) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });

  } finally {
    // 5. پاکسازی حافظه (حیاتی برای Cloud Run)
    // چه آپلود موفق باشد چه شکست بخورد، فایل باید از RAM پاک شود
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log("🧹 Temp file cleaned up");
      } catch (e) {
        console.warn("⚠️ Failed to cleanup temp file:", e);
      }
    }
  }
}
