// ============================================================================
// 📁 Hardware Source: src/lib/plan-service.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0 (Admin Plan Management)
// ----------------------------------------------------------------------------
// Handles CRUD for subscription plans (Scout, Vanguard, Command).
// Each plan can manage price, description, feature list, and included agents.
// ============================================================================

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { UserTier } from "./user-service";

export interface Plan {
  id: UserTier;
  name: string;
  price: string; // e.g. "$0/mo", "$29/mo"
  description?: string;
  features: string[];
  includedAgents: string[];
}

const DEFAULT_PLANS: Record<UserTier, Plan> = {
  SCOUT: {
    id: "SCOUT",
    name: "Scout",
    price: "$0/mo",
    description: "Starter access for early founders.",
    features: [
      "Navigator agent access",
      "Basic chat history",
      "Starter templates"
    ],
    includedAgents: ["navigator"],
  },
  VANGUARD: {
    id: "VANGUARD",
    name: "Vanguard",
    price: "$29/mo",
    description: "Full access to the multi-agent grid.",
    features: [
      "All agents unlocked",
      "Extended chat history",
      "Priority responses"
    ],
    includedAgents: ["navigator", "builder", "ledger", "counsel", "rainmaker"],
  },
  COMMAND: {
    id: "COMMAND",
    name: "Command",
    price: "$99/mo",
    description: "Team access and advanced support.",
    features: [
      "All agents unlocked",
      "Team workspace",
      "Mentor escalations"
    ],
    includedAgents: ["navigator", "builder", "ledger", "counsel", "rainmaker"],
  },
};

export const PlanService = {
  async getPlans(): Promise<Plan[]> {
    const plansRef = collection(db, "plans");
    const snapshot = await getDocs(plansRef);
    if (snapshot.empty) {
      // Seed defaults if missing
      await Promise.all(Object.values(DEFAULT_PLANS).map((plan) => setDoc(doc(db, "plans", plan.id), plan)));
      return Object.values(DEFAULT_PLANS);
    }
    return snapshot.docs.map((d) => ({ id: d.id as UserTier, ...(d.data() as Omit<Plan, "id">) }));
  },

  async getPlan(tier: UserTier): Promise<Plan> {
    const planRef = doc(db, "plans", tier);
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      return { id: tier, ...(snap.data() as Omit<Plan, "id">) };
    }
    const fallback = DEFAULT_PLANS[tier];
    await setDoc(planRef, fallback);
    return fallback;
  },

  async updatePlan(plan: Plan): Promise<void> {
    const planRef = doc(db, "plans", plan.id);
    await setDoc(planRef, plan, { merge: true });
  },
};
