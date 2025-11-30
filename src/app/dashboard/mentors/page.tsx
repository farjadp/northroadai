// ============================================================================
// 📁 Hardware Source: src/app/dashboard/mentors/page.tsx
// 🕒 Date: 2025-11-29 21:45
// 🧠 Version: v1.0 (The Human Intelligence Grid)
// ----------------------------------------------------------------------------
// ✅ Features:
// 1) "Hybrid Intelligence": Shows AI Confidence Score vs Human intuition.
// 2) "Mentor Credits": Visual display of available booking tokens (Monetization hook).
// 3) "Holographic Cards": Personnel-style profiles with "Ex-Company" badges.
// 4) Filtering by Expertise (Fundraising, Product, Legal).
//
// 📝 Notes:
// - Integration point: This page should ideally check the user's Plan (B2B/B2C).
// - "Book Session" currently opens a mock modal.
// ============================================================================

"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  Briefcase, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

// --- MOCK MENTOR DATA ---
const MENTORS = [
    {
        id: 1,
        name: "David Chen",
        title: "Ex-YC Founder & Angel Investor",
        specialty: "Fundraising",
        companies: ["Stripe", "YC W19"],
        rating: 4.9,
        sessions: 142,
        rate: "2 Credits",
        availability: "Tomorrow",
        image: "https://i.pravatar.cc/150?u=david", // Placeholder
        bio: "I help founders craft pitch decks that actually get replies. Sold my last SaaS for $20M."
    },
    {
        id: 2,
        name: "Sarah Miller",
        title: "Senior Product Manager",
        specialty: "Product Market Fit",
        companies: ["Shopify", "Slack"],
        rating: 5.0,
        sessions: 89,
        rate: "1 Credit",
        availability: "Wed, Oct 12",
        image: "https://i.pravatar.cc/150?u=sarah",
        bio: "Stop building features nobody wants. I'll help you run swift validation experiments."
    },
    {
        id: 3,
        name: "Dr. Arash K.",
        title: "AI Architect & CTO",
        specialty: "Technical Strategy",
        companies: ["Google DeepMind", "UofT"],
        rating: 4.8,
        sessions: 56,
        rate: "3 Credits",
        availability: "Today",
        image: "https://i.pravatar.cc/150?u=arash",
        bio: "Scalability, LLM integration, and reducing cloud costs. Let's review your architecture."
    },
    {
        id: 4,
        name: "Elena Ross",
        title: "Corporate Law Partner",
        specialty: "Legal & IP",
        companies: ["Dentons", "TechStars"],
        rating: 4.9,
        sessions: 210,
        rate: "2 Credits",
        availability: "Fri, Oct 14",
        image: "https://i.pravatar.cc/150?u=elena",
        bio: "Specializing in IP assignment and cross-border incorporation for Canadian startups."
    }
];

// --- ANIMATION ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
};

export default function MentorGrid() {
  const [filter, setFilter] = useState("All");

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-10"
    >
      
      {/* --- HEADER: CREDIT SYSTEM --- */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8 gap-6">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                      <Users size={20} />
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Human Intelligence Grid</h1>
              </div>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  When AI hits its limit, escalate to vetted industry experts. 
                  <br/><span className="text-cyan-400 font-mono text-xs">AI RECOMMENDATION: Your recent questions about "Term Sheets" suggest booking a Legal Mentor.</span>
              </p>
          </div>

          {/* Credit Card Widget */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-xl p-5 flex items-center gap-6 shadow-2xl">
              <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Available Balance</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                      2 <span className="text-sm font-normal text-slate-400">/ 3 Credits</span>
                  </div>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-cyan-400 transition flex items-center gap-2">
                  <Zap size={14} className="fill-black"/> Top Up
              </button>
          </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Fundraising", "Product", "Technical Strategy", "Legal & IP"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    filter === cat 
                    ? "bg-white text-black border-white" 
                    : "bg-black text-slate-500 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* --- MENTOR CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {MENTORS.filter(m => filter === "All" || m.specialty === filter).map((mentor) => (
              <motion.div 
                key={mentor.id}
                variants={cardVariants}
                className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                  {/* Header: Profile & Badge */}
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                          <div className="relative">
                              <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                                  {/* In a real app, use next/image */}
                                  <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                                  <ShieldCheck size={14} className="text-cyan-500 fill-cyan-900"/>
                              </div>
                          </div>
                          <div>
                              <h3 className="font-bold text-white text-lg">{mentor.name}</h3>
                              <p className="text-xs text-cyan-400 font-mono mb-1">{mentor.specialty}</p>
                              <div className="flex items-center gap-1">
                                  <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                                  <span className="text-xs font-bold text-white">{mentor.rating}</span>
                                  <span className="text-[10px] text-slate-500">({mentor.sessions} sessions)</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Body: Bio & Social Proof */}
                  <div className="space-y-4 mb-6 flex-1">
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                          "{mentor.bio}"
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                          {mentor.companies.map(co => (
                              <span key={co} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-slate-300 flex items-center gap-1">
                                  <Briefcase size={10} className="text-slate-500"/> {co}
                              </span>
                          ))}
                      </div>
                  </div>

                  {/* Footer: Availability & Action */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                              <Calendar size={12}/> 
                              <span>Next: <span className="text-white">{mentor.availability}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                              <Zap size={12}/> 
                              <span>Cost: {mentor.rate}</span>
                          </div>
                      </div>
                      
                      <button className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-white/5">
                          Book Session
                      </button>
                  </div>

              </motion.div>
          ))}
      </div>

    </motion.div>
  );
}