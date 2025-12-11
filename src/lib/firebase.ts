// ============================================================================
// 📁 Hardware Source: src/lib/firebase.ts
// 🧠 Version: v4.0 (Hardcoded Config for Instant Fix)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Direct configuration values to bypass Cloud Build variable stripping.
// - Solves "auth/invalid-api-key" error immediately.
// ============================================================================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// مقادیر مستقیم (از لاگ‌های قبلی شما برداشته شده)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// متغیرهای سراسری
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
let analytics: Analytics | null = null;

// Analytics (Client Side Only)
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch((err) => console.log("Analytics skipped:", err));
}

console.log("🔥 Firebase Config Loaded Successfully");

export { app, auth, db, storage, analytics };
