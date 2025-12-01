"use server";

// ============================================================================
// 📁 Hardware Source: src/app/actions/mentor-profile-actions.ts
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Server actions for Mentor Profile CRUD.
// - Avatar upload to Firebase Storage.
// - Profile strength calculation.
// ============================================================================

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { mentorProfileUpdateSchema, MentorProfile, MentorProfileUpdate } from "@/lib/schemas/mentor-schema";

// Calculate profile strength (0-100%)
function calculateProfileStrength(profile: Partial<MentorProfile>): number {
    let score = 0;
    const weights = {
        displayName: 5,
        headline: 5,
        bio: 10,
        avatarUrl: 10,
        company: 5,
        position: 5,
        industries: 10,
        skills: 10,
        coachingStyle: 5,
        yearsExperience: 5,
        portfolio: 15,
        isAcceptingMentees: 5,
        pricingModel: 5,
        calendlyUrl: 10
    };

    if (profile.displayName) score += weights.displayName;
    if (profile.headline && profile.headline.length >= 10) score += weights.headline;
    if (profile.bio && profile.bio.length >= 50) score += weights.bio;
    if (profile.avatarUrl) score += weights.avatarUrl;
    if (profile.company) score += weights.company;
    if (profile.position) score += weights.position;
    if (profile.industries && profile.industries.length > 0) score += weights.industries;
    if (profile.skills && profile.skills.length > 0) score += weights.skills;
    if (profile.coachingStyle) score += weights.coachingStyle;
    if (profile.yearsExperience !== undefined && profile.yearsExperience > 0) score += weights.yearsExperience;
    if (profile.portfolio && profile.portfolio.length > 0) score += weights.portfolio;
    if (profile.isAcceptingMentees !== undefined) score += weights.isAcceptingMentees;
    if (profile.pricingModel) score += weights.pricingModel;
    if (profile.calendlyUrl) score += weights.calendlyUrl;

    return Math.min(score, 100);
}

// Get mentor profile
export async function getMentorProfile(uid: string) {
    try {
        const docRef = adminDb.collection("mentor_profiles").doc(uid);
        const snap = await docRef.get();

        if (!snap.exists) {
            return { success: false, error: "Profile not found" };
        }

        const data = snap.data();
        return {
            success: true,
            profile: {
                ...data,
                createdAt: data?.createdAt?.toDate().toISOString(),
                updatedAt: data?.updatedAt?.toDate().toISOString()
            }
        };
    } catch (error: unknown) {
        console.error("Error fetching mentor profile:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}

// Update mentor profile
export async function updateMentorProfile(data: MentorProfileUpdate) {
    try {
        // Validate with Zod
        const validated = mentorProfileUpdateSchema.parse(data);

        // Check auth (in real app, verify request.auth.uid === validated.uid via middleware/context)
        // For now, we trust the server action is only called by authenticated users

        // Calculate profile strength
        const currentDoc = await adminDb.collection("mentor_profiles").doc(validated.uid).get();
        const currentData = currentDoc.exists ? currentDoc.data() : {};
        const merged = { ...currentData, ...validated };
        const profileStrength = calculateProfileStrength(merged);

        // Prepare update
        const updateData: Record<string, unknown> = {
            ...validated,
            profileStrength,
            updatedAt: Timestamp.now()
        };

        // If this is a new profile, set createdAt
        if (!currentDoc.exists) {
            updateData.createdAt = Timestamp.now();
        }

        // Update Firestore
        await adminDb.collection("mentor_profiles").doc(validated.uid).set(updateData, { merge: true });

        return { success: true, profileStrength };
    } catch (error: unknown) {
        console.error("Error updating mentor profile:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Failed to update profile" };
    }
}

// Upload mentor avatar
export async function uploadMentorAvatar(uid: string, formData: FormData) {
    try {
        const file = formData.get("avatar") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." };
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "File too large. Maximum size is 5MB." };
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Firebase Storage
        const bucket = getStorage().bucket();
        const fileName = `avatars/${uid}/avatar.${file.type.split("/")[1]}`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type
            }
        });

        // Make file publicly readable
        await fileRef.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Update profile with new avatar URL
        await adminDb.collection("mentor_profiles").doc(uid).update({
            avatarUrl: publicUrl,
            updatedAt: Timestamp.now()
        });

        return { success: true, avatarUrl: publicUrl };
    } catch (error: unknown) {
        console.error("Error uploading avatar:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to upload avatar" };
    }
}
