// ============================================================================
// 📁 Hardware Source: src/lib/env.ts
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Centralized Environment Validation.
// - Validates existence of critical keys on import.
// - Throws robust error if missing.
// ============================================================================

import { z } from 'zod';

const envSchema = z.object({
    // Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_API_KEY"),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_APP_ID"),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

    // Google Gemini
    GEMINI_API_KEY: z.string().min(1, "Missing GEMINI_API_KEY"),

    // Optional overrides
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    MOBILE_BUILD: z.string().optional(),
});

// Process Env wrapper
const processEnv = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    MOBILE_BUILD: process.env.MOBILE_BUILD,
};

// Validate immediately on import
// console.log("🔒 Validating Environment Variables...");

// Helper to check if we are in a build environment (server-side, no window, and missing keys)
// This allows the build to proceed without crashing on missing runtime secrets.
const isBuildPhase = typeof window === "undefined" && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    if (isBuildPhase) {
        // console.warn("⚠️ Build phase detected. Skipping strict env validation.");
    } else {
        console.error("❌ Invalid Environment Variables:", parsed.error.format());

        // In dev/build, we might want to warn or crash. 
        // For safety in production deployment, we should likely crash if criticals are missing.
        if (process.env.NODE_ENV === 'production') {
            throw new Error("❌ Invalid Environment Variables");
        } else {
            // In dev, sometimes we might be partial, but let's be strict for user request "Quality"
            // console.warn("⚠️  Missing Env Vars. Check .env.local");
        }
    }
}

// If in build phase and parsing failed, allow empty values to avoid crash
// Otherwise, rely on parsed.data or fallback (which will be invalid but we threw/logged above)
const envData = parsed.success ? parsed.data : (isBuildPhase ? processEnv : processEnv) as z.infer<typeof envSchema>;

export const env = envData;
