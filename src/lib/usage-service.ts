// ============================================================================
// 📁 Hardware Source: src/lib/usage-service.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// stored in `users/{userId}/usage/{dateDoc}`
// ============================================================================

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { PACKAGE_LIMITS, getLimitForUser } from "./packages";

export class UsageService {

    /**
     * Checks if the user can send a message based on their limits.
     * @returns { canProceed: boolean, message?: string }
     */
    static async checkAndIncrementUsage(userId: string, agentId: string, userUnlockedAgents: string[] = []) {
        if (!userId) return { canProceed: true }; // Guests handled by client-side or specific logic, but let's be strict

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const usageRef = adminDb.collection("users").doc(userId).collection("usage").doc(today);

        // Determine Limits
        const hasUnlocked = userUnlockedAgents.includes(agentId);
        const limits = getLimitForUser(false, hasUnlocked);

        try {
            return await adminDb.runTransaction(async (t) => {
                const doc = await t.get(usageRef);
                const data = doc.data() || { count: 0 };
                const currentCount = data.count || 0;

                if (currentCount >= limits.daily_messages) {
                    return {
                        canProceed: false,
                        message: `🚫 Daily Limit Reached. You have used ${currentCount}/${limits.daily_messages} messages for this tier.`
                    };
                }

                // Increment
                t.set(usageRef, {
                    count: currentCount + 1,
                    lastUpdated: FieldValue.serverTimestamp()
                }, { merge: true });

                return { canProceed: true };
            });

        } catch (error) {
            console.error("Usage Check Failed:", error);
            // Default to allow if DB fails, to avoid blocking valid users during outages? 
            // Or block for safety? Let's allow but log.
            return { canProceed: true };
        }
    }

    static async getUsageStats(userId: string) {
        const today = new Date().toISOString().split('T')[0];
        const doc = await adminDb.collection("users").doc(userId).collection("usage").doc(today).get();
        return doc.data() || { count: 0 };
    }
}
