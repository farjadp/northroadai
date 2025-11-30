// ============================================================================
// 📁 Hardware Source: src/lib/api/knowledge.ts
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Handles Firestore operations for the Dual-Layer RAG Architecture.
// - Global Knowledge: Stored in 'global_knowledge' collection.
// - User Documents: Stored in 'users/{uid}/documents' subcollection.
// ============================================================================

import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";

export interface KnowledgeDoc {
    id?: string;
    name: string;
    mimeType: string;
    fileUri: string;
    createdAt: Date;
}

export const KnowledgeService = {
    // --- GLOBAL KNOWLEDGE (Layer 1) ---

    async addGlobalDoc(fileData: { name: string; mimeType: string; fileUri: string }) {
        const ref = collection(db, "global_knowledge");
        await addDoc(ref, {
            ...fileData,
            createdAt: Timestamp.now(),
        });
    },

    async getGlobalDocs(): Promise<KnowledgeDoc[]> {
        const ref = collection(db, "global_knowledge");
        const q = query(ref, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        })) as KnowledgeDoc[];
    },

    async deleteGlobalDoc(id: string) {
        await deleteDoc(doc(db, "global_knowledge", id));
    },

    // --- USER DOCUMENTS (Layer 2) ---

    async addUserDoc(uid: string, fileData: { name: string; mimeType: string; fileUri: string }) {
        const ref = collection(db, "users", uid, "documents");
        await addDoc(ref, {
            ...fileData,
            createdAt: Timestamp.now(),
        });
    },

    async getUserDocs(uid: string): Promise<KnowledgeDoc[]> {
        const ref = collection(db, "users", uid, "documents");
        const q = query(ref, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        })) as KnowledgeDoc[];
    },

    async deleteUserDoc(uid: string, id: string) {
        await deleteDoc(doc(db, "users", uid, "documents", id));
    }
};
