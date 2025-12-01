// ============================================================================
// 📁 Hardware Source: src/lib/user-service.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v2.0 (Multi-Agent Access Control)
// ----------------------------------------------------------------------------
// ✅ Logic:
// Handles user profile management and agent access control.
// - Tier-based access: Scout (Navigator only), Vanguard+ (All agents)
// - Individual unlock mechanism for premium agents
// ============================================================================

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";

export type UserTier = "SCOUT" | "VANGUARD" | "COMMAND";
export type UserRole = "user" | "admin" | "founder" | "mentor" | "accelerator";

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    tier: UserTier;
    unlockedAgents: string[];
    createdAt: Date;
    lastLogin?: Date;
    role?: UserRole;
}

export const UserService = {
    // Get a user's profile, create if not exists (default to SCOUT)
    async getUserProfile(uid: string, email: string): Promise<UserProfile> {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                uid,
                email: data.email,
                displayName: data.displayName,
                tier: data.tier || "SCOUT",
                unlockedAgents: data.unlockedAgents || ["navigator"],
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: data.lastLogin?.toDate(),
                role: data.role || "user",
            };
        } else {
            // Create new user profile
            const newProfile: UserProfile = {
                uid,
                email,
                tier: "SCOUT",
                unlockedAgents: ["navigator"], // Default to Navigator
                createdAt: new Date(),
                lastLogin: new Date(),
                role: "user",
            };
            await setDoc(userRef, newProfile);
            return newProfile;
        }
    },

    // Update a user's tier (Admin only)
    async updateUserTier(uid: string, tier: UserTier): Promise<void> {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { tier });
    },

    // Get all users (Admin only)
    async getAllUsers(): Promise<UserProfile[]> {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                email: data.email,
                displayName: data.displayName,
                tier: data.tier || "SCOUT",
                unlockedAgents: data.unlockedAgents || ["navigator"],
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: data.lastLogin?.toDate(),
                role: data.role || "user",
            };
        });
    },

    // === AGENT ACCESS CONTROL ===

    // Get unlocked agents for a user
    async getUnlockedAgents(uid: string): Promise<string[]> {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data().unlockedAgents || ["navigator"];
        }
        return ["navigator"];
    },

    // Check if user has access to a specific agent
    async checkAgentAccess(uid: string, agentId: string): Promise<boolean> {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return agentId === "navigator";

        const data = userSnap.data();
        const tier = data.tier || "SCOUT";
        const unlockedAgents = data.unlockedAgents || ["navigator"];

        // Navigator is always accessible
        if (agentId === "navigator") return true;

        // Try plan-based access (includedAgents array on plans/{tier})
        try {
            const planSnap = await getDoc(doc(db, "plans", tier));
            if (planSnap.exists()) {
                const included: string[] = planSnap.data().includedAgents || [];
                if (included.includes(agentId)) return true;
            }
        } catch (err) {
            console.warn("Plan lookup failed, using fallback access rules.", err);
        }

        // Vanguard and Command have access to all agents (fallback)
        if (tier === "VANGUARD" || tier === "COMMAND") return true;

        // Scout tier: Check individual unlocks
        return unlockedAgents.includes(agentId);
    },

    // Unlock an agent for a user (after payment)
    async unlockAgent(uid: string, agentId: string): Promise<void> {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            unlockedAgents: arrayUnion(agentId)
        });
    },

    async updateUserRole(uid: string, role: UserRole): Promise<void> {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { role });
    },

    async isAdmin(uid: string): Promise<boolean> {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() && (userSnap.data().role === "admin");
    },

    async isMentor(uid: string): Promise<boolean> {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() && (userSnap.data().role === "mentor");
    }
};
