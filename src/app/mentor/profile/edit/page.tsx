// ============================================================================
// 📁 Hardware Source: src/app/mentor/profile/edit/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.1 (Moved to /mentor section)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Tabbed interface for mentor profile editing.
// - Profile strength gamification.
// - Avatar upload with preview.
// - Form validation with Zod.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Briefcase,
    Award,
    Settings,
    Upload,
    Plus,
    Trash2,
    Save,
    Loader2
} from "lucide-react";
import { mentorProfileUpdateSchema, MentorProfileUpdate, PortfolioEntry } from "@/lib/schemas/mentor-schema";
import { updateMentorProfileApi, uploadMentorAvatarApi, fetchMentorProfile } from "@/lib/api-services";
import { auth } from "@/lib/firebase";

type TabId = "identity" | "expertise" | "portfolio" | "settings";

const TABS = [
    { id: "identity" as TabId, label: "Identity", icon: User },
    { id: "expertise" as TabId, label: "Expertise", icon: Briefcase },
    { id: "portfolio" as TabId, label: "Portfolio", icon: Award },
    { id: "settings" as TabId, label: "Settings", icon: Settings }
];

const INDUSTRIES = ["Fintech", "HealthTech", "SaaS", "E-Commerce", "AI/ML", "Blockchain", "EdTech", "CleanTech", "FoodTech", "Marketplace"];
const SKILLS = ["Fundraising", "Product Strategy", "Go-To-Market", "Hiring", "Sales", "Marketing", "Engineering", "Design", "Operations", "Legal"];

export default function MentorProfileEdit() {
    const [activeTab, setActiveTab] = useState<TabId>("identity");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileStrength, setProfileStrength] = useState(0);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MentorProfileUpdate>({
        resolver: zodResolver(mentorProfileUpdateSchema),
        defaultValues: {
            uid: auth.currentUser?.uid || "",
            industries: [],
            skills: [],
            portfolio: [],
            isAcceptingMentees: true,
            pricingModel: "Pro Bono"
        }
    });

    const portfolioItems = watch("portfolio") || [];
    const selectedIndustries = watch("industries") || [];
    const selectedSkills = watch("skills") || [];

    // Fetch existing profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!auth.currentUser) return;

            setLoading(true);
            const result = await fetchMentorProfile(auth.currentUser.uid);

            if (result.success && result.profile) {
                const profile = result.profile as any;
                // Populate form
                Object.keys(profile).forEach((key) => {
                    setValue(key as any, profile[key as keyof typeof profile]);
                });
                setProfileStrength(profile.profileStrength || 0);
                if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);
            }

            setLoading(false);
        };

        fetchProfile();
    }, [setValue]);

    // Handle avatar upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        setUploadingAvatar(true);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append("avatar", file);

        const result = await uploadMentorAvatarApi(auth.currentUser.uid, formData);
        setUploadingAvatar(false);

        if (result.success && result.avatarUrl) {
            setValue("avatarUrl", result.avatarUrl);
        } else {
            alert("Error: " + result.error);
        }
    };

    // Handle form submission
    const onSubmit = async (data: MentorProfileUpdate) => {
        setSaving(true);

        const result = await updateMentorProfileApi(data);

        if (result.success) {
            if (result.profileStrength !== undefined) {
                setProfileStrength(result.profileStrength);
            }
            alert("Profile saved successfully!");
        } else {
            alert("Error: " + result.error);
        }

        setSaving(false);
    };

    // Portfolio handlers
    const addPortfolioItem = () => {
        const newItem: PortfolioEntry = { startupName: "", outcome: "Active", description: "" };
        setValue("portfolio", [...portfolioItems, newItem]);
    };

    const removePortfolioItem = (index: number) => {
        setValue("portfolio", portfolioItems.filter((_, i) => i !== index));
    };

    const updatePortfolioItem = (index: number, field: keyof PortfolioEntry, value: string) => {
        const updated = [...portfolioItems];
        updated[index] = { ...updated[index], [field]: value };
        setValue("portfolio", updated);
    };

    // Industry/Skill toggle
    const toggleIndustry = (industry: string) => {
        const updated = selectedIndustries.includes(industry)
            ? selectedIndustries.filter(i => i !== industry)
            : [...selectedIndustries, industry];
        setValue("industries", updated);
    };

    const toggleSkill = (skill: string) => {
        const updated = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill];
        setValue("skills", updated);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-400" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-slate-300 p-8">

            {/* Header + Profile Strength */}
            <div className="max-w-5xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">Edit Mentor Profile</h1>

                {/* Profile Strength Bar */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400 font-mono">PROFILE STRENGTH</span>
                        <span className="text-lg font-bold text-cyan-400">{profileStrength}%</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${profileStrength}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {profileStrength < 50 ? "Fill out more fields to increase visibility" :
                            profileStrength < 80 ? "Almost there! Add portfolio items for maximum impact" :
                                "Excellent! Your profile is complete"}
                    </p>
                </div>
            </div>

            {/* Tabbed Interface */}
            <div className="max-w-5xl mx-auto">

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-white/10">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-mono text-sm transition-all relative ${activeTab === tab.id
                                    ? "text-cyan-400 border-b-2 border-cyan-400"
                                    : "text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8"
                        >

                            {/* TAB 1: IDENTITY */}
                            {activeTab === "identity" && (
                                <div className="space-y-6">

                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-32 h-32 rounded-full bg-zinc-900 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-slate-600" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="cursor-pointer px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-sm rounded-lg inline-flex items-center gap-2 transition">
                                                <Upload size={16} />
                                                {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
                                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                            </label>
                                            <p className="text-xs text-slate-500 mt-2">Max 5MB. JPEG, PNG, or WebP</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Display Name</label>
                                        <input {...register("displayName")} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                        {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Headline</label>
                                        <input {...register("headline")} placeholder="e.g. Ex-YC Founder | Product Strategy Expert" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                        {errors.headline && <p className="text-red-400 text-xs mt-1">{errors.headline.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Bio</label>
                                        <textarea {...register("bio")} rows={5} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                        {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Company</label>
                                            <input {...register("company")} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Position</label>
                                            <input {...register("position")} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">LinkedIn URL</label>
                                        <input {...register("linkedinUrl")} type="url" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Twitter URL</label>
                                        <input {...register("twitterUrl")} type="url" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Website URL</label>
                                        <input {...register("websiteUrl")} type="url" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                    </div>

                                </div>
                            )}

                            {/* TAB 2: EXPERTISE */}
                            {activeTab === "expertise" && (
                                <div className="space-y-8">

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-3 font-mono uppercase">Industries</label>
                                        <div className="flex flex-wrap gap-2">
                                            {INDUSTRIES.map(industry => (
                                                <button
                                                    key={industry}
                                                    type="button"
                                                    onClick={() => toggleIndustry(industry)}
                                                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${selectedIndustries.includes(industry)
                                                        ? "bg-cyan-950/30 border-cyan-500 text-cyan-400"
                                                        : "bg-zinc-900 border-white/10 text-slate-400 hover:border-cyan-500/50"
                                                        }`}
                                                >
                                                    {industry}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-3 font-mono uppercase">Skills</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SKILLS.map(skill => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => toggleSkill(skill)}
                                                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${selectedSkills.includes(skill)
                                                        ? "bg-purple-950/30 border-purple-500 text-purple-400"
                                                        : "bg-zinc-900 border-white/10 text-slate-400 hover:border-purple-500/50"
                                                        }`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Coaching Style</label>
                                        <select {...register("coachingStyle")} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                                            <option value="Strategic">Strategic</option>
                                            <option value="Tactical">Tactical</option>
                                            <option value="Direct">Direct</option>
                                            <option value="Supportive">Supportive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Years of Experience</label>
                                        <input {...register("yearsExperience", { setValueAs: v => v === "" ? 0 : parseInt(v) })} type="number" min="0" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                    </div>

                                </div>
                            )}

                            {/* TAB 3: PORTFOLIO */}
                            {activeTab === "portfolio" && (
                                <div className="space-y-4">

                                    {portfolioItems.map((item, index) => (
                                        <div key={index} className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 relative">
                                            <button
                                                type="button"
                                                onClick={() => removePortfolioItem(index)}
                                                className="absolute top-3 right-3 p-1 text-red-400 hover:bg-red-950/30 rounded transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="space-y-3">
                                                <input
                                                    value={item.startupName}
                                                    onChange={(e) => updatePortfolioItem(index, "startupName", e.target.value)}
                                                    placeholder="Startup Name"
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                />
                                                <select
                                                    value={item.outcome}
                                                    onChange={(e) => updatePortfolioItem(index, "outcome", e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Exited">Exited</option>
                                                    <option value="Failed">Failed</option>
                                                    <option value="Acquired">Acquired</option>
                                                </select>
                                                <textarea
                                                    value={item.description || ""}
                                                    onChange={(e) => updatePortfolioItem(index, "description", e.target.value)}
                                                    placeholder="Description (optional)"
                                                    rows={2}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addPortfolioItem}
                                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Add Portfolio Item
                                    </button>

                                </div>
                            )}

                            {/* TAB 4: SETTINGS */}
                            {activeTab === "settings" && (
                                <div className="space-y-6">

                                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-white font-medium">Accepting Mentees</p>
                                            <p className="text-xs text-slate-500">Allow founders to request sessions</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            {...register("isAcceptingMentees")}
                                            className="w-12 h-6 accent-cyan-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Pricing Model</label>
                                        <select {...register("pricingModel")} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                                            <option value="Pro Bono">Pro Bono</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Equity">Equity</option>
                                        </select>
                                    </div>

                                    {watch("pricingModel") === "Paid" && (
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Hourly Rate ($)</label>
                                            <input {...register("hourlyRate", { setValueAs: v => v === "" ? undefined : parseInt(v) })} type="number" min="0" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2 font-mono uppercase">Calendly URL</label>
                                        <input {...register("calendlyUrl")} type="url" placeholder="https://calendly.com/yourusername" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                    </div>

                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Save Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>

            </div>

        </div>
    );
}
