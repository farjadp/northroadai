// ============================================================================
// 📁 Hardware Source: src/app/dashboard/profile/page.tsx
// 🕒 Date: 2025-11-29 15:10
// 🧠 Version: v2.1 (The Genome Editor - Connected)
// ----------------------------------------------------------------------------
// ✅ What changed vs v2.0:
// 1) Integrated Firebase Firestore via '@/lib/api/startup'.
// 2) Added useEffect to fetch existing DNA on load.
// 3) Wired all inputs to 'formData' state.
// 4) 'Synthesize' button now actually saves data to the cloud.
// 5) Added 'isLoading' skeleton state for initial fetch.
//
// 📝 Notes:
// - Uses 'lucide-react' Dna, Microscope, Binary icons.
// - The vertical line represents the "Backbone" of the startup's RNA.
// ============================================================================

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context"; // اتصال به کاربر
import { saveStartupDNA, getStartupDNA, StartupProfile } from "@/lib/api/startup"; // اتصال به API
import { 
  Dna, 
  Microscope, 
  Binary, 
  Activity, 
  Zap, 
  Save, 
  CheckCircle2,
  AlertOctagon,
  Loader2
} from "lucide-react";

// --- DNA SPINNER COMPONENT ---
const DnaSpinner = () => (
  <div className="flex gap-1 h-8 items-center opacity-80">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: [10, 25, 10], 
          backgroundColor: ["#a855f7", "#06b6d4", "#a855f7"] 
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          delay: i * 0.2,
          ease: "easeInOut"
        }}
        className="w-1.5 rounded-full bg-cyan-500"
      />
    ))}
  </div>
);

// --- SECTIONS ANIMATION ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  }
};

const geneVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function StartupDNA() {
  const { user } = useAuth();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sequencingProgress, setSequencingProgress] = useState(0);
  
  // State اصلی برای نگهداری داده‌های فرم
  const [formData, setFormData] = useState<Partial<StartupProfile>>({
    name: "",
    url: "",
    oneLiner: "",
    burnRate: "",
    runway: "",
    teamSize: "",
  });

  // 1. دریافت داده‌ها هنگام لود صفحه
  useEffect(() => {
    async function fetchData() {
      if (user) {
        const data = await getStartupDNA(user.uid);
        if (data) {
          setFormData(data);
          // محاسبه درصد تکمیل پروفایل
          const filledFields = Object.values(data).filter(v => v && v.toString().length > 0).length;
          const totalFields = 6; // تعداد فیلدهای مهم
          setSequencingProgress(Math.min(Math.round((filledFields / totalFields) * 100), 100));
        }
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // هندلر تغییر اینپوت‌ها
  const handleInputChange = (field: keyof StartupProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 2. ذخیره داده‌ها در فایربیس
  const handleSynthesize = async () => {
    if (!user) return;
    setIsSynthesizing(true);
    
    // شبیه‌سازی انیمیشن سکوئنسینگ
    let p = sequencingProgress;
    const interval = setInterval(() => {
        p += 5;
        if (p >= 100) p = 99; // صبر کن تا ذخیره واقعی تمام شود
        setSequencingProgress(p);
    }, 100);

    // ذخیره واقعی
    await saveStartupDNA(user.uid, {
        ...formData,
        stage: "Idea Phase", // می‌توان بعداً داینامیک کرد
    });

    clearInterval(interval);
    setSequencingProgress(100);
    
    setTimeout(() => {
        setIsSynthesizing(false);
        // اینجا می‌توان تست (Toast) موفقیت نمایش داد
    }, 800);
  };

  if (isLoading) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
              <DnaSpinner />
              <p className="mt-4 font-mono text-sm animate-pulse">Accessing Genome Database...</p>
          </div>
      );
  }

  return (
    <div className="relative min-h-[80vh]">
      
      {/* BACKGROUND ELEMENTS (Grid & Hexagons) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute top-20 right-10 opacity-10 text-purple-500 animate-pulse">
        <Dna size={400} strokeWidth={0.5} />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto"
      >
        
        {/* --- HEADER: SEQUENCER STATUS --- */}
        <motion.div variants={geneVariants} className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8 mb-12 gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <Microscope size={32} className="text-purple-400" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 tracking-tight">
                        Startup Genome
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                            SEQUENCE: ACTIVE
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                            ID: #{user?.uid.slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* PROGRESS DNA BAR */}
            <div className="w-full md:w-auto text-right">
                 <div className="flex justify-between md:justify-end items-center gap-4 mb-2">
                    <DnaSpinner />
                    <span className="font-mono text-2xl font-bold text-white">{sequencingProgress}%</span>
                 </div>
                 <div className="w-full md:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: `${sequencingProgress}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                    />
                 </div>
                 <p className="text-[10px] text-purple-400/80 font-mono mt-1 tracking-widest uppercase">
                    {isSynthesizing ? "Synthesizing RNA..." : "Ready for Mutation"}
                 </p>
            </div>
        </motion.div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* --- LEFT COLUMN: THE HELIX SPINE (Timeline/Structure) --- */}
            <div className="hidden lg:block lg:col-span-1 relative">
                {/* The Spine Line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/50 to-transparent"></div>
                
                {/* Nodes */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[200px] w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[400px] w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></div>
            </div>

            {/* --- MIDDLE COLUMN: GENE EDITOR (Inputs) --- */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* CHROMOSOME 1: IDENTITY */}
                <motion.section variants={geneVariants} className="relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                    
                    <h3 className="flex items-center gap-2 text-sm font-mono text-purple-400 uppercase tracking-widest mb-6">
                        <Binary size={16}/> Chromosome 01 // Identity
                    </h3>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-1 overflow-hidden">
                        <div className="grid grid-cols-1 divide-y divide-white/5">
                            {/* Entity Name */}
                            <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-white/5 transition-colors">
                                <label className="w-32 text-xs font-mono text-slate-500 uppercase">Entity Name</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-purple-500 font-mono">{`>`}</span>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Enter Startup Name"
                                        className="flex-1 bg-transparent text-white outline-none font-medium placeholder:text-slate-700" 
                                    />
                                </div>
                                {formData.name && <Activity size={14} className="text-green-500 hidden md:block" />}
                            </div>

                            {/* Origin URL */}
                            <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-white/5 transition-colors">
                                <label className="w-32 text-xs font-mono text-slate-500 uppercase">Origin URL</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-purple-500 font-mono">{`>`}</span>
                                    <input 
                                        type="text" 
                                        value={formData.url}
                                        onChange={(e) => handleInputChange("url", e.target.value)}
                                        placeholder="https://..." 
                                        className="flex-1 bg-transparent text-white outline-none font-medium placeholder:text-slate-700" 
                                    />
                                </div>
                            </div>
                            
                            {/* Mission (One Liner) */}
                            <div className="p-4 flex flex-col gap-2 hover:bg-white/5 transition-colors">
                                <label className="text-xs font-mono text-slate-500 uppercase flex justify-between">
                                    <span>Core Mutation (Mission)</span>
                                    <span className="text-[10px] text-purple-400">MAX 140 CHARS</span>
                                </label>
                                <div className="flex gap-2">
                                    <span className="text-purple-500 font-mono mt-1">{`//`}</span>
                                    <textarea 
                                        value={formData.oneLiner}
                                        onChange={(e) => handleInputChange("oneLiner", e.target.value)}
                                        className="w-full bg-transparent text-white outline-none h-20 resize-none leading-relaxed placeholder:text-slate-700" 
                                        placeholder="Define the primary problem you are solving..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>


                {/* CHROMOSOME 2: METRICS */}
                <motion.section variants={geneVariants} className="relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>

                    <h3 className="flex items-center gap-2 text-sm font-mono text-cyan-400 uppercase tracking-widest mb-6">
                        <Activity size={16}/> Chromosome 02 // Vital Signs
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-colors group/card">
                            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Burn Rate</div>
                            <div className="flex items-end gap-2">
                                <input 
                                    type="text" 
                                    value={formData.burnRate}
                                    onChange={(e) => handleInputChange("burnRate", e.target.value)}
                                    placeholder="0" 
                                    className="w-full bg-transparent text-2xl font-bold text-white outline-none border-b border-transparent group-hover/card:border-cyan-500/30 pb-1" 
                                />
                                <span className="text-xs text-cyan-500 font-mono mb-2">$/mo</span>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-colors group/card">
                            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Runway</div>
                            <div className="flex items-end gap-2">
                                <input 
                                    type="text" 
                                    value={formData.runway}
                                    onChange={(e) => handleInputChange("runway", e.target.value)}
                                    placeholder="0" 
                                    className="w-full bg-transparent text-2xl font-bold text-white outline-none border-b border-transparent group-hover/card:border-cyan-500/30 pb-1" 
                                />
                                <span className="text-xs text-cyan-500 font-mono mb-2">Months</span>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-colors group/card">
                            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Headcount</div>
                            <div className="flex items-end gap-2">
                                <input 
                                    type="text" 
                                    value={formData.teamSize}
                                    onChange={(e) => handleInputChange("teamSize", e.target.value)}
                                    placeholder="1" 
                                    className="w-full bg-transparent text-2xl font-bold text-white outline-none border-b border-transparent group-hover/card:border-cyan-500/30 pb-1" 
                                />
                                <span className="text-xs text-cyan-500 font-mono mb-2">Nodes</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

            </div>

            {/* --- RIGHT COLUMN: ACTIONS (Control Panel) --- */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* Warning Card */}
                {(!formData.burnRate || !formData.runway) && (
                    <motion.div variants={geneVariants} className="p-4 bg-orange-900/10 border border-orange-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertOctagon size={18} className="text-orange-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-orange-400 uppercase mb-1">Incomplete Strand</h4>
                                <p className="text-[10px] text-orange-200/70 leading-relaxed">
                                    Financial model data is missing. AI predictions will be 40% less accurate without burn rate history.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Action */}
                <motion.button
                    variants={geneVariants} 
                    onClick={handleSynthesize}
                    disabled={isSynthesizing}
                    className="w-full group relative overflow-hidden bg-white text-black h-14 rounded-xl font-bold tracking-wide uppercase text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                         {isSynthesizing ? (
                             <Loader2 className="animate-spin" size={18}/>
                         ) : (
                             <Zap size={18} className="fill-black"/>
                         )}
                         {isSynthesizing ? "Synthesizing..." : "Synthesize Genome"}
                    </span>
                </motion.button>
                
                {formData.name && (
                    <p className="text-[10px] text-center text-green-500 font-mono flex items-center justify-center gap-1">
                        <CheckCircle2 size={10} /> SYSTEM SYNCED
                    </p>
                )}

            </div>

        </div>
      </motion.div>
    </div>
  );
}