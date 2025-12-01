"use server";

// ============================================================================
// 📁 Hardware Source: src/app/mentor/profile/actions.ts
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0 (Mentor Profile Actions)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Server Actions for create/update/read of mentor profiles.
// - Verifies Firebase ID token + role === mentor.
// - Uses Firestore Admin for secure reads/writes.
// ============================================================================

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  MentorProfile,
  MentorProfileInput,
  MentorProfileUpdateInput,
  mentorProfileCreateSchema,
  mentorProfileUpdateSchema,
} from "@/lib/mentor-profile";
import { Timestamp, type DocumentData } from "firebase-admin/firestore";

type TokenPayload = {
  token: string;
};

type ProfilePayload = TokenPayload & {
  profile: MentorProfileInput;
};

type ProfileUpdatePayload = TokenPayload & {
  profile: MentorProfileUpdateInput;
};

async function verifyMentorToken(idToken: string) {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // Check custom claims first, then fallback to Firestore doc
  const tokenRole =
    (decoded as { role?: string; firebase?: { sign_in_attributes?: { role?: string } } }).role ||
    decoded.firebase?.sign_in_attributes?.role;
  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userRole = userSnap.data()?.role;

  if (tokenRole !== "mentor" && userRole !== "mentor") {
    throw new Error("Access denied: mentor role required.");
  }

  return { uid, userDoc: userSnap.data() };
}

function sanitize<T extends Record<string, unknown>>(data: T): Partial<T> {
  const clean: Partial<T> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    clean[key as keyof T] = value;
  });
  return clean;
}

function mapProfile(docId: string, data: DocumentData): MentorProfile {
  return {
    userId: docId,
    fullName: data.fullName,
    avatarUrl: data.avatarUrl,
    industries: data.industries || [],
    expertiseTags: data.expertiseTags || [],
    coachingStyle: data.coachingStyle,
    languages: data.languages || [],
    isInvestor: !!data.isInvestor,
    portfolio: data.portfolio || [],
    badges: data.badges || [],
    calendlyUrl: data.calendlyUrl,
    hourlyRate: data.hourlyRate,
    visibility: data.visibility || "private",
    bio: data.bio,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
  };
}

export async function getMentorProfileAction({ token }: TokenPayload) {
  const { uid } = await verifyMentorToken(token);
  const snap = await adminDb.collection("mentor_profiles").doc(uid).get();
  if (!snap.exists) return null;
  return mapProfile(uid, snap.data() || {});
}

export async function createMentorProfileAction({ token, profile }: ProfilePayload) {
  const { uid } = await verifyMentorToken(token);

  const parsed = mentorProfileCreateSchema.parse({
    ...profile,
    userId: uid,
  });

  const docRef = adminDb.collection("mentor_profiles").doc(uid);
  const existing = await docRef.get();
  if (existing.exists) {
    throw new Error("Profile already exists. Use update instead.");
  }

  const now = Timestamp.now();

  await docRef.set({
    ...parsed,
    userId: uid,
    badges: parsed.badges || [],
    createdAt: now,
    updatedAt: now,
  });

  // Also ensure the user doc has mentor role metadata up to date
  await adminDb
    .collection("users")
    .doc(uid)
    .set(
      {
        role: "mentor",
        fullName: parsed.fullName,
        displayName: parsed.fullName,
        updatedAt: now,
      },
      { merge: true }
    );

  return { success: true };
}

export async function updateMentorProfileAction({ token, profile }: ProfileUpdatePayload) {
  const { uid } = await verifyMentorToken(token);

  const parsed = mentorProfileUpdateSchema.parse({
    ...profile,
    userId: uid,
  });

  const cleanPayload = sanitize(parsed);
  const now = Timestamp.now();

  await adminDb
    .collection("mentor_profiles")
    .doc(uid)
    .set(
      {
        ...cleanPayload,
        userId: uid,
        updatedAt: now,
      },
      { merge: true }
    );

  // Keep user doc in sync for display name if provided
  if (cleanPayload.fullName) {
    await adminDb
      .collection("users")
      .doc(uid)
      .set(
        {
          fullName: cleanPayload.fullName,
          displayName: cleanPayload.fullName,
          updatedAt: now,
        },
        { merge: true }
      );
  }

  return { success: true };
}
