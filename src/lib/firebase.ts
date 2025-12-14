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
    "AIzaSyBJ2loREYHm2suzueqpbPrbvH3_1Nva9Uk",
  authDomain:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ||
    "north-road-ai.firebaseapp.com",
  projectId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID") || "north-road-ai",
  storageBucket:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
    "north-road-ai.firebasestorage.app",
  messagingSenderId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ||
    "851251000176",
  appId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_APP_ID") ||
    "1:851251000176:web:cdb5cb5ce6f6587a8e95b5",
  measurementId:
    getRuntimeConfigValue("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") ||
    "G-GYP2DWZCCJ",
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
