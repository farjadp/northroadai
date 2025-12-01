// ============================================================================
// 📁 Hardware Source: src/lib/schemas/mentor-schema.ts
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Zod validation schema for Mentor Profile.
// - Strict validation for URLs, enums, and nested objects.
// - TypeScript type inference from schema.
// ============================================================================

import { z } from "zod";

// Portfolio Entry Schema
export const portfolioEntrySchema = z.object({
    startupName: z.string().min(1, "Startup name is required"),
    outcome: z.enum(["Exited", "Active", "Failed", "Acquired"]),
    description: z.string().optional()
});

// Main Mentor Profile Schema
export const mentorProfileSchema = z.object({
    uid: z.string(),

    // --- Identity ---
    displayName: z.string().min(2, "Name must be at least 2 characters").max(100),
    headline: z.string().min(10, "Headline must be at least 10 characters").max(200),
    bio: z.string().min(50, "Bio must be at least 50 characters").max(2000),
    avatarUrl: z.string().url("Invalid avatar URL"),

    // --- Professional ---
    company: z.string().min(1, "Company is required").max(100),
    position: z.string().min(1, "Position is required").max(100),
    linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    twitterUrl: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
    websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),

    // --- Expertise ---
    industries: z.array(z.string()).min(1, "Select at least one industry").max(10),
    skills: z.array(z.string()).min(1, "Select at least one skill").max(20),
    coachingStyle: z.enum(["Strategic", "Tactical", "Direct", "Supportive"]),

    // --- Track Record ---
    yearsExperience: z.number().int().min(0).max(100),
    portfolio: z.array(portfolioEntrySchema).max(20),

    // --- Logistics ---
    isAcceptingMentees: z.boolean(),
    pricingModel: z.enum(["Pro Bono", "Paid", "Equity"]),
    hourlyRate: z.number().int().min(0).optional(),
    calendlyUrl: z.string().url("Invalid Calendly URL").optional().or(z.literal("")),

    // --- System ---
    profileStrength: z.number().int().min(0).max(100),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Partial schema for updates (all fields optional except uid)
export const mentorProfileUpdateSchema = mentorProfileSchema.partial().required({ uid: true });

// TypeScript types
export type MentorProfile = z.infer<typeof mentorProfileSchema>;
export type MentorProfileUpdate = z.infer<typeof mentorProfileUpdateSchema>;
export type PortfolioEntry = z.infer<typeof portfolioEntrySchema>;
