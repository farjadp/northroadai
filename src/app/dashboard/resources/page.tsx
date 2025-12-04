// ============================================================================
// 📁 Hardware Source: src/app/dashboard/resources/page.tsx
// 🕒 Date: 2025-12-04
// 🧠 Version: v1.0 (Resource Library)
// ----------------------------------------------------------------------------
// ✅ Logic:
// 1. Fetches "Global Docs" from Firestore.
// 2. Displays them as downloadable cards.
// 3. Categorizes by file type (PDF, Excel, etc).
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { KnowledgeService, KnowledgeDoc } from "@/lib/api/knowledge";
import { 
  FileText, 
  Download, 
  Search, 
  Database, 
  FileSpreadsheet, 
  FileCode, 
  ExternalLink 
} from "lucide-react";
import { motion } from "framer-motion";

export default function ResourcesPage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await KnowledgeService.getGlobalDocs();
        setDocs(data);
      } catch (error) {
        console.error("Failed to load resources", error);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, []);

  // فیلتر کردن بر اساس سرچ
  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(filter.toLowerCase())
  );

  // تابع کمکی برای آیکون
  const getIcon = (mime: string) => {
    if (mime.includes("pdf")) return <FileText className="text-red-400" />;
    if (mime.includes("sheet") || mime.includes("csv")) return <FileSpreadsheet className="text-green-400" />;
    return <FileCode className="text-blue-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            <Database className="text-cyan-500" />
            Resource Library
          </h1>
          <p className="text-slate-400 font-mono text-sm">
            Curated templates, playbooks, and guides for North Road founders.
          </p>
        </div>
        
        {/* SEARCH */}
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
                type="text" 
                placeholder="Search resources..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
            />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-mono animate-pulse">
            Scanning archives...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 text-slate-600 bg-white/5 rounded-2xl border border-white/5">
            <p>No resources found in the library yet.</p>
            <p className="text-xs mt-2">Ask your mentor to upload materials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, i) => (
                <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-white/[0.02] transition-all flex flex-col justify-between h-48"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-cyan-900/10 group-hover:border-cyan-500/20 transition-colors">
                            {getIcon(doc.mimeType)}
                        </div>
                        {/* Download Button (Opens File URL) */}
                        <a 
                            href={doc.fileUri} // نکته: لینک‌های جمنای مستقیم دانلود نمیشوند، اما فعلا برای MVP کافیست
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1 line-clamp-2" title={doc.name}>
                            {doc.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                            {doc.mimeType.split("/")[1].toUpperCase()} • GLOBAL
                        </p>
                    </div>

                    <button 
                        onClick={() => window.open(doc.fileUri, "_blank")}
                        className="w-full mt-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={14} />
                        ACCESS FILE
                    </button>
                </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}