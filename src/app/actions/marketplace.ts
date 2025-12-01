// src/app/actions/marketplace.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// 1. دریافت لیست تمام منتورهای فعال
export async function getAllMentorsAction() {
  try {
    // گرفتن پروفایل‌هایی که visibility آنها public است
    const snapshot = await adminDb
      .collection("mentor_profiles")
      .where("visibility", "==", "public")
      .get();

    const mentors = snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data(),
      // تبدیل Timestamp به Date برای اینکه در کلاینت قابل استفاده باشد
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return { success: true, mentors };
  } catch (error: any) {
    console.error("Get Mentors Error:", error);
    return { success: false, error: error.message };
  }
}

// 2. ارسال درخواست منتورینگ
export async function requestMentorshipAction(mentorId: string, token: string) {
  try {
    // وریفای کردن توکن فاندر
    const decoded = await adminAuth.verifyIdToken(token);
    const founderId = decoded.uid;

    if (founderId === mentorId) {
      return { success: false, error: "You cannot mentor yourself." };
    }

    // چک کردن اینکه قبلا درخواست نداده باشد
    const existing = await adminDb
      .collection("mentor_assignments")
      .where("mentorId", "==", mentorId)
      .where("founderId", "==", founderId)
      .get();

    if (!existing.empty) {
      return { success: false, error: "Request already sent or active." };
    }

    // ثبت درخواست
    await adminDb.collection("mentor_assignments").add({
      mentorId,
      founderId,
      status: "pending", // pending | active | rejected
      createdAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Request Error:", error);
    return { success: false, error: error.message };
  }
}