// ============================================================================
// 📁 Hardware Source: src/lib/firebase-admin.ts
// 🧠 Version: v3.1 (Robust Init)
// ============================================================================

import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

// تابع کمکی برای اینیشیالایز کردن
function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return; // قبلاً اینیشیالایز شده
  }

  try {
    // 1. تلاش برای حالت لوکال (خواندن فایل)
    const serviceAccountPath = path.join(process.cwd(), "service-account.json");
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("🔹 Firebase Admin initialized (Local Mode with File)");
      return;
    }
  } catch (error) {
    console.warn("🔸 Local init skipped, trying default creds...");
  }

  // 2. تلاش برای حالت پروداکشن (Cloud Run)
  try {
    admin.initializeApp();
    console.log("🔹 Firebase Admin initialized (Cloud Run / Default Mode)");
  } catch (error) {
    console.error("❌ Firebase Admin Init Failed:", error);
  }
}

initFirebaseAdmin();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();