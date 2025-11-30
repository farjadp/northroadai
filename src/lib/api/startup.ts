// ============================================================================
// 📁 Hardware Source: src/lib/api/startup.ts
// 🕒 Date: 2025-11-29 17:30
// 🧠 Version: v1.0 (Firestore DNA Service)
// ----------------------------------------------------------------------------

import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// تعریف ساختار دیتای استارتاپ
export interface StartupProfile {
  name: string;
  url: string;
  oneLiner: string;
  stage: string; // 'Idea' | 'MVP' | 'Growth'
  burnRate: string;
  runway: string;
  teamSize: string;
  industryTags: string[];
  updatedAt: string;
}

// ذخیره یا آپدیت پروفایل
export const saveStartupDNA = async (uid: string, data: Partial<StartupProfile>) => {
  try {
    const userRef = doc(db, "startups", uid); // startups/{uid}
    await setDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      uid: uid // جهت اطمینان
    }, { merge: true }); // merge: true یعنی اگر فیلدی نبود، اضافه کن، قبلی‌ها را پاک نکن
    return { success: true };
  } catch (error) {
    console.error("Error saving DNA:", error);
    return { success: false, error };
  }
};

// خواندن پروفایل
export const getStartupDNA = async (uid: string) => {
  try {
    const userRef = doc(db, "startups", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as StartupProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching DNA:", error);
    return null;
  }
};