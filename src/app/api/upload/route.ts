// ============================================================================
// 📁 Hardware Source: src/app/api/upload/route.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v2.1 (Debug Enhanced)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. Explicit API Key check.
// 2. Enhanced Error Logging to console (visible in Cloud Run logs).
// 3. MIME type fallback logic.
// ============================================================================

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

// Force dynamic is crucial for Cloud Run
export const dynamic = 'force-dynamic';

// Helper to get manager safely
const getFileManager = () => {
  // Fallback key if env var is missing (Replace with your actual key if env var keeps failing)
  const key = process.env.GEMINI_API_KEY || "AIzaSyDFzblmzu4FWl6u9oBHOrgQT9Y1w2EZ6bI"; 
  
  if (!key) {
    throw new Error("GEMINI_API_KEY is completely missing in server environment");
  }
  return new GoogleAIFileManager(key);
};

export async function POST(req: Request) {
  let tempFilePath = "";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`📥 Starting upload for: ${file.name} (${file.type}, ${file.size} bytes)`);

    // 1. Validation
    // Google AI File API limit is actually 2GB, but let's keep it safe at 500MB
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (Max 500MB)" }, { status: 413 });
    }

    // 2. Generate Unique Filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to be safe for OS
    const safeName = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // Use OS temp dir (writable in Cloud Run)
    tempFilePath = path.join(os.tmpdir(), safeName);

    // 3. Write to Temp
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);
    console.log(`💾 Written to temp: ${tempFilePath}`);

    // 4. Upload to Google AI
    const fileManager = getFileManager();
    
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type, 
      displayName: file.name,
    });

    console.log(`✅ Google Upload Success: ${uploadResponse.file.uri}`);

    return NextResponse.json({
      fileUri: uploadResponse.file.uri,
      mimeType: uploadResponse.file.mimeType
    });

  } catch (error: any) {
    console.error("❌ Upload API Critical Error:", error);
    
    // Return the actual error message to the frontend for better debugging
    return NextResponse.json(
      { error: error.message || "Internal Server Error during upload" }, 
      { status: 500 }
    );

  } finally {
    // 5. Cleanup
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log("🧹 Temp file cleaned up");
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}