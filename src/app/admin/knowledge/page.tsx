// ============================================================================
// 📁 Hardware Source: src/app/admin/knowledge/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v6.0 (Agent-Specific Knowledge)
// ----------------------------------------------------------------------------
// ✅ Logic: Allows tagging docs/datasets with specific agents (e.g. Financial only).
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { KnowledgeService, KnowledgeDoc, IngestLog } from "@/lib/api/knowledge";
import { AGENTS } from "@/lib/agents"; // لیست ایجنت‌های سیستم
import {
    Upload, Trash2, FileText, Database, Loader2,
    Download, Check, LayoutGrid, Clock, Activity,
    Globe, Search, Link as LinkIcon, Users, Shield
} from "lucide-react";
import { getApiUrl } from "@/lib/api-config";

// --- COMPONENT: AGENT SELECTOR ---
function AgentSelector({ selected, onChange }: { selected: string[], onChange: (ids: string[]) => void }) {
    const toggleAgent = (id: string) => {
        if (id === 'all') {
            onChange(['all']);
        } else {
            let newSel = selected.filter(x => x !== 'all');
            if (selected.includes(id)) newSel = newSel.filter(x => x !== id);
            else newSel.push(id);
            if (newSel.length === 0) newSel = ['all']; // Default to all if empty
            onChange(newSel);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <button
                onClick={() => toggleAgent('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${selected.includes('all')
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"}`}
            >
                <Globe size={12} /> ALL AGENTS
            </button>
            {AGENTS.map(agent => (
                <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${selected.includes(agent.id)
                        ? `bg-${agent.themeColor}-900/40 text-${agent.themeColor}-400 border-${agent.themeColor}-500/50`
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"}`}
                >
                    {agent.icon && <agent.icon size={12} />} {agent.name.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

export default function AdminKnowledgePage() {
    const [activeTab, setActiveTab] = useState<"files" | "datasets" | "scrape" | "history">("files");

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                    <Shield className="text-cyan-500" />
                    Knowledge Access Control
                </h1>
                <p className="text-slate-400 font-mono text-sm">
                    Assign documents to specific agents (e.g. Financial Reports -&gt; Financial Agent).
                </p>
            </header>

            <div className="flex gap-4 border-b border-white/5 pb-1 overflow-x-auto">
                <button onClick={() => setActiveTab("files")} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "files" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    <FileText size={16} /> Global Files
                </button>
                <button onClick={() => setActiveTab("datasets")} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "datasets" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    <LayoutGrid size={16} /> Hugging Face
                </button>
                <button onClick={() => setActiveTab("scrape")} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "scrape" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    <Globe size={16} /> Web Scraper
                </button>
                <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "history" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    <Clock size={16} /> History
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === "files" && <FilesView />}
                {activeTab === "datasets" && <DatasetsView />}
                {activeTab === "scrape" && <ScraperView />}
                {activeTab === "history" && <IngestHistory />}
            </div>
        </div>
    );
}

// --- FILES VIEW ---
function FilesView() {
    const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [targetAgents, setTargetAgents] = useState<string[]>(['all']); // State جدید

    useEffect(() => { fetchDocs(); }, []);

    const fetchDocs = async () => {
        try {
            const data = await KnowledgeService.getGlobalDocs();
            setDocs(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);

        const files = Array.from(e.target.files);
        let successCount = 0;

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const res = await fetch(getApiUrl("/api/upload"), { method: "POST", body: formData });
                    if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
                    const { fileUri, mimeType } = await res.json();

                    await KnowledgeService.addGlobalDoc({
                        name: file.name,
                        mimeType,
                        fileUri,
                        targetAgents // Access Control applied here
                    });
                    successCount++;
                } catch (err) {
                    console.error(`Error uploading ${file.name}:`, err);
                }
            }

            if (successCount > 0) {
                await fetchDocs();
                alert(`Successfully uploaded ${successCount}/${files.length} files.`);
            } else {
                alert("All uploads failed.");
            }
        } catch (error) {
            console.error("Batch upload critical failure", error);
            alert("Critical upload error");
        }
        finally { setUploading(false); e.target.value = ""; }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete?")) return;
        await KnowledgeService.deleteGlobalDoc(id);
        setDocs(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <label className="text-xs font-mono text-slate-500 uppercase mb-3 block">Target Agents (Who can see this?)</label>
                <AgentSelector selected={targetAgents} onChange={setTargetAgents} />

                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors bg-black group mt-4">
                    <input type="file" id="file-upload" className="hidden" onChange={handleUpload} accept=".pdf,.txt,.md,.csv" disabled={uploading} multiple />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-900 rounded-full text-slate-400 group-hover:text-cyan-400 transition-colors">
                            {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                        </div>
                        <div><p className="text-white font-bold text-lg">Upload Knowledge Asset</p></div>
                    </label>
                </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                {docs.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                        <div className="flex items-center gap-4">
                            <FileText size={20} className="text-cyan-500" />
                            <div>
                                <p className="text-white font-medium text-sm">{doc.name}</p>
                                <div className="flex gap-2 mt-1">
                                    {/* نمایش تگ ایجنت‌ها */}
                                    {(doc.targetAgents || ['all']).map(tag => (
                                        <span key={tag} className="text-[10px] bg-white/10 px-1.5 rounded text-slate-400 uppercase">
                                            {tag === 'all' ? 'GLOBAL' : tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => doc.id && handleDelete(doc.id)} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- DATASETS VIEW ---
function DatasetsView() {
    const [datasetName, setDatasetName] = useState("");
    const [targetAgents, setTargetAgents] = useState<string[]>(['all']); // State جدید
    const [status, setStatus] = useState("idle");
    const [log, setLog] = useState("");

    const handleIngest = async () => {
        if (!datasetName) return;
        setStatus("loading");
        try {
            const res = await fetch(getApiUrl("/api/admin/ingest"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    datasetName,
                    targetAgents // 🔥 ارسال به سرور
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStatus("success"); setLog(data.message);
        } catch (err: any) { setStatus("error"); setLog(err.message); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <label className="text-xs font-mono text-slate-500 uppercase mb-3 block">Target Agents</label>
                <AgentSelector selected={targetAgents} onChange={setTargetAgents} />

                <label className="text-xs font-mono text-slate-500 uppercase mb-2 mt-4 block">Dataset ID</label>
                <div className="flex gap-2">
                    <input type="text" value={datasetName} onChange={e => setDatasetName(e.target.value)} placeholder="e.g. virattt/financial-qa-10k" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none" />
                    <button onClick={handleIngest} disabled={status === "loading" || !datasetName} className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                        {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Import
                    </button>
                </div>
            </div>
            <div className="bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs overflow-y-auto h-48">
                {status === "idle" && <span className="opacity-50">Waiting for command...</span>}
                {status === "loading" && <p className="text-purple-400 animate-pulse">{`> Processing ${datasetName}...`}</p>}
                {status === "success" && <p className="text-green-400">{`> ${log}`}</p>}
                {status === "error" && <p className="text-red-400">{`> Error: ${log}`}</p>}
            </div>
        </div>
    );
}

// --- SCRAPER VIEW ---
function ScraperView() {
    const [url, setUrl] = useState("");
    const [targetAgents, setTargetAgents] = useState<string[]>(['all']);
    const [status, setStatus] = useState("idle");
    const [log, setLog] = useState("");

    const handleScrape = async () => {
        if (!url) return;
        setStatus("loading");
        try {
            const res = await fetch(getApiUrl("/api/admin/scrape"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                    targetAgents
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStatus("success"); setLog(data.message || "Scraping complete.");
        } catch (err: any) { setStatus("error"); setLog(err.message); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <label className="text-xs font-mono text-slate-500 uppercase mb-3 block">Target Agents</label>
                <AgentSelector selected={targetAgents} onChange={setTargetAgents} />

                <label className="text-xs font-mono text-slate-500 uppercase mb-2 mt-4 block">Target URL</label>
                <div className="flex gap-2">
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none" />
                    <button onClick={handleScrape} disabled={status === "loading" || !url} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                        {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />} Scrape
                    </button>
                </div>
            </div>
            <div className="bg-black border border-white/10 rounded-2xl p-6 font-mono text-xs overflow-y-auto h-48">
                {status === "idle" && <span className="opacity-50">Waiting for command...</span>}
                {status === "loading" && <p className="text-emerald-400 animate-pulse">{`> Scraping ${url}...`}</p>}
                {status === "success" && <p className="text-green-400">{`> ${log}`}</p>}
                {status === "error" && <p className="text-red-400">{`> Error: ${log}`}</p>}
            </div>
        </div>
    );
}

// --- INGEST HISTORY (Audit Logs) ---
function IngestHistory() {
    // Implementing properly inside the component render for brevity
    return <HistoryTable />;
}

function HistoryTable() {
    const [logs, setLogs] = useState<IngestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [cursors, setCursors] = useState<any[]>([null]); // Page 0 (1st page) starts with null
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        loadPage(0);
    }, []);

    const loadPage = async (pageIndex: number) => {
        setLoading(true);
        try {
            const cursor = cursors[pageIndex];
            const result = await KnowledgeService.getIngestLogs(cursor, 15);
            setLogs(result.logs);

            // Should we update the NEXT page's cursor?
            if (result.lastDoc) {
                setCursors(prev => {
                    const newCursors = [...prev];
                    newCursors[pageIndex + 1] = result.lastDoc;
                    return newCursors;
                });
            }
            setCurrentPage(pageIndex);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" />
                    Audit Logs
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => loadPage(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                        className="px-3 py-1 rounded bg-white/5 text-xs hover:bg-white/10 disabled:opacity-30"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-mono py-1 text-slate-500">Page {currentPage + 1}</span>
                    <button
                        onClick={() => loadPage(currentPage + 1)}
                        disabled={!cursors[currentPage + 1] || logs.length < 15 || loading} // Simple check
                        className="px-3 py-1 rounded bg-white/5 text-xs hover:bg-white/10 disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-500" /></div>
            ) : (
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-white/5 text-slate-300 font-mono text-xs uppercase">
                        <tr>
                            <th className="p-4">Source</th>
                            <th className="p-4">Target</th>
                            <th className="p-4 text-center">Items</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition group">
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.source === 'Hugging Face' ? 'bg-purple-900/30 text-purple-400' :
                                        log.source === 'Web Scraper' ? 'bg-emerald-900/30 text-emerald-400' :
                                            'bg-slate-800 text-slate-400'
                                        }`}>
                                        {log.source || 'Unknown'}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-white text-xs truncate max-w-[200px]" title={log.dataset}>
                                    {log.dataset}
                                </td>
                                <td className="p-4 text-center">{log.count}</td>
                                <td className="p-4 text-center">
                                    {log.status === 'success' ? (
                                        <div className="inline-flex items-center gap-1.5 bg-green-900/20 text-green-400 px-2 py-1 rounded-full text-[10px] font-bold">
                                            <Check size={10} strokeWidth={3} /> SUCCESS
                                        </div>
                                    ) : (
                                        <span className="text-red-400 text-[10px]">FAILED</span>
                                    )}
                                </td>
                                <td className="p-4 text-right font-mono text-xs text-slate-500 group-hover:text-white transition-colors">
                                    {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500 italic">No logs found for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}