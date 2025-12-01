// ============================================================================
// 📁 Hardware Source: src/lib/firebase-admin.ts
// 🧠 Version: v3.0 (FS Module Fix)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Uses 'fs' to read JSON directly (Bypasses TypeScript require error).
// 2. Safe for both Local (reads file) and Cloud Run (skips file).
// ============================================================================

import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

if (!admin.apps.length) {
  try {
    // 1. Local Development
    // ساخت آدرس فایل
    const serviceAccountPath = path.join(process.cwd(), "service-account.json");

    // بررسی اینکه آیا فایل واقعا وجود دارد؟
    if (fs.existsSync(serviceAccountPath)) {
      // خواندن و پارس کردن فایل جیسون
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("🔹 Firebase Admin initialized (Local Mode)");
    } else {
      // اگر فایل نبود، ارور پرتاب کن تا به catch برود
      throw new Error("Local service account file not found.");
    }

  } catch (error) {
    // 2. Production (Cloud Run)
    // وقتی روی سرور گوگل هستیم، فایل جیسون وجود ندارد و خود گوگل دسترسی می‌دهد
    console.log("🔸 using Google Default Credentials (Cloud Run Mode)");

    // جلوگیری از اینیشیالایز تکراری در شرایط خاص
    if (!admin.apps.length) {
      admin.initializeApp();
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();