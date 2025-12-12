// ============================================================================
// 📁 Hardware Source: src/app/api/upload/route.ts
// 🕒 Date: 2025-12-11
// 🧠 Version: v3.0 (Secured & Validated)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. Removed Hardcoded API Key (Critical).
// 2. Added Firebase Admin Auth Verification.
// 3. Added Zod Validation for File Type/Size.
// 4. Added Audit Logging.
// ============================================================================

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { UploadValidationSchema } from "@/lib/schemas/admin-validation";
import { env } from "@/lib/env";
import { AppError, handleApiError } from "@/lib/api-error";

// Force dynamic is crucial for Cloud Run
export const dynamic = 'force-dynamic';

// Helper to get manager safely
const getFileManager = () => {
  // env.ts ensures GEMINI_API_KEY exists on start, so we can trust it here.
  return new GoogleAIFileManager(env.GEMINI_API_KEY);
};

export async function POST(req: Request) {
  let tempFilePath = "";

  try {
    // 1. AUTHENTICATION (Critical)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: Missing Token", 401);
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Optional: Check if user is admin (if you have custom claims or a specific email list)
    // if (!decodedToken.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new AppError("No file provided", 400);
    }

    console.log(`Starting upload for: ${file.name} (${file.type}, ${file.size} bytes) by ${userEmail}`);

    // 2. VALIDATION (Zod + Magic Numbers)
    // We validate the metadata before processing
    // Note: Zod schema sees numbers/strings, so we simply check values against schema logic
    const validationResult = UploadValidationSchema.safeParse({
      fileSize: file.size,
      mimeType: file.type
    });

    if (!validationResult.success) {
      console.warn("Validation failed:", validationResult.error.format());
      throw new AppError("Invalid file type or size", 400, validationResult.error.flatten());
    }

    // 3. SECURE CONTENT VALIDATION (Magic Numbers)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic import for file-type (ESM)
    const { fileTypeFromBuffer } = await import('file-type');
    const typeInfo = await fileTypeFromBuffer(buffer);

    if (!typeInfo) {
      throw new AppError("Unknown file format (Magic Number check failed)", 400);
    }

    // Allow list based on expected usage (PDF, Images, Text)
    const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'text/csv'];

    if (!ALLOWED_MIMES.includes(typeInfo.mime)) {
      console.warn(`Security Block: Upload claimed ${file.type} but is actually ${typeInfo.mime}`);
      throw new AppError(`Security Error: Real file type (${typeInfo.mime}) is not allowed`, 400);
    }

    // 3. Generate Unique Filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to be safe for OS
    const safeName = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Use OS temp dir (writable in Cloud Run)
    tempFilePath = path.join(os.tmpdir(), safeName);

    // 4. Write to Temp
    // Buffer already created in validation step
    await writeFile(tempFilePath, buffer);
    console.log(`Written to temp: ${tempFilePath}`);

    // 5. Upload to Google AI
    const fileManager = getFileManager();

    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    console.log(`Google Upload Success: ${uploadResponse.file.uri}`);

    // 6. AUDIT LOGGING
    await adminDb.collection("audit_logs").add({
      action: "UPLOAD_FILE",
      userId: userId,
      userEmail: userEmail,
      details: {
        fileName: file.name,
        fileSize: file.size,
        fileUri: uploadResponse.file.uri,
        mimeType: file.type
      },
      timestamp: Timestamp.now(),
      status: "SUCCESS",
      ip: req.headers.get("x-forwarded-for") || "unknown"
    });

    return NextResponse.json({
      fileUri: uploadResponse.file.uri,
      mimeType: uploadResponse.file.mimeType
    });

  } catch (error: any) {
    return handleApiError(error);

  } finally {
    // 7. Cleanup
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log("Temp file cleaned up");
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}