// ============================================================================
// 📁 Hardware Source: src/lib/mentor-profile.ts
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0 (Mentor Profile Schema)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Centralized MentorProfile typings and Zod validation.
// - Shared between server actions and client forms.
// ============================================================================

import { z } from "zod";

export const portfolioItemSchema = z.object({
  startupName: z.string().min(1, "Startup name is required"),
  outcome: z.enum(["Active", "Exited", "Failed"]),
});

export const mentorProfileBaseSchema = z.object({
  userId: z.string().min(1),
  fullName: z.string().min(2, "Full name is required"),
  avatarUrl: z.string().url().optional(),
  industries: z.array(z.string()).min(1, "Choose at least one industry"),
  expertiseTags: z.array(z.string()).min(1, "Add at least one expertise tag"),
  coachingStyle: z.enum(["Strategic", "Tactical", "Cheerleader", "Challenger"]),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  isInvestor: z.boolean().default(false),
  portfolio: z.array(portfolioItemSchema).default([]),
  badges: z.array(z.string()).default([]),
  calendlyUrl: z.string().url().optional(),
  hourlyRate: z.number().positive().optional(),
  visibility: z.enum(["public", "private"]).default("private"),
  bio: z.string().max(1000, "Keep bio under 1000 characters").optional(),
});

export const mentorProfileCreateSchema = mentorProfileBaseSchema;

export const mentorProfileUpdateSchema = mentorProfileBaseSchema.partial().extend({
  userId: z.string().min(1),
});

export type MentorProfileInput = z.infer<typeof mentorProfileBaseSchema>;
export type MentorProfileUpdateInput = z.infer<typeof mentorProfileUpdateSchema>;
export type MentorProfile = MentorProfileInput & {
  createdAt?: Date;
  updatedAt?: Date;
};
