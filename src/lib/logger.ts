import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function logSystemEvent(action: string, details: string, userId: string = "system") {
  try {
    await adminDb.collection("system_logs").add({
      action,
      details,
      userId,
      createdAt: FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Logger failed", e);
  }
}