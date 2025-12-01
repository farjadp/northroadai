// ============================================================================
// 📁 Hardware Source: src/app/admin/knowledge/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v5.0 (Bug Fix: Date Display)
// ----------------------------------------------------------------------------
// ✅ Fix: Replaced direct .toLocaleDateString() with safe check.
// ✅ Logic: Handles Firestore Timestamp objects correctly to prevent white screen.
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { KnowledgeService, KnowledgeDoc, IngestLog } from "@/lib/api/knowledge";
import {
    Upload, Trash2, FileText, Database, Loader2,
    Download, Check, LayoutGrid, Clock, Activity,
    Globe, Search, Link as LinkIcon
} from "lucide-react";

export default function AdminKnowledgePage() {
    const [activeTab, setActiveTab] = useState<"files" | "datasets" | "scraper">("files");

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* HEADER */}
            <header className="border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                        <Database className="text-cyan-500" />
                        Knowledge Command Center
                    </h1>
                    <p className="text-slate-400 font-mono text-sm">
                        Manage the AI's brain. Upload global documents or ingest external datasets.
                    </p>
                </div>

                {/* دکمه دانلود دیتاست */}
                <button 
                    onClick={() => window.open('/api/admin/export-dataset', '_blank')}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-lg text-xs font-mono transition"
                >
                    <Download size={14} />
                    Export Training Data
                </button>
            </header>

            {/* TABS */}
            <div className="flex gap-4 border-b border-white/5 pb-1 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab("files")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "files" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                    <FileText size={16}/> Global Files
                </button>
                <button 
                    onClick={() => setActiveTab("datasets")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "datasets" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                    <LayoutGrid size={16}/> Hugging Face
                </button>
                <button 
                    onClick={() => setActiveTab("scraper")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "scraper" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                    <Globe size={16}/> Web Scraper
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[400px]">
                {activeTab === "files" && <FilesView />}
                {activeTab === "datasets" && <DatasetsView />}
                {activeTab === "scraper" && <ScraperView />}
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// VIEW 1: FILES (Bug Fix Here)
// ------------------------------------------------------------------
function FilesView() {
    const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { fetchDocs(); }, []);

    const fetchDocs = async () => {
        try {
            const data = await KnowledgeService.getGlobalDocs();
            setDocs(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const { fileUri, mimeType } = await res.json();
            await KnowledgeService.addGlobalDoc({ name: file.name, mimeType, fileUri });
            await fetchDocs();
        } catch (error) { alert("Upload failed"); } 
        finally { setUploading(false); e.target.value = ""; }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete?")) return;
        await KnowledgeService.deleteGlobalDoc(id);
        setDocs(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-colors bg-white/5 group">
                <input type="file" id="file-upload" className="hidden" onChange={handleUpload} accept=".pdf,.txt,.md,.csv" disabled={uploading} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 bg-black rounded-full text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <div><p className="text-white font-bold text-lg">Upload Global Playbook</p></div>
                </label>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                {docs.map((doc) => (
                    <div key={doc.id} className="p-4 flex justify-between hover:bg-white/5 transition">
                        <div className="flex gap-4 items-center">
                            <FileText size={20} className="text-cyan-500" />
                            <div>
                                <p className="text-white text-sm font-medium">{doc.name}</p>
                                {/* 🟢 BUG FIX: Safe Date Rendering */}
                                <p className="text-xs text-slate-500 font-mono">
                                    {doc.createdAt && doc.createdAt.seconds 
                                        ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() 
                                        : "Just now"} 
                                    • {doc.mimeType}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => doc.id && handleDelete(doc.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// VIEW 2: DATASETS
// ------------------------------------------------------------------
function DatasetsView() {
    const [datasetName, setDatasetName] = useState("");
    const [status, setStatus] = useState("idle");
    const [log, setLog] = useState("");
    const [history, setHistory] = useState<IngestLog[]>([]);

    useEffect(() => { refreshHistory(); }, []);

    const refreshHistory = async () => {
        if (KnowledgeService.getIngestLogs) setHistory(await KnowledgeService.getIngestLogs());
    };

    const handleIngest = async () => {
        if (!datasetName) return;
        setStatus("loading");
        try {
            const res = await fetch("/api/admin/ingest", { method: "POST", body: JSON.stringify({ datasetName }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStatus("success"); setLog(data.message); setDatasetName(""); refreshHistory();
        } catch (err: any) { setStatus("error"); setLog(err.message); }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <label className="text-xs font-mono text-slate-500 uppercase mb-2 block">New Import</label>
                    <div className="flex gap-2">
                        <input type="text" value={datasetName} onChange={e => setDatasetName(e.target.value)} placeholder="Dataset ID" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none" />
                        <button onClick={handleIngest} disabled={status === "loading"} className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-lg flex items-center gap-2">
                            {status === "loading" ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>} Import
                        </button>
                    </div>
                    {status === "success" && <p className="text-green-400 text-xs mt-3 flex items-center gap-2"><Check size={12}/> {log}</p>}
                    {status === "error" && <p className="text-red-400 text-xs mt-3">{log}</p>}
                </div>
                <HistoryTable history={history} />
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// VIEW 3: SCRAPER
// ------------------------------------------------------------------
function ScraperView() {
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState("idle");
    const [log, setLog] = useState("");
    const [history, setHistory] = useState<IngestLog[]>([]);

    useEffect(() => { refreshHistory(); }, []);

    const refreshHistory = async () => {
        if (KnowledgeService.getIngestLogs) {
            const logs = await KnowledgeService.getIngestLogs();
            setHistory(logs.filter(l => l.source === "Web Scraper"));
        }
    };

    const handleScrape = async () => {
        if (!url) return;
        setStatus("loading");
        try {
            const res = await fetch("/api/admin/scrape", { method: "POST", body: JSON.stringify({ url }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            setStatus("success"); 
            setLog(data.message);
            setUrl(""); 
            refreshHistory();
        } catch (err: any) { setStatus("error"); setLog(err.message); }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <label className="text-xs font-mono text-slate-500 uppercase mb-2 block">Target URL</label>
                    <div className="flex gap-2">
                        <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-l-lg px-3 text-slate-500">
                            <LinkIcon size={16}/>
                        </div>
                        <input 
                            type="url" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            placeholder="https://paulgraham.com/ideas.html" 
                            className="flex-1 bg-white/5 border border-white/10 rounded-r-lg px-4 py-3 text-white outline-none focus:border-orange-500 transition" 
                        />
                    </div>
                    <button 
                        onClick={handleScrape} 
                        disabled={status === "loading" || !url} 
                        className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {status === "loading" ? <Loader2 className="animate-spin" size={18}/> : <Globe size={18}/>} 
                        {status === "loading" ? "Harvesting..." : "Scrape & Embed"}
                    </button>
                    
                    {status === "success" && <p className="text-green-400 text-xs mt-3 flex items-center gap-2"><Check size={12}/> {log}</p>}
                    {status === "error" && <p className="text-red-400 text-xs mt-3">{log}</p>}
                </div>

                {/* Quick Links */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-xs font-mono text-slate-500 uppercase mb-4">Recommended Reads</h4>
                    <div className="space-y-2">
                        {[
                            "https://paulgraham.com/ds.html",
                            "https://paulgraham.com/growth.html",
                            "https://www.ycombinator.com/library/2q-how-to-start-a-startup"
                        ].map(link => (
                            <div key={link} onClick={() => setUrl(link)} className="flex items-center gap-2 cursor-pointer group">
                                <Search size={12} className="text-slate-600 group-hover:text-orange-400"/>
                                <span className="text-xs text-slate-400 truncate hover:text-white transition">{link}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <HistoryTable history={history} title="Scraping History" color="orange" />
        </div>
    );
}

// --- SHARED: HISTORY TABLE COMPONENT (Bug Fix Here) ---
function HistoryTable({ history, title = "History", color = "purple" }: { history: IngestLog[], title?: string, color?: string }) {
    return (
        <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <Activity size={16} className={`text-${color}-500`}/>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            </div>
            <div className="divide-y divide-white/10">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No records found.</div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-sm max-w-md truncate">{item.dataset}</span>
                                    <span className={`px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400 text-[10px] font-bold border border-${color}-500/20`}>
                                        +{item.count} Vectors
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-mono">
                                    {/* 🟢 BUG FIX: Safe Date Rendering */}
                                    <span className="flex items-center gap-1">
                                        <Clock size={12}/> 
                                        {item.timestamp && item.timestamp.seconds 
                                            ? new Date(item.timestamp.seconds * 1000).toLocaleString() 
                                            : "Just now"}
                                    </span>
                                    <span>Source: {item.source || "Unknown"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}