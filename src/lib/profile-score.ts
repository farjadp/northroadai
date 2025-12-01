// ============================================================================
// 📁 Hardware Source: src/lib/profile-score.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (DNA Readiness Scoring)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Calculates profile completeness percentage for Startup DNA fields.
// - Returns score plus filled/total counts for UI progress.
// ============================================================================

import { StartupProfile } from "./api/startup";

export const calculateProfileScore = (dna: Partial<StartupProfile> | null | undefined) => {
  if (!dna) return { score: 0, filled: 0, total: 8 };

  const fields: (keyof StartupProfile)[] = [
    "name",
    "url",
    "oneLiner",
    "stage",
    "burnRate",
    "runway",
    "teamSize",
    "industryTags",
  ];

  const filled = fields.reduce((acc, key) => {
    const value = (dna as Record<string, unknown>)[key];
    if (key === "industryTags") {
      return acc + (Array.isArray(value) && value.length > 0 ? 1 : 0);
    }
    if (typeof value === "string" && value.trim().length > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const total = fields.length;
  const score = Math.round((filled / total) * 100);

  return { score, filled, total };
};
