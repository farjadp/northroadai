// ============================================================================
// 📁 Hardware Source: src/hooks/useChatSession.ts
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Handles creating sessions, sending messages, and real-time listening.
// ============================================================================

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  doc, setDoc, Timestamp, serverTimestamp 
} from "firebase/firestore";

export function useChatSession(userId: string | null, sessionId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Listen to Messages (Real-time)
  useEffect(() => {
    if (!userId || !sessionId) {
        setMessages([]);
        return;
    }

    setLoading(true);
    const msgsRef = collection(db, "users", userId, "sessions", sessionId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // تبدیل تایم‌استمپ فایربیس به دیت جاوااسکریپت برای نمایش
        timestamp: doc.data().createdAt?.toDate() || new Date()
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, sessionId]);

  // 2. Send Message Function
  const sendMessage = async (content: string, role: "user" | "ai", agentName: string = "PIRAI") => {
    if (!userId || !sessionId) return;

    const msgsRef = collection(db, "users", userId, "sessions", sessionId, "messages");
    
    // ذخیره پیام
    await addDoc(msgsRef, {
      content,
      role,
      agent: agentName,
      createdAt: serverTimestamp()
    });

    // آپدیت کردن تایتل سشن (فقط اگر اولین پیام باشد یا برای آپدیت تاریخ)
    const sessionRef = doc(db, "users", userId, "sessions", sessionId);
    // اینجا میتوانیم "آخرین پیام" را هم ذخیره کنیم برای نمایش در سایدبار
    await setDoc(sessionRef, {
        lastMessage: content.slice(0, 50) + "...",
        updatedAt: serverTimestamp()
    }, { merge: true });
  };

  return { messages, loading, sendMessage };
}