"use client";

import React, { useEffect, useState, Suspense } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { fetchMentorProfile } from "@/lib/api-services";
import {
    Briefcase,
    Award,
    DollarSign,
    Calendar,
    MapPin,
    Linkedin,
    Twitter,
    Globe,
    CheckCircle2
} from "lucide-react";

function MentorPublicProfileContent() {
    const searchParams = useSearchParams();
    const uid = searchParams.get("uid");

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        fetchMentorProfile(uid).then(result => {
            if (result.success && result.profile) {
                setProfile(result.profile);
            } else {
                setError(true);
            }
            setLoading(false);
        }).catch(() => {
            setError(true);
            setLoading(false);
        });
    }, [uid]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500">Loading Profile...</div>;
    if (error || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Profile not found.</div>;
    if (!uid) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500">No User ID provided.</div>;

    // Determine outcome styling
    const getOutcomeBadge = (outcome: string) => {
        const styles = {
            "Exited": "bg-green-950/30 border-green-500 text-green-400",
            "Acquired": "bg-blue-950/30 border-blue-500 text-blue-400",
            "Active": "bg-cyan-950/30 border-cyan-500 text-cyan-400",
            "Failed": "bg-red-950/30 border-red-500 text-red-400"
        };
        return styles[outcome as keyof typeof styles] || styles.Active;
    };

    return (
        <div className="min-h-screen bg-black text-slate-300">

            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-zinc-900/50 to-black border-b border-white/10">
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-900 border-4 border-cyan-500/30 overflow-hidden flex-shrink-0">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
                                    {profile.displayName?.[0] || "M"}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-2">{profile.displayName}</h1>
                            <p className="text-xl text-cyan-400 mb-4 font-mono">{profile.headline}</p>

                            <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} />
                                    <span>{profile.position} at {profile.company}</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-3 mb-6">
                                {profile.linkedinUrl && (
                                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-cyan-950/30 border border-white/10 hover:border-cyan-500/50 rounded-lg transition">
                                        <Linkedin size={18} className="text-cyan-400" />
                                    </a>
                                )}
                                {profile.twitterUrl && (
                                    <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-cyan-950/30 border border-white/10 hover:border-cyan-500/50 rounded-lg transition">
                                        <Twitter size={18} className="text-cyan-400" />
                                    </a>
                                )}
                                {profile.websiteUrl && (
                                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900/50 hover:bg-cyan-950/30 border border-white/10 hover:border-cyan-500/50 rounded-lg transition">
                                        <Globe size={18} className="text-cyan-400" />
                                    </a>
                                )}
                            </div>

                            {/* Book Session Button */}
                            {profile.isAcceptingMentees && profile.calendlyUrl && (
                                <a
                                    href={profile.calendlyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition"
                                >
                                    <Calendar size={18} />
                                    Book a Session
                                </a>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">{profile.yearsExperience}+</div>
                        <div className="text-sm text-slate-400 font-mono uppercase">Years Experience</div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="text-3xl font-bold text-purple-400 mb-1">{profile.portfolio?.length || 0}</div>
                        <div className="text-sm text-slate-400 font-mono uppercase">Startups Helped</div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="text-3xl font-bold text-green-400 mb-1">{profile.pricingModel}</div>
                        <div className="text-sm text-slate-400 font-mono uppercase">Pricing Model</div>
                    </div>
                </div>

                {/* Bio */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        About
                    </h2>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                </div>

                {/* Expertise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 font-mono uppercase flex items-center gap-2">
                            <Briefcase size={16} className="text-cyan-400" /> Industries
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.industries?.map((industry: string) => (
                                <span key={industry} className="px-3 py-1 bg-cyan-950/30 border border-cyan-500 text-cyan-400 rounded-full text-xs font-mono">
                                    {industry}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 font-mono uppercase flex items-center gap-2">
                            <Award size={16} className="text-purple-400" /> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill: string) => (
                                <span key={skill} className="px-3 py-1 bg-purple-950/30 border border-purple-500 text-purple-400 rounded-full text-xs font-mono">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Coaching Style */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-12">
                    <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase">Coaching Style</h3>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span className="text-white font-medium">{profile.coachingStyle}</span>
                    </div>
                </div>

                {/* Portfolio Timeline */}
                {profile.portfolio && profile.portfolio.length > 0 && (
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award className="text-purple-400" />
                            Portfolio
                        </h2>

                        <div className="space-y-6">
                            {profile.portfolio.map((item: { startupName: string; outcome: string; description?: string }, index: number) => (
                                <div key={index} className="relative pl-8 border-l-2 border-white/10 pb-6 last:pb-0">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-black" />

                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{item.startupName}</h3>
                                            {item.description && (
                                                <p className="text-slate-400 text-sm mb-2">{item.description}</p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getOutcomeBadge(item.outcome)}`}>
                                            {item.outcome}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}

export default function MentorPublicProfile() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-slate-500">Loading Profile...</div>}>
            <MentorPublicProfileContent />
        </Suspense>
    );
}
