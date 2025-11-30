// ============================================================================
// 📁 Hardware Source: src/app/admin/knowledge/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Admin interface for uploading and managing Global Knowledge (Layer 1).
// Uploads files to Google AI and saves metadata to Firestore.
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { KnowledgeService, KnowledgeDoc } from "@/lib/api/knowledge";
import { Upload, Trash2, FileText, Database, Loader2 } from "lucide-react";

export default function AdminKnowledgePage() {
    const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const data = await KnowledgeService.getGlobalDocs();
            setDocs(data);
        } catch (error) {
            console.error("Failed to fetch docs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

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

            // 2. Save to Firestore
            await KnowledgeService.addGlobalDoc({
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
            // Reset input
            e.target.value = "";
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this global document?")) return;
        try {
            await KnowledgeService.deleteGlobalDoc(id);
            setDocs(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete document.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                    <Database className="text-cyan-500" />
                    Global Knowledge Base
                </h1>
                <p className="text-slate-400 font-mono text-sm">
                    Layer 1: These documents are accessible to ALL users and agents.
                    Upload playbooks, visa rules, and core North Road methodologies here.
                </p>
            </header>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-colors bg-slate-900/20 group">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleUpload}
                    accept=".pdf,.txt,.md,.csv"
                    disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-900 rounded-full text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">Click to Upload Playbook</p>
                        <p className="text-slate-500 text-sm font-mono mt-1">PDF, TXT, MD supported</p>
                    </div>
                </label>
            </div>

            {/* File List */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Active Neural Archives ({docs.length})</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-mono">Scanning archives...</div>
                ) : docs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-mono">No global documents found. System is running on base logic.</div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {docs.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-900/80 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-cyan-900/20 text-cyan-400 rounded">
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
