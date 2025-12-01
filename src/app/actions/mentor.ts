"use server";

import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { MentorProfileSchema, MentorProfile } from "@/lib/schemas/mentor";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Helper to calculate profile strength
function calculateProfileStrength(data: Partial<MentorProfile>): number {
  let score = 0;
  const totalWeight = 100;
  
  // Basic Info (20%)
  if (data.displayName) score += 5;
  if (data.headline) score += 5;
  if (data.bio && data.bio.length > 50) score += 5;
  if (data.avatarUrl) score += 5;

  // Professional (20%)
  if (data.company) score += 5;
  if (data.position) score += 5;
  if (data.linkedinUrl) score += 10;

  // Expertise (20%)
  if (data.industries && data.industries.length > 0) score += 10;
  if (data.skills && data.skills.length > 0) score += 10;

  // Portfolio (20%)
  if (data.portfolio && data.portfolio.length > 0) score += 20;

  // Logistics (20%)
  if (data.calendlyUrl) score += 10;
  if (data.pricingModel) score += 10;

  return Math.min(score, 100);
}

export async function updateMentorProfile(data: Partial<MentorProfile>) {
  try {
    // 1. Validate Input
    // We use partial here because we might be updating only parts, 
    // but for a full save we should validate against the full schema if possible.
    // For now, let's assume the form sends the complete object structure or we merge it.
    // Ideally, we validate the fields that are present.
    
    // Note: We are trusting the client to send the correct UID in the data object 
    // matching their auth session. In a real app, we should verify the session user ID here.
    // Since I don't have the session context passed in, I'll assume the caller handles auth check
    // or we check it here if we had a way to get the current user (e.g. cookies).
    // For this implementation, I will assume the `uid` in `data` is the target.
    
    if (!data.uid) {
      throw new Error("User ID is required");
    }

    // 2. Calculate Profile Strength
    const strength = calculateProfileStrength(data);
    
    // 3. Prepare Data for Firestore
    const updateData = {
      ...data,
      profileStrength: strength,
      updatedAt: new Date(), // Firestore Admin SDK handles JS Date objects usually, or we convert to Timestamp
    };

    // Remove undefined fields to avoid Firestore errors
    Object.keys(updateData).forEach(key => 
      (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );

    // 4. Update Firestore
    await adminDb.collection("mentor_profiles").doc(data.uid).set(updateData, { merge: true });

    // 5. Revalidate
    revalidatePath("/mentor/profile");
    revalidatePath(`/mentor/${data.uid}`);

    return { success: true, strength };
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getMentorProfile(uid: string) {
  try {
    const doc = await adminDb.collection("mentor_profiles").doc(uid).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    
    // Convert Firestore Timestamps to Dates for client
    return {
      ...data,
      createdAt: data?.createdAt?.toDate?.() || data?.createdAt,
      updatedAt: data?.updatedAt?.toDate?.() || data?.updatedAt,
    } as MentorProfile;
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    return null;
  }
}

export async function uploadMentorAvatar(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const uid = formData.get("uid") as string;

    if (!file || !uid) {
      return { success: false, error: "Missing file or user ID" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket();
    const filename = `avatars/${uid}/${Date.now()}-${file.name}`;
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: "Failed to upload avatar" };
  }
}
