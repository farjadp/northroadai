// ============================================================================
// 📁 Hardware Source: src/lib/api/knowledge.ts
// 🕒 Date: 2025-11-30 23:55
// 🧠 Version: v3.0 (Master - Global + User + Audit Logs)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Global Knowledge (Layer 1): Accessible by all agents.
// 2. User Documents (Layer 2): Private files for specific users.
// 3. Ingest Logs (Audit): History of Hugging Face imports.
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
    limit,
    Timestamp,
    startAfter
} from "firebase/firestore";

// --- TYPES ---
export interface KnowledgeDoc {
    id?: string;
    name: string;
    mimeType: string;
    fileUri: string;
    targetAgents?: string[]; // 🔥 Added Access Control
    createdAt?: any;
}

export interface IngestLog {
    id: string;
    dataset: string;
    count: number;
    status: string;
    timestamp: any;
    source?: string;
}

// --- SERVICE ---
export const KnowledgeService = {

    // ==========================================
    // 1. GLOBAL KNOWLEDGE (Layer 1)
    // ==========================================
    async addGlobalDoc(fileData: { name: string; mimeType: string; fileUri: string; targetAgents?: string[] }) {
        if (!db) return;
        const ref = collection(db, "global_knowledge");
        await addDoc(ref, {
            ...fileData,
            targetAgents: fileData.targetAgents || ['all'], // Default to Global
            createdAt: Timestamp.now(),
        });
    },

    async getGlobalDocs(): Promise<KnowledgeDoc[]> {
        if (!db) return [];
        const ref = collection(db, "global_knowledge");
        const q = query(ref, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // تبدیل ایمن Timestamp به Date برای نمایش در فرانت
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        })) as KnowledgeDoc[];
    },

    async deleteGlobalDoc(id: string) {
        if (!db) return;
        await deleteDoc(doc(db, "global_knowledge", id));
    },

    // ==========================================
    // 2. USER DOCUMENTS (Layer 2)
    // ==========================================
    async addUserDoc(uid: string, fileData: { name: string; mimeType: string; fileUri: string }) {
        if (!db) return;
        const ref = collection(db, "users", uid, "documents");
        await addDoc(ref, {
            ...fileData,
            createdAt: Timestamp.now(),
        });
    },

    async getUserDocs(uid: string): Promise<KnowledgeDoc[]> {
        if (!db) return [];
        const ref = collection(db, "users", uid, "documents");
        const q = query(ref, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        })) as KnowledgeDoc[];
    },

    async deleteUserDoc(uid: string, id: string) {
        if (!db) return;
        await deleteDoc(doc(db, "users", uid, "documents", id));
    },

    // ==========================================
    // 3. AUDIT LOGS (Ingestion History)
    // ==========================================
    // این تابع قبلا بیرون آبجکت بود و ارور میداد، الان درست شد:
    async getIngestLogs(lastDoc: any = null, pageSize: number = 10): Promise<{ logs: IngestLog[], lastDoc: any }> {
        if (!db) return { logs: [], lastDoc: null };
        try {
            let q = query(
                collection(db, "ingest_logs"),
                orderBy("timestamp", "desc"),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as IngestLog[];

            return { logs, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
        } catch (e) {
            console.error("Error fetching logs:", e);
            return { logs: [], lastDoc: null };
        }
    }
};