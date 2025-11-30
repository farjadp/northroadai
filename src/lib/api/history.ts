// ============================================================================
// 📁 Hardware Source: src/lib/api/history.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Handles Firestore operations for Chat Persistence.
// - Sessions: users/{uid}/chat_sessions
// - Messages: users/{uid}/chat_sessions/{sessionId}/messages
// ============================================================================

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    Timestamp,
    writeBatch,
    deleteDoc
} from "firebase/firestore";

export interface ChatSession {
    id: string;
    title: string;
    agentId: string;
    createdAt: Date;
    updatedAt: Date;
    preview: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "ai";
    content: string;
    createdAt: Date;
    attachments?: any[];
}

export const HistoryService = {

    // 1. Create New Session
    async createNewSession(uid: string, agentId: string, firstMessage: string): Promise<string> {
        const sessionsRef = collection(db, "users", uid, "chat_sessions");

        // Generate a simple title from the first message (truncate to 50 chars)
        const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage;

        const docRef = await addDoc(sessionsRef, {
            title,
            agentId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            preview: title
        });

        return docRef.id;
    },

    // 2. Get User Sessions (Ordered by Recent)
    async getUserSessions(uid: string): Promise<ChatSession[]> {
        const sessionsRef = collection(db, "users", uid, "chat_sessions");
        const q = query(sessionsRef, orderBy("updatedAt", "desc"));

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || "New Chat",
                agentId: data.agentId || "navigator",
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                preview: data.preview || ""
            };
        });
    },

    // 3. Get Messages for a Session
    async getSessionMessages(uid: string, sessionId: string): Promise<ChatMessage[]> {
        const messagesRef = collection(db, "users", uid, "chat_sessions", sessionId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                role: data.role,
                content: data.content,
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                attachments: data.attachments || []
            };
        });
    },

    // 4. Add Message to Session
    async addMessageToSession(
        uid: string,
        sessionId: string,
        role: "user" | "ai",
        content: string,
        attachments: any[] = []
    ): Promise<void> {
        const batch = writeBatch(db);

        // A) Add Message Doc
        const messagesRef = collection(db, "users", uid, "chat_sessions", sessionId, "messages");
        const newMessageRef = doc(messagesRef); // Auto-ID

        batch.set(newMessageRef, {
            role,
            content,
            attachments,
            createdAt: serverTimestamp()
        });

        // B) Update Session 'updatedAt' and 'preview' (if it's the last message)
        const sessionRef = doc(db, "users", uid, "chat_sessions", sessionId);
        batch.update(sessionRef, {
            updatedAt: serverTimestamp(),
            preview: content.length > 50 ? content.substring(0, 50) + "..." : content
        });

        await batch.commit();
    },

    // 5. Delete Session
    async deleteSession(uid: string, sessionId: string): Promise<void> {
        // Note: Deleting a document does NOT delete its subcollections in Firestore.
        // We must manually delete the messages first (or rely on a cloud function).
        // For client-side, we'll delete the session doc and let the subcollection be orphaned (or delete messages if few).
        // Ideally, use a recursive delete, but for now, we'll just delete the session doc to hide it from UI.

        const sessionRef = doc(db, "users", uid, "chat_sessions", sessionId);
        await deleteDoc(sessionRef);
    }
};

// Convenience named export
export const getUserSessions = HistoryService.getUserSessions;
