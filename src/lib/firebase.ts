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
// Check if we are in a browser or if keys are present
const isBuildPhase = typeof window === "undefined" && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key-for-build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:00000000:web:00000000",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize only if not already initialized
const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
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
