// src/app/api/upload/route.ts
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

// این پکیج نیاز به API Key دارد
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. فایل را موقتاً در سرور ذخیره می‌کنیم (چون گوگل مسیر فایل می‌خواهد)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // مسیر موقت (Temp)
    const tempFilePath = path.join(os.tmpdir(), file.name);
    await writeFile(tempFilePath, buffer);

    // 2. آپلود به Google AI
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    // 3. فایل موقت را پاک می‌کنیم (اختیاری ولی تمیزتر است)
    // fs.unlink(tempFilePath) ... 

    console.log(`✅ File Uploaded: ${uploadResponse.file.uri}`);

    // آدرس فایل در سرورهای گوگل را برمی‌گردانیم
    return NextResponse.json({ 
      fileUri: uploadResponse.file.uri, 
      mimeType: uploadResponse.file.mimeType 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}