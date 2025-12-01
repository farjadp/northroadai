// ============================================================================
// 📁 Hardware Source: src/app/dashboard/community/page.tsx
// 🕒 Date: 2025-11-29 20:30
// 🧠 Version: v1.0 (The Founder Hive)
// ----------------------------------------------------------------------------
// ✅ Features:
// 1) "Ghost Mode" Toggle: Allows posting anonymously while keeping verified badges.
// 2) "Hive Intelligence": AI summarizes trending topics at the top.
// 3) Filter by "Stage": Founders only see relevant content (Idea vs Series A).
// 4) Visual "Intel Cards" instead of boring text lists.
//
// 📝 Notes:
// - Uses a masonry-like grid for posts.
// - "Verified Founder" badges add trust.
// ============================================================================

"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Ghost, 
  Flame, 
  Filter, 
  ShieldCheck,
  Search,
  Hash,
  Share2
} from "lucide-react";

// --- MOCK DATA ---
const TRENDING_TOPICS = [
    { id: 1, tag: "SaaS Pricing", count: 42 },
    { id: 2, tag: "YC Interview", count: 18 },
    { id: 3, tag: "Burnout", count: 125 },
];

const POSTS = [
    {
        id: 1,
        author: "Alex V.",
        role: "Seed Stage • Fintech",
        verified: true,
        anonymous: false,
        title: "How we cut AWS costs by 60% using spot instances",
        preview: "We were burning $4k/mo just on EC2. After talking to the Architect Agent here, we realized...",
        tags: ["Engineering", "Cost Cutting"],
        likes: 34,
        comments: 12,
        hot: true
    },
    {
        id: 2,
        author: "Anonymous Founder",
        role: "Series A • Healthtech",
        verified: true,
        anonymous: true,
        title: "Co-founder breakup: Lessons learned the hard way",
        preview: "It started with a disagreement over equity vesting. If you don't have a cliff, read this now.",
        tags: ["Legal", "Team"],
        likes: 156,
        comments: 45,
        hot: true
    },
    {
        id: 3,
        author: "Sarah J.",
        role: "Idea Phase • EdTech",
        verified: false,
        anonymous: false,
        title: "Is $50k pre-seed valuation realistic in 2025?",
        preview: "Investors are laughing at my cap table. Looking for benchmarks in the Canadian market.",
        tags: ["Fundraising", "Validation"],
        likes: 8,
        comments: 24,
        hot: false
    }
];

// --- ANIMATION ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function TheHive() {
  const [activeTab, setActiveTab] = useState("feed");
  const [ghostMode, setGhostMode] = useState(false);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-8"
    >
      
      {/* --- HEADER: HIVE INTELLIGENCE --- */}
      <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left: Title & AI Summary */}
          <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
                      <Flame size={24} />
                  </div>
                  <div>
                      <h1 className="text-3xl font-bold text-white tracking-tight">The Hive</h1>
                      <p className="text-sm text-slate-400 font-mono">Collective Intelligence of 842 Founders</p>
                  </div>
              </div>

              {/* AI Insight Box */}
              <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-xl flex gap-4 items-start relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10"><Users size={80}/></div>
                   <div className="mt-1 min-w-[24px]">
                       <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                   </div>
                   <div>
                       <h3 className="text-xs font-bold text-green-400 uppercase mb-1">Live Hive Insight</h3>
                       <p className="text-sm text-slate-300 leading-relaxed">
                           &quot;Today, 40% of discussions are about <span className="text-white font-medium border-b border-white/20">Term Sheets</span>. Be aware that VCs are pushing for higher liquidation preferences this month.&quot;
                       </p>
                   </div>
              </div>
          </div>

          {/* Right: Quick Stats / Topics */}
          <div className="w-full md:w-80 space-y-3">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Trending Vectors</h3>
              <div className="flex flex-wrap gap-2">
                  {TRENDING_TOPICS.map(topic => (
                      <div key={topic.id} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition">
                          <Hash size={14} className="text-slate-500"/>
                          <span className="text-sm text-slate-300">{topic.tag}</span>
                          <span className="text-xs text-cyan-500 bg-cyan-900/20 px-1.5 py-0.5 rounded ml-auto">{topic.count}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>


      {/* --- CONTROLS & COMPOSER --- */}
      <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-y border-white/10 py-4 -mx-4 px-4 md:mx-0 md:px-0 md:border-y-0 md:bg-transparent md:backdrop-blur-none">
          <div className="flex flex-col md:flex-row justify-between gap-4">
              
              {/* Search & Filter */}
              <div className="flex gap-2">
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                      <input type="text" placeholder="Search insights..." className="pl-10 pr-4 py-2.5 bg-black border border-white/10 rounded-lg text-sm text-white focus:border-cyan-500 outline-none w-full md:w-64"/>
                  </div>
                  <button className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white">
                      <Filter size={18}/>
                  </button>
              </div>

              {/* Ghost Mode Composer Trigger */}
              <button 
                onClick={() => setGhostMode(!ghostMode)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg ${
                    ghostMode 
                    ? "bg-purple-600 text-white shadow-purple-500/20" 
                    : "bg-white text-black hover:bg-slate-200"
                }`}
              >
                  {ghostMode ? <Ghost size={18} className="animate-pulse"/> : <MessageSquare size={18}/>}
                  <span>{ghostMode ? "Ghost Mode Active" : "Share Experience"}</span>
              </button>
          </div>
      </div>


      {/* --- FEED GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post) => (
              <motion.div 
                key={post.id} 
                variants={itemVariants}
                className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-1 flex flex-col"
              >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                              post.anonymous ? "bg-purple-900/20 border-purple-500/30 text-purple-400" : "bg-slate-800 border-white/10 text-slate-400"
                          }`}>
                              {post.anonymous ? <Ghost size={20}/> : <span className="font-bold text-sm">{post.author.charAt(0)}</span>}
                          </div>
                          <div>
                              <div className="flex items-center gap-1.5">
                                  <span className={`text-sm font-bold ${post.anonymous ? "text-purple-400" : "text-white"}`}>
                                      {post.author}
                                  </span>
                                  {post.verified && <ShieldCheck size={12} className="text-cyan-500"/>}
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono uppercase">{post.role}</p>
                          </div>
                      </div>
                      {post.hot && <div className="text-orange-500"><Flame size={16}/></div>}
                  </div>

                  {/* Content */}
                  <div className="mb-6 flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors cursor-pointer">
                          {post.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                          {post.preview}
                      </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-slate-400">
                              #{tag}
                          </span>
                      ))}
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-slate-500 text-xs font-mono">
                      <div className="flex gap-4">
                          <button className="flex items-center gap-1.5 hover:text-pink-500 transition">
                              <Heart size={14}/> {post.likes}
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-cyan-500 transition">
                              <MessageSquare size={14}/> {post.comments}
                          </button>
                      </div>
                      <button className="hover:text-white transition">
                          <Share2 size={14}/>
                      </button>
                  </div>

              </motion.div>
          ))}
      </div>

    </motion.div>
  );
}
