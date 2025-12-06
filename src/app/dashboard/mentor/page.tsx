// src/app/dashboard/mentors/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchMarketplaceMentors, requestMentorshipApi } from "@/lib/api-services";
import { useAuth } from "@/context/auth-context";
import { Users, Search, Briefcase, Star, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Mentor {
  userId: string;
  fullName: string;
  headline: string;
  avatarUrl?: string;
  industries: string[];
  skills: string[];
  company: string;
  position: string;
}

export default function MentorMarketplace() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMentors() {
      const res = await fetchMarketplaceMentors();
      if (res.success && res.mentors) {
        setMentors(res.mentors as any);
      }
      setLoading(false);
    }
    fetchMentors();
  }, []);

  const handleRequest = async (mentorId: string) => {
    if (!user) return;
    if (!confirm("Send a mentorship request to this mentor?")) return;

    setRequesting(mentorId);
    try {
      const token = await user.getIdToken();
      const res = await requestMentorshipApi(mentorId, token);
      if (res.success) {
        alert("Request sent successfully!");
      } else {
        alert(res.error);
      }
    } catch (e) {
      alert("Failed to send request.");
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Find a Mentor</h1>
          <p className="text-slate-400 text-sm">Connect with industry veterans who have walked the North Road.</p>
        </div>

        {/* Search Bar (Visual Only for MVP) */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by industry..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin" />
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-slate-400">No public mentors available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div key={mentor.userId} className="group bg-zinc-900/40 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 transition-all flex flex-col h-full">

              {/* Avatar & Head */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0">
                  {mentor.avatarUrl ? (
                    <img src={mentor.avatarUrl} alt={mentor.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xl">
                      {mentor.fullName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{mentor.fullName}</h3>
                  <p className="text-xs text-slate-400 mt-1">{mentor.position} @ {mentor.company}</p>
                </div>
              </div>

              {/* Bio/Headline */}
              <p className="text-sm text-slate-300 mb-6 line-clamp-2 h-10">
                {mentor.headline || "Experienced Mentor ready to help."}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6 flex-1 content-start">
                {mentor.industries?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 bg-cyan-950/30 text-cyan-400 border border-cyan-900/50 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <Link href={`/mentor/${mentor.userId}`} className="text-xs text-slate-500 hover:text-white transition">
                  View Profile
                </Link>
                <button
                  onClick={() => handleRequest(mentor.userId)}
                  disabled={!!requesting}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-cyan-400 text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  {requesting === mentor.userId ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}