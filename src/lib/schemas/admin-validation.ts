import { z } from 'zod';

// ============================================================================
// 📁 Hardware Source: src/lib/schemas/admin-validation.ts
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Centralized validation schemas for Admin actions.
// ============================================================================

export const ChatSettingsSchema = z.object({
  limit: z.number()
    .min(1, { message: "Limit must be at least 1" })
    .max(1000, { message: "Limit cannot exceed 1000" })
    .int({ message: "Limit must be an integer" }),
});

export const UploadValidationSchema = z.object({
  fileSize: z.number().max(10 * 1024 * 1024, { message: "File size must be under 10MB" }), // Example check, strictly mostly done on File object
  mimeType: z.enum([
    'application/pdf', 
    'text/plain', 
    'text/markdown', 
    'text/csv', 
    'application/json'
  ], { message: "Invalid file type. Allowed: PDF, TXT, MD, CSV, JSON" })
});

export type ChatSettingsInput = z.infer<typeof ChatSettingsSchema>;
