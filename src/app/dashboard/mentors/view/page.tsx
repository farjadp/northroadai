// ============================================================================
// 📁 Hardware Source: src/app/dashboard/mentors/[id]/page.tsx
// 🕒 Date: 2025-11-29 23:00
// 🧠 Version: v1.0 (Mentor Dossier & Secure Booking)
// ----------------------------------------------------------------------------
// ✅ Features:
// 1) Dynamic Profile: Displays detailed history/skills of a specific mentor.
// 2) Secure Booking Modal: The critical interaction point.
// 3) "Data Clearance" Toggle: User explicitly grants READ access to their DNA.
// 4) Visual Feedback: The UI changes color (Green/Red) based on privacy selection.
//
// 📝 Notes:
// - Mock data is used for "David Chen".
// - The "Share DNA" toggle simulates a database permission update.
// ============================================================================

"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ShieldCheck,
    Briefcase,
    Star,
    Clock,
    Linkedin,
    Twitter,
    CheckCircle2,
    Lock,
    Eye,
    EyeOff,
    CalendarCheck,
    FileText,
    Activity
} from "lucide-react";

// --- MOCK DATA FOR ONE MENTOR ---
const MENTOR = {
    id: 1,
    name: "David Chen",
    role: "Ex-Product VP @ Stripe",
    bio: "I help B2B SaaS founders navigate the 'Death Valley' between Seed and Series A. I focus on pricing strategy, PLG motion, and hiring your first sales leader. I am brutally honest but deeply supportive.",
    tags: ["Fundraising", "B2B Sales", "Pricing"],
    experience: [
        { year: "2019 - 2023", role: "VP of Product", company: "Stripe" },
        { year: "2015 - 2019", role: "Founder (Acquired)", company: "FinFlow" },
        { year: "2012 - 2015", role: "Senior PM", company: "Uber" },
    ],
    reviews: [
        { author: "Sarah (Fintech Founder)", text: "David destroyed my pitch deck in 10 minutes, and it was exactly what I needed. Raised $2M two months later." },
        { author: "Mike (Dev Tool)", text: "He understands the technical constraints unlike other generic mentors." }
    ],
    price: 2, // Credits
    nextSlot: "Tomorrow, 2:00 PM EST"
};

function BookingModal({
    onClose,
    shareData,
    setShareData,
    selectedSlot,
    setSelectedSlot
}: {
    onClose: () => void;
    shareData: boolean;
    setShareData: (val: boolean) => void;
    selectedSlot: string | null;
    setSelectedSlot: (val: string) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <h3 className="text-xl font-bold text-white">Secure Session Booking</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">Close</button>
                </div>

                <div className="p-6 space-y-6">

                    {/* 1. Slot Selection */}
                    <div>
                        <label className="text-xs font-mono text-slate-500 uppercase mb-2 block">Select Time Slot</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["Tomorrow, 2:00 PM", "Thu, Oct 15, 10:00 AM", "Fri, Oct 16, 4:00 PM"].map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`px-4 py-3 text-sm rounded-lg border transition-all text-left ${selectedSlot === slot
                                        ? "bg-cyan-900/20 border-cyan-500 text-cyan-400"
                                        : "bg-black border-white/10 text-slate-400 hover:border-white/30"
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. THE DATA PERMISSION TOGGLE */}
                    <div className={`p-4 rounded-xl border transition-all duration-300 ${shareData
                        ? "bg-green-900/10 border-green-500/30"
                        : "bg-red-900/10 border-red-500/30"
                        }`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {shareData ? <Eye size={18} className="text-green-500" /> : <EyeOff size={18} className="text-red-500" />}
                                <span className={`font-bold text-sm ${shareData ? "text-green-400" : "text-red-400"}`}>
                                    {shareData ? "Data Access Granted" : "Data Access Denied"}
                                </span>
                            </div>

                            {/* The Switch */}
                            <button
                                onClick={() => setShareData(!shareData)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${shareData ? "bg-green-500" : "bg-slate-700"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${shareData ? "translate-x-6" : "translate-x-0"}`}></div>
                            </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            {shareData
                                ? "David Chen will receive a temporary read-only link to your Startup DNA (Financials, Pitch Deck, Team Structure). This allows for a deeper, context-aware session."
                                : "You are booking a 'Blind Session'. The mentor will not see your internal data. You will need to spend the first 10-15 minutes explaining your context."
                            }
                        </p>

                        {/* Visualizing what is shared */}
                        {shareData && (
                            <div className="flex gap-2 mt-2">
                                <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/20"><Activity size={10} /> Burn Rate</span>
                                <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/20"><FileText size={10} /> Pitch Deck</span>
                            </div>
                        )}
                    </div>

                    {/* 3. Cost Summary */}
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
                        <span className="text-slate-400">Session Cost:</span>
                        <span className="font-bold text-white flex items-center gap-1">
                            <span className="text-yellow-500">⚡</span> {MENTOR.price} Credits
                        </span>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0">
                    <button
                        disabled={!selectedSlot}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <CalendarCheck size={18} />
                        Confirm Booking
                    </button>
                </div>

            </motion.div>
        </motion.div>
    );
}

function MentorProfileContent() {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [shareData, setShareData] = useState(false); // THE CORE LOGIC
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const searchParams = useSearchParams();
    // const id = searchParams.get("id");

    // --- MAIN PAGE RENDER ---
    return (
        <div className="max-w-5xl mx-auto pb-20">
            <AnimatePresence>
                {isBookingOpen && (
                    <BookingModal
                        onClose={() => setIsBookingOpen(false)}
                        shareData={shareData}
                        setShareData={setShareData}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={(slot) => setSelectedSlot(slot)}
                    />
                )}
            </AnimatePresence>

            {/* Back Nav */}
            <Link href="/dashboard/mentors" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition mb-8 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Grid (Params moved to query)
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN: PROFILE CARD --- */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-cyan-900/20 to-transparent"></div>

                        <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl mb-4">
                            <img src="https://i.pravatar.cc/300?u=david" alt="Mentor" className="object-cover w-full h-full" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-1">{MENTOR.name}</h1>
                        <p className="text-cyan-400 font-mono text-xs mb-4">{MENTOR.role}</p>

                        <div className="flex justify-center gap-4 mb-6">
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-[#0077b5] hover:text-white transition text-slate-400"><Linkedin size={18} /></a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-[#1da1f2] hover:text-white transition text-slate-400"><Twitter size={18} /></a>
                        </div>

                        <div className="space-y-3 text-left">
                            <div className="flex justify-between text-sm py-2 border-t border-white/5">
                                <span className="text-slate-500">Rating</span>
                                <span className="text-white font-bold flex items-center gap-1"><Star size={12} className="fill-yellow-500 text-yellow-500" /> 4.9</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-t border-white/5">
                                <span className="text-slate-500">Response</span>
                                <span className="text-white font-bold">&lt; 12 Hours</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-t border-white/5">
                                <span className="text-slate-500">Timezone</span>
                                <span className="text-white font-bold">EST (Toronto)</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsBookingOpen(true)}
                            className="w-full mt-6 py-3 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                            Book Session
                        </button>
                        <p className="text-[10px] text-slate-500 mt-2">Cost: {MENTOR.price} Credits / 30min</p>
                    </div>

                    {/* Skills */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xs font-mono text-slate-500 uppercase mb-4">Core Competencies</h3>
                        <div className="flex flex-wrap gap-2">
                            {MENTOR.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: THE DOSSIER --- */}
                <div className="md:col-span-2 space-y-8">

                    {/* Bio Section */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-cyan-500" /> Mentor Dossier
                        </h2>
                        <div className="bg-zinc-900/20 border border-white/10 rounded-2xl p-8 leading-relaxed text-slate-300 text-sm">
                            {MENTOR.bio}
                        </div>
                    </section>

                    {/* Experience Timeline */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-purple-500" /> Battle History
                        </h2>
                        <div className="space-y-4">
                            {MENTOR.experience.map((exp, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                        <div className="w-px h-full bg-slate-800 mx-auto my-1"></div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{exp.role}</h4>
                                        <p className="text-slate-400 text-sm">{exp.company}</p>
                                        <span className="text-xs font-mono text-slate-600">{exp.year}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Reviews */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-green-500" /> Founder Intel
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {MENTOR.reviews.map((rev, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-5">
                                    <div className="flex gap-1 mb-2">
                                        {[...Array(5)].map((_, j) => <Star key={j} size={12} className="fill-yellow-500 text-yellow-500" />)}
                                    </div>
                                    <p className="text-sm text-slate-300 italic mb-3">&quot;{rev.text}&quot;</p>
                                    <p className="text-xs text-slate-500 font-mono">— {rev.author}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

export default function MentorProfile() {
    return (
        <Suspense fallback={<div className="text-center text-white p-20">Loading Mentor Data...</div>}>
            <MentorProfileContent />
        </Suspense>
    );
}
