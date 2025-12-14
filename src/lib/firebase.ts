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
import { getRuntimeConfigValue } from "@/lib/runtime-config";

const hasServerKeys =
  typeof window === "undefined" &&
  Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.FIREBASE_API_KEY
  );

const isBuildPhase = typeof window === "undefined" && !hasServerKeys;

const firebaseConfig = {
  apiKey:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_API_KEY") ||
    (isBuildPhase ? "dummy-key-for-build" : ""),
  authDomain:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ||
    (isBuildPhase ? "dummy.firebaseapp.com" : ""),
  projectId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ||
    (isBuildPhase ? "dummy-project" : ""),
  storageBucket:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
    (isBuildPhase ? "dummy.appspot.com" : ""),
  messagingSenderId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ||
    (isBuildPhase ? "0000000000" : ""),
  appId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_APP_ID") ||
    (isBuildPhase ? "1:00000000:web:00000000" : ""),
  measurementId: getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID")
};

if (!isBuildPhase && !firebaseConfig.apiKey) {
  throw new Error(
    "Missing Firebase configuration. Ensure runtime env variables are set."
  );
}

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
