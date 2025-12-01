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
  apiKey: "AIzaSyBJ2loREYHm2suzueqpbPrbvH3_1Nva9Uk",
  authDomain: "north-road-ai.firebaseapp.com",
  projectId: "north-road-ai",
  storageBucket: "north-road-ai.firebasestorage.app",
  messagingSenderId: "851251000176",
  appId: "1:851251000176:web:cdb5cb5ce6f6587a8e95b5",
  measurementId: "G-GYP2DWZCCJ"
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
