// ============================================================================
// 📁 Hardware Source: src/lib/mentor-service.ts
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Mentor Profile Management
// - Mentor-Founder Assignments
// - Impact Logging
// - Chat Annotations
// ============================================================================

import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    updateDoc,
    addDoc,
    query,
    where,
    Timestamp,
    orderBy,
    limit
} from "firebase/firestore";

// --- INTERFACES ---

export interface MentorProfile {
    userId: string;
    avatarUrl?: string;
    industries: string[];
    expertiseTags: string[];
    coachingStyle: 'Strategic' | 'Tactical' | 'Cheerleader' | 'Challenger';
    languages: string[];
    isInvestor: boolean;
    portfolio: {
        startupName: string;
        outcome: 'Active' | 'Exited' | 'Failed';
    }[];
    badges: string[];
    calendlyUrl?: string;
    hourlyRate?: number | null;
    visibility: 'public' | 'private';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface MentorAssignment {
    id?: string;
    mentorId: string;
    founderId: string;
    assignedBy: string;
    createdAt: Timestamp;
}

export interface ImpactLog {
    id?: string;
    sessionId: string;
    mentorId: string;
    impactRating: boolean;
    confidenceBefore: number;
    confidenceAfter: number;
    taskFollowedUp: boolean;
    comment?: string;
    createdAt: Timestamp;
}

export interface MentorComment {
    id?: string;
    mentorId: string;
    messageId: string;
    comment: string;
    createdAt: Timestamp;
}

// --- SERVICE ---

export const MentorService = {
    // === PROFILES ===

    async getMentorProfile(userId: string): Promise<MentorProfile | null> {
        const docRef = doc(db, "mentor_profiles", userId);
        const snap = await getDoc(docRef);
        return snap.exists() ? (snap.data() as MentorProfile) : null;
    },

    async createOrUpdateMentorProfile(profile: MentorProfile): Promise<void> {
        const docRef = doc(db, "mentor_profiles", profile.userId);
        await setDoc(docRef, {
            ...profile,
            updatedAt: Timestamp.now()
        }, { merge: true });
    },

    // === ASSIGNMENTS ===

    async assignMentor(assignment: MentorAssignment): Promise<string> {
        const colRef = collection(db, "mentor_assignments");
        // Check if already assigned
        const q = query(
            colRef,
            where("mentorId", "==", assignment.mentorId),
            where("founderId", "==", assignment.founderId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs[0].id;

        const docRef = await addDoc(colRef, assignment);
        return docRef.id;
    },

    async getAssignedFounders(mentorId: string): Promise<string[]> {
        const q = query(
            collection(db, "mentor_assignments"),
            where("mentorId", "==", mentorId)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data().founderId);
    },

    async getAssignedMentors(founderId: string): Promise<string[]> {
        const q = query(
            collection(db, "mentor_assignments"),
            where("founderId", "==", founderId)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data().mentorId);
    },

    // === IMPACT LOGS ===

    async logImpact(founderId: string, log: ImpactLog): Promise<string> {
        const colRef = collection(db, `founders/${founderId}/impact_logs`);
        const docRef = await addDoc(colRef, log);
        return docRef.id;
    },

    async getImpactLogs(founderId: string): Promise<ImpactLog[]> {
        const colRef = collection(db, `founders/${founderId}/impact_logs`);
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as ImpactLog));
    },

    // === CHAT ANNOTATIONS ===

    async addCommentToMessage(chatId: string, comment: MentorComment): Promise<string> {
        const colRef = collection(db, `chats/${chatId}/annotations`);
        const docRef = await addDoc(colRef, comment);
        return docRef.id;
    }
};
