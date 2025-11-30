// ============================================================================
// 📁 Hardware Source: src/app/dashboard/documents/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// User interface for uploading and managing Private Documents (Layer 2).
// Scoped strictly to the authenticated user's UID.
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { KnowledgeService, KnowledgeDoc } from "@/lib/api/knowledge";
import { useAuth } from "@/context/auth-context";
import { Upload, Trash2, FileText, Shield, Loader2, Lock } from "lucide-react";

export default function UserDocumentsPage() {
    const { user } = useAuth();
    const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDocs();
        }
    }, [user]);

    const fetchDocs = async () => {
        if (!user) return;
        try {
            const data = await KnowledgeService.getUserDocs(user.uid);
            setDocs(data);
        } catch (error) {
            console.error("Failed to fetch docs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // 1. Upload to Google AI
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { fileUri, mimeType } = await res.json();

            // 2. Save to Firestore (User Scope)
            await KnowledgeService.addUserDoc(user.uid, {
                name: file.name,
                mimeType,
                fileUri,
            });

            // 3. Refresh list
            await fetchDocs();

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload document.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !confirm("Are you sure you want to delete this private document?")) return;
        try {
            await KnowledgeService.deleteUserDoc(user.uid, id);
            setDocs(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete document.");
        }
    };

    if (!user) return <div className="p-8 text-slate-400">Authenticating...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                    <Shield className="text-green-500" />
                    Secure Document Vault
                </h1>
                <p className="text-slate-400 font-mono text-sm">
                    Layer 2: Private Context. These files are encrypted and only accessible to YOUR agents.
                    Upload your Pitch Deck, Financials, and Cap Table here.
                </p>
            </header>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-green-500/50 transition-colors bg-slate-900/20 group">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleUpload}
                    accept=".pdf,.txt,.md,.csv"
                    disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-900 rounded-full text-slate-400 group-hover:text-green-400 transition-colors">
                        {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">Upload Private Asset</p>
                        <p className="text-slate-500 text-sm font-mono mt-1">PDF, TXT, MD supported</p>
                    </div>
                </label>
            </div>

            {/* File List */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Encrypted Assets ({docs.length})</h3>
                    <div className="flex items-center gap-2 text-xs text-green-500 font-mono">
                        <Lock size={12} />
                        SECURE
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-mono">Decrypting vault...</div>
                ) : docs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-mono">Vault is empty. Upload assets to give context to your agents.</div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {docs.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-900/80 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-900/20 text-green-400 rounded">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{doc.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">
                                            {doc.createdAt?.toLocaleDateString()} • {doc.mimeType}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => doc.id && handleDelete(doc.id)}
                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete Document"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
