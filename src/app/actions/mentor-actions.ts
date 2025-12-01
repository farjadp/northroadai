"use server";

import { adminDb } from "@/lib/firebase-admin";
import { MentorProfile, MentorAssignment, ImpactLog, MentorComment } from "@/lib/mentor-service";
import { Timestamp } from "firebase-admin/firestore";

// Helper to convert client Timestamp to Admin Timestamp if needed, 
// but here we usually receive plain objects from client and convert to Admin Firestore types.

export async function createMentorProfile(profile: MentorProfile) {
    try {
        await adminDb.collection("mentor_profiles").doc(profile.userId).set({
            ...profile,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating mentor profile:", error);
        return { success: false, error: "Failed to create profile" };
    }
}

export async function updateMentorProfile(userId: string, data: Partial<MentorProfile>) {
    try {
        await adminDb.collection("mentor_profiles").doc(userId).update({
            ...data,
            updatedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating mentor profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function assignMentor(mentorId: string, founderId: string, assignedBy: string) {
    try {
        // Check if already assigned
        const snapshot = await adminDb.collection("mentor_assignments")
            .where("mentorId", "==", mentorId)
            .where("founderId", "==", founderId)
            .get();

        if (!snapshot.empty) {
            return { success: false, error: "Already assigned" };
        }

        const assignment: MentorAssignment = {
            mentorId,
            founderId,
            assignedBy,
            createdAt: Timestamp.now() as unknown as Timestamp // Align admin timestamp to client type
        };

        await adminDb.collection("mentor_assignments").add(assignment);
        return { success: true };
    } catch (error: unknown) {
        console.error("Error assigning mentor:", error);
        return { success: false, error: "Failed to assign mentor" };
    }
}

export async function logImpactSession(founderId: string, log: Omit<ImpactLog, "createdAt" | "id">) {
    try {
        // Verify assignment exists (Security Check)
        const assignmentSnap = await adminDb.collection("mentor_assignments")
            .where("mentorId", "==", log.mentorId)
            .where("founderId", "==", founderId)
            .get();

        if (assignmentSnap.empty) {
            return { success: false, error: "Unauthorized: Mentor not assigned to this founder" };
        }

        await adminDb.collection(`founders/${founderId}/impact_logs`).add({
            ...log,
            createdAt: Timestamp.now()
        });
        return { success: true };
    } catch (error: unknown) {
        console.error("Error logging impact:", error);
        return { success: false, error: "Failed to log impact" };
    }
}

export async function addMentorComment(chatId: string, comment: Omit<MentorComment, "createdAt" | "id">) {
    try {
        // In a real app, we would verify if the mentor has access to this chat
        // For now, we assume the caller is authorized or we'd check a separate permission collection

        await adminDb.collection(`chats/${chatId}/annotations`).add({
            ...comment,
            createdAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { success: false, error: "Failed to add comment" };
    }
}
