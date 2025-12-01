// ============================================================================
// 📁 Hardware Source: src/app/dashboard/mentors/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v3.0 (Intelligence Uplink Terminal)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Smart Match Grid for finding mentors.
// - Context Injection Modal for booking.
// - "Liquid" Dark UI aesthetic.
// ============================================================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Star,
    Calendar,
    Clock,
    Briefcase,
    ShieldCheck,
    Zap,
    CheckCircle2,
    ExternalLink,
    Search,
    Filter,
    Lock,
    FileText,
    Cpu,
    X,
    ChevronRight,
    Fingerprint
} from "lucide-react";

// --- TYPES ---
type Mentor = {
    id: number;
    name: string;
    archetype: string; // e.g., "The Ex-YC Founder"
    specialty: string;
    companies: string[];
    rating: number;
    sessions: number;
    rate: number; // Hourly rate in $
    matchScore: number; // 0-100
    availability: string;
    image: string;
    bio: string;
    tags: string[];
};

// --- MOCK DATA ---
const MENTORS: Mentor[] = [
    {
        id: 1,
        name: "David Chen",
        archetype: "The Ex-YC Founder",
        specialty: "Fundraising & Strategy",
        companies: ["Stripe", "YC W19"],
        rating: 4.9,
        sessions: 142,
        rate: 250,
        matchScore: 98,
        availability: "Tomorrow",
        image: "https://i.pravatar.cc/150?u=david",
        bio: "I help founders craft pitch decks that actually get replies. Sold my last SaaS for $20M.",
        tags: ["Fundraising", "SaaS", "B2B"]
    },
    {
        id: 2,
        name: "Sarah Miller",
        archetype: "The Product Architect",
        specialty: "Product Market Fit",
        companies: ["Shopify", "Slack"],
        rating: 5.0,
        sessions: 89,
        rate: 180,
        matchScore: 94,
        availability: "Wed, Oct 12",
        image: "https://i.pravatar.cc/150?u=sarah",
        bio: "Stop building features nobody wants. I'll help you run swift validation experiments.",
        tags: ["Product", "UX", "Growth"]
    },
    {
        id: 3,
        name: "Dr. Arash K.",
        archetype: "The Deep Tech CTO",
        specialty: "Technical Strategy",
        companies: ["Google DeepMind", "UofT"],
        rating: 4.8,
        sessions: 56,
        rate: 300,
        matchScore: 88,
        availability: "Today",
        image: "https://i.pravatar.cc/150?u=arash",
        bio: "Scalability, LLM integration, and reducing cloud costs. Let's review your architecture.",
        tags: ["AI", "Cloud", "Engineering"]
    },
    {
        id: 4,
        name: "Elena Ross",
        archetype: "The Legal Eagle",
        specialty: "Legal & IP",
        companies: ["Dentons", "TechStars"],
        rating: 4.9,
        sessions: 210,
        rate: 200,
        matchScore: 82,
        availability: "Fri, Oct 14",
        image: "https://i.pravatar.cc/150?u=elena",
        bio: "Specializing in IP assignment and cross-border incorporation for Canadian startups.",
        tags: ["Legal", "IP", "Incorporation"]
    },
    {
        id: 5,
        name: "Marcus Thorne",
        archetype: "The Growth Hacker",
        specialty: "GTM & Sales",
        companies: ["HubSpot", "Salesforce"],
        rating: 4.7,
        sessions: 112,
        rate: 150,
        matchScore: 76,
        availability: "Mon, Oct 17",
        image: "https://i.pravatar.cc/150?u=marcus",
        bio: "From 0 to $1M ARR in 12 months. I'll show you the playbook.",
        tags: ["Sales", "Marketing", "GTM"]
    }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

// --- COMPONENTS ---

const BookingModal = ({
    isOpen,
    onClose,
    mentor,
    mode
}: {
    isOpen: boolean,
    onClose: () => void,
    mentor: Mentor | null,
    mode: "sync" | "async"
}) => {
    if (!isOpen || !mentor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-teal-900/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.1)]"
            >
                {/* Header */}
                <div className="p-6 border-b border-teal-900/30 bg-teal-950/10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-teal-500 font-mono text-xs uppercase tracking-widest mb-2">
                            <Lock size={12} /> Secure Uplink Established
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {mode === "sync" ? "Book Live Uplink" : "Request Async Audit"}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Connecting with <span className="text-teal-400 font-semibold">{mentor.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">

                    {/* Context Injection Preview */}
                    <div className="bg-black border border-teal-900/30 rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <FileText size={16} className="text-teal-500" />
                                Context Injection Dossier
                            </h3>
                            <span className="text-[10px] font-mono text-teal-600 bg-teal-950/30 px-2 py-1 rounded border border-teal-900/30">
                                ENCRYPTED
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            To maximize efficiency, we will securely transmit the following data to {mentor.name} so they don't waste time asking basic questions:
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                                    <Fingerprint size={12} className="text-purple-400" /> Startup DNA
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                    Stage: Growth<br />
                                    Burn: $12k/mo<br />
                                    Blocker: Fundraising
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                                    <Cpu size={12} className="text-blue-400" /> AI Session Logs
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                    Last 3 sessions summary<br />
                                    Key topics: Term Sheets, Valuation
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Estimated Cost</span>
                            <span className="text-xl font-bold text-white font-mono">
                                {mode === "sync" ? `$${mentor.rate}/hr` : `$${Math.round(mentor.rate * 0.6)} flat`}
                            </span>
                        </div>

                        <button className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2">
                            <Zap size={18} className="fill-black" />
                            {mode === "sync" ? "Confirm Booking" : "Send Request"}
                        </button>

                        <p className="text-center text-[10px] text-slate-600">
                            Payments are held in escrow until the session is complete.
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default function MentorGrid() {
    const [filter, setFilter] = useState("All");
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [bookingMode, setBookingMode] = useState<"sync" | "async">("sync");

    const handleBook = (mentor: Mentor, mode: "sync" | "async") => {
        setSelectedMentor(mentor);
        setBookingMode(mode);
    };

    const filteredMentors = MENTORS.filter(m => filter === "All" || m.tags.includes(filter) || m.specialty.includes(filter));

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-teal-500/20 selection:text-teal-200 pb-24">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-teal-900/20 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-teal-950/30 rounded-lg text-teal-400 border border-teal-900/50">
                                <Users size={20} />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                                Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-700">Uplink</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                            Escalate from AI to vetted industry experts.
                            <br /><span className="text-teal-500/80 font-mono text-xs flex items-center gap-1 mt-1">
                                <Cpu size={10} /> AI RECOMMENDATION: Your DNA suggests a need for &quot;Fundraising&quot; expertise.
                            </span>
                        </p>
                    </div>

                    {/* Search/Filter Widget */}
                    <div className="flex items-center gap-3 bg-black/40 border border-teal-900/30 rounded-full p-1.5 pl-4">
                        <Search size={14} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by expertise..."
                            className="bg-transparent border-none focus:outline-none text-sm text-white w-48 placeholder:text-slate-600"
                        />
                        <button className="p-2 bg-teal-900/20 hover:bg-teal-900/40 text-teal-400 rounded-full transition">
                            <Filter size={14} />
                        </button>
                    </div>
                </div>

                {/* --- FILTERS --- */}
                <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide mb-4">
                    {["All", "Fundraising", "Product", "Legal", "Sales", "Engineering"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === cat
                                ? "bg-teal-500 text-black border-teal-500"
                                : "bg-black text-slate-500 border-teal-900/30 hover:border-teal-700 hover:text-teal-400"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* --- MENTOR GRID --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredMentors.map((mentor) => (
                            <motion.div
                                key={mentor.id}
                                variants={cardVariants}
                                layout
                                className="group relative bg-[#0a0a0a] border border-teal-900/20 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Match Score Badge */}
                                <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded bg-black/80 backdrop-blur border ${mentor.matchScore > 90 ? "border-teal-500 text-teal-400" : "border-slate-700 text-slate-400"
                                        }`}>
                                        <Fingerprint size={12} />
                                        <span className="text-xs font-bold font-mono">{mentor.matchScore}% MATCH</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 relative">
                                    {/* Avatar & Info */}
                                    <div className="flex gap-4 mb-6">
                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-white/10 group-hover:border-teal-500/50 transition-colors">
                                                <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-teal-900/50">
                                                <ShieldCheck size={14} className="text-teal-500 fill-teal-900/50" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight mb-1">{mentor.name}</h3>
                                            <div className="inline-block px-2 py-0.5 rounded bg-teal-950/30 border border-teal-900/30 text-[10px] text-teal-400 font-mono uppercase tracking-wide mb-2">
                                                {mentor.archetype}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                <span className="text-slate-300 font-bold">{mentor.rating}</span>
                                                <span>• {mentor.sessions} sessions</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 min-h-[40px]">
                                        &quot;{mentor.bio}&quot;
                                    </p>

                                    {/* Companies */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {mentor.companies.map(co => (
                                            <span key={co} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                                <Briefcase size={10} /> {co}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleBook(mentor, "async")}
                                            className="px-3 py-2 rounded-lg border border-teal-900/30 text-teal-500 text-xs font-bold hover:bg-teal-950/30 transition flex items-center justify-center gap-2"
                                        >
                                            <FileText size={14} />
                                            Async Audit
                                        </button>
                                        <button
                                            onClick={() => handleBook(mentor, "sync")}
                                            className="px-3 py-2 rounded-lg bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 transition shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
                                        >
                                            <Zap size={14} className="fill-black" />
                                            Book Live
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock size={10} /> Next: <span className="text-slate-300">{mentor.availability}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        Rate: <span className="text-teal-400">${mentor.rate}/hr</span>
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>

            {/* --- MODAL --- */}
            <AnimatePresence>
                {selectedMentor && (
                    <BookingModal
                        isOpen={!!selectedMentor}
                        onClose={() => setSelectedMentor(null)}
                        mentor={selectedMentor}
                        mode={bookingMode}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}
