// ============================================================================
// 📁 Hardware Source: src/lib/packages.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Defines the strict limitations for each tier.
// ============================================================================

export type PackageTier = "guest" | "free_user" | "premium_agent";

export const PACKAGE_LIMITS: Record<PackageTier, { daily_messages: number; max_tokens: number }> = {
    guest: {
        daily_messages: 3,
        max_tokens: 1000
    },
    free_user: {
        daily_messages: 5,
        max_tokens: 2000
    },
    premium_agent: { // Applied if user has unlocked the specific agent
        daily_messages: 50,
        max_tokens: 12000 // Higher context window for paid agents
    }
};

export function getLimitForUser(isGuest: boolean, hasUnlockedAgent: boolean) {
    if (hasUnlockedAgent) return PACKAGE_LIMITS.premium_agent;
    if (!isGuest) return PACKAGE_LIMITS.free_user;
    return PACKAGE_LIMITS.guest;
}
