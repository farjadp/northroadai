// ============================================================================
// 📁 Hardware Source: src/lib/gamification-engine.ts
// 🕒 Date: 2025-12-04
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Fetches XP values from 'settings/gamification'.
// 2. Increments user XP and calculates Level.
// 3. Logs events to 'xp_logs'.
// ============================================================================

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type ActionType =
    | "CHAT_MSG"
    | "ARENA_BATTLE"
    | "COMPLETE_DNA"
    | "UPLOAD_FILE"
    | "DAILY_LOGIN";

const DEFAULT_XP_VALUES: Record<ActionType, number> = {
    "CHAT_MSG": 5,
    "ARENA_BATTLE": 50,
    "COMPLETE_DNA": 500,
    "UPLOAD_FILE": 20,
    "DAILY_LOGIN": 10
};

/**
 * Calculates Level based on Total XP.
 * Formula: Level = floor(XP / 500) + 1
 * Level 1: 0-499
 * Level 2: 500-999
 * ...
 */
export function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

/**
 * Awards XP to a user for a specific action.
 * This is designed to be "Fire-and-Forget" safe.
 */
export async function awardXP(userId: string, action: ActionType) {
    try {
        // 1. Fetch XP Value (with fallback)
        let xpAmount = DEFAULT_XP_VALUES[action];

        try {
            const settingsSnap = await adminDb.collection("settings").doc("gamification").get();
            if (settingsSnap.exists) {
                const data = settingsSnap.data();
                if (data && data[action] !== undefined) {
                    xpAmount = Number(data[action]);
                }
            }
        } catch (err) {
            console.warn("⚠️ Failed to fetch gamification settings, using defaults.", err);
        }

        if (xpAmount === 0) return; // No XP for this action

        console.log(`✨ Awarding ${xpAmount} XP to ${userId} for ${action}`);

        // 2. Update User Doc (Atomic Increment)
        const userRef = adminDb.collection("users").doc(userId);

        await adminDb.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) return;

            const userData = userDoc.data();
            const currentXP = (userData?.gamification?.xp || 0) + xpAmount;
            const newLevel = calculateLevel(currentXP);
            const oldLevel = userData?.gamification?.level || 1;

            // Update User
            t.set(userRef, {
                gamification: {
                    xp: currentXP,
                    level: newLevel,
                    lastAction: FieldValue.serverTimestamp(),
                    // Preserve existing badges if any
                    badges: userData?.gamification?.badges || []
                }
            }, { merge: true });

            // Log Event
            const logRef = adminDb.collection("xp_logs").doc();
            t.set(logRef, {
                userId,
                action,
                xpAmount,
                timestamp: FieldValue.serverTimestamp(),
                newLevel: newLevel > oldLevel ? newLevel : null // Only log level up if it happened
            });
        });

    } catch (error) {
        console.error("❌ Gamification Error:", error);
        // We do NOT throw here to prevent breaking the main app flow
    }
}
