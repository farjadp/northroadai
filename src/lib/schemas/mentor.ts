import { z } from "zod";

export const PortfolioItemSchema = z.object({
  startupName: z.string().min(1, "Startup name is required"),
  outcome: z.enum(["Exited", "Active", "Failed", "Acquired"]),
  description: z.string().optional(),
});

export const MentorProfileSchema = z.object({
  uid: z.string(),
  
  // --- Identity ---
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  headline: z.string().min(5, "Headline must be at least 5 characters"),
  bio: z.string().max(2000, "Bio must be less than 2000 characters"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  
  // --- Professional ---
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),

  // --- Expertise ---
  industries: z.array(z.string()).min(1, "Select at least one industry"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  coachingStyle: z.enum(["Strategic", "Tactical", "Direct", "Supportive"]),
  
  // --- Track Record ---
  yearsExperience: z.number().min(0),
  portfolio: z.array(PortfolioItemSchema),

  // --- Logistics ---
  isAcceptingMentees: z.boolean(),
  pricingModel: z.enum(["Pro Bono", "Paid", "Equity"]),
  hourlyRate: z.number().optional(),
  calendlyUrl: z.string().url().optional().or(z.literal("")),

  // --- System ---
  profileStrength: z.number().min(0).max(100).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type MentorProfile = z.infer<typeof MentorProfileSchema>;

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
