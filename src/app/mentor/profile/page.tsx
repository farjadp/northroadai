// ============================================================================
// 📁 Hardware Source: src/app/mentor/profile/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0 (Overseer Mode)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Mentor Profile workflow (guard, fetch, create/edit).
// - "Overseer Mode" aesthetic (Gold/Slate/Deep Black).
// - Expertise Matrix & Portfolio via dynamic FieldArray.
// - Ghost Mode toggle through visibility switch.
// ============================================================================

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getApiUrl } from "@/lib/api-config";
import {
  MentorProfile,
  MentorProfileInput,
  mentorProfileBaseSchema,
} from "@/lib/mentor-profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  BadgeCheck,
  Edit3,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  Save,
  Shield,
  Sparkles,
  Upload,
  X,
  Plus,
  Trash2,
  Tag,
} from "lucide-react";

const industriesOptions = [
  "Fintech",
  "HealthTech",
  "AI/ML",
  "SaaS",
  "Marketplace",
  "Climate",
  "E-commerce",
  "Consumer",
  "Developer Tools",
];

const languagesOptions = ["English", "French", "Spanish", "German", "Farsi", "Arabic", "Hindi", "Chinese"];

const formSchema = mentorProfileBaseSchema
  .omit({ userId: true, badges: true })
  .extend({
    hourlyRate: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        const num = Number(val);
        return Number.isNaN(num) ? undefined : num;
      }),
  });

type FormValues = z.infer<typeof formSchema>;

export default function MentorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, userRole, isMentor } = useAuth();

  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const defaultValues: FormValues = useMemo(
    () => ({
      fullName: "",
      avatarUrl: "",
      industries: [],
      expertiseTags: [],
      coachingStyle: "Strategic",
      languages: [],
      isInvestor: false,
      portfolio: [],
      calendlyUrl: "",
      hourlyRate: undefined,
      visibility: "private",
      bio: "",
    }),
    []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
    mode: "onBlur",
  });

  const { control, handleSubmit, reset, setValue, watch, formState } = form;
  const { errors } = formState;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolio",
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(getApiUrl(`/api/mentor/profile?uid=${user.uid}`), {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const json = await res.json();

      if (res.ok && json.success && json.profile) {
        const data = json.profile;
        setProfile(data);
        reset({
          fullName: data.fullName || user?.displayName || "",
          avatarUrl: data.avatarUrl || "",
          industries: data.industries || [],
          expertiseTags: data.expertiseTags || [],
          coachingStyle: data.coachingStyle || "Strategic",
          languages: data.languages || [],
          isInvestor: !!data.isInvestor,
          portfolio: data.portfolio || [],
          calendlyUrl: data.calendlyUrl || "",
          hourlyRate: data.hourlyRate,
          visibility: data.visibility || "private",
          bio: data.bio || "",
        });
      } else {
        // If 404 or not found, go to create/edit mode
        setProfile(null);
        reset({
          ...defaultValues,
          fullName: user?.displayName || user?.email || "",
        });
        setEditing(true);
      }
    } catch (e: unknown) {
      console.error(e);
      setError("Failed to load mentor profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [defaultValues, reset, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isMentor) {
      // Non-mentors are redirected away from this area
      router.replace("/dashboard");
      return;
    }
    loadProfile();
  }, [authLoading, user, isMentor, loadProfile, router]);

  const handleAvatarUpload = async (file?: File) => {
    if (!user || !file) return;
    setSaving(true);
    setStatus("Uploading avatar...");
    try {
      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);
      setValue("avatarUrl", url, { shouldValidate: true });
      setStatus("Avatar uploaded.");
    } catch (e) {
      console.error(e);
      setError("Avatar upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = handleSubmit(async (values: FormValues) => {
    if (!user) return;
    setSaving(true);
    setStatus("Saving profile...");
    setError(null);
    try {
      const token = await user.getIdToken(true);
      const payload: MentorProfileInput = {
        ...(values as MentorProfileInput),
        userId: user.uid,
        badges: profile?.badges || [],
      };

      const method = profile ? "PUT" : "POST";
      const res = await fetch(getApiUrl("/api/mentor/profile"), {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ profile: payload })
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setStatus(profile ? "Profile updated." : "Profile created.");

      await loadProfile();
      setEditing(false);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  });

  const toggleGhostMode = () => {
    const current = watch("visibility");
    setValue("visibility", current === "public" ? "private" : "public");
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const current = watch("expertiseTags") || [];
    if (current.includes(tagInput.trim())) {
      setTagInput("");
      return;
    }
    setValue("expertiseTags", [...current, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const current = watch("expertiseTags") || [];
    setValue(
      "expertiseTags",
      current.filter((t) => t !== tag)
    );
  };

  const editingMode = editing || !profile;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-[0.3em]">
          <Shield size={14} />
          Overseer Mode
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Mentor Profile</h1>
            <p className="text-slate-400 text-sm font-mono">
              Curate your expertise matrix. Visibility: {watch("visibility") === "public" ? "Public" : "Private"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleGhostMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition ${watch("visibility") === "public"
                ? "border-green-500/50 text-green-200 bg-green-500/10"
                : "border-slate-700 text-slate-300 bg-slate-900/60"
                }`}
            >
              {watch("visibility") === "public" ? <Eye size={16} /> : <EyeOff size={16} />}
              Ghost Mode
            </button>
            {profile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      {status && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">
          {status}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {profileLoading ? (
        <div className="rounded-2xl border border-white/10 bg-black/50 p-10 text-center text-slate-400">
          <Loader2 className="mx-auto animate-spin mb-3" />
          Syncing profile...
        </div>
      ) : (
        <>
          {!editingMode && profile && (
            <MentorProfileView profile={profile} onEdit={() => setEditing(true)} />
          )}

          {editingMode && (
            <form onSubmit={onSubmit} className="space-y-8">
              <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-black to-slate-950 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-mono text-amber-400 tracking-[0.2em]">
                      Expertise Matrix
                    </p>
                    <h2 className="text-xl font-bold text-white">Identity & Availability</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Sparkles size={14} className="text-amber-400" />
                    Role: {userRole}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Full Name</label>
                    <input
                      {...form.register("fullName")}
                      placeholder="Your name"
                      className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                    {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Avatar</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-slate-900 overflow-hidden flex items-center justify-center text-slate-500">
                        {watch("avatarUrl") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={watch("avatarUrl")!} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <BadgeCheck size={24} />
                        )}
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-amber-400 transition">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                    {errors.avatarUrl && <p className="text-xs text-red-400">{errors.avatarUrl.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Coaching Style</label>
                    <select
                      {...form.register("coachingStyle")}
                      className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                    >
                      {["Strategic", "Tactical", "Cheerleader", "Challenger"].map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                    {errors.coachingStyle && <p className="text-xs text-red-400">{errors.coachingStyle.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Calendly URL</label>
                    <input
                      {...form.register("calendlyUrl")}
                      placeholder="https://calendly.com/you"
                      className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                    {errors.calendlyUrl && <p className="text-xs text-red-400">{errors.calendlyUrl.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Industries</label>
                    <Controller
                      control={control}
                      name="industries"
                      render={({ field }) => (
                        <select
                          multiple
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Array.from(e.target.selectedOptions).map((opt) => opt.value))
                          }
                          className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white min-h-[120px]"
                        >
                          {industriesOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.industries && <p className="text-xs text-red-400">{errors.industries.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Languages</label>
                    <Controller
                      control={control}
                      name="languages"
                      render={({ field }) => (
                        <select
                          multiple
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Array.from(e.target.selectedOptions).map((opt) => opt.value))
                          }
                          className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white min-h-[120px]"
                        >
                          {languagesOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.languages && <p className="text-xs text-red-400">{errors.languages.message as string}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Expertise Tags</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="e.g. GTM, Fundraising"
                        className="flex-1 bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-amber-400"
                      >
                        <Tag size={14} />
                        Add
                      </button>
                    </div>
                    {errors.expertiseTags && (
                      <p className="text-xs text-red-400">{errors.expertiseTags.message as string}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(watch("expertiseTags") || []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-200 rounded-full text-xs border border-amber-500/30"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Investor</label>
                    <label className="inline-flex items-center gap-2 text-slate-200">
                      <input type="checkbox" {...form.register("isInvestor")} className="w-4 h-4" />
                      I invest in startups
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase">Hourly Rate (USD)</label>
                    <input
                      type="number"
                      step="50"
                      {...form.register("hourlyRate")}
                      className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                      placeholder="250"
                    />
                    {errors.hourlyRate && <p className="text-xs text-red-400">{errors.hourlyRate.message as string}</p>}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-black/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-mono text-slate-500 tracking-[0.2em]">Signal Feed</p>
                    <h2 className="text-xl font-bold text-white">Portfolio</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ startupName: "", outcome: "Active" })}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-amber-400"
                  >
                    <Plus size={14} />
                    Add Startup
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.length === 0 && (
                    <div className="text-slate-500 text-sm font-mono">No startups added yet.</div>
                  )}
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-[1.2fr_0.6fr_auto] gap-3 items-center border border-slate-800 rounded-xl p-3 bg-slate-900/40"
                    >
                      <input
                        {...form.register(`portfolio.${idx}.startupName` as const)}
                        placeholder="Startup Name"
                        className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                      />
                      <select
                        {...form.register(`portfolio.${idx}.outcome` as const)}
                        className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                      >
                        {["Active", "Exited", "Failed"].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="justify-self-end p-2 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                      {errors.portfolio?.[idx]?.startupName && (
                        <p className="text-xs text-red-400 md:col-span-3">
                          {errors.portfolio[idx]?.startupName?.message as string}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-black/40 p-6 space-y-4">
                <p className="text-xs uppercase font-mono text-slate-500 tracking-[0.2em]">Broadcast</p>
                <label className="text-sm text-slate-300 font-semibold">Bio</label>
                <textarea
                  {...form.register("bio")}
                  rows={5}
                  className="w-full bg-black border border-slate-800 rounded-lg px-3 py-2 text-white"
                  placeholder="Short intro, wins, what founders can expect..."
                />
                {errors.bio && <p className="text-xs text-red-400">{errors.bio.message as string}</p>}
              </section>

              <div className="flex items-center gap-3 justify-end">
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      if (profile) {
                        reset({
                          fullName: profile.fullName || "",
                          avatarUrl: profile.avatarUrl || "",
                          industries: profile.industries || [],
                          expertiseTags: profile.expertiseTags || [],
                          coachingStyle: profile.coachingStyle || "Strategic",
                          languages: profile.languages || [],
                          isInvestor: !!profile.isInvestor,
                          portfolio: profile.portfolio || [],
                          calendlyUrl: profile.calendlyUrl || "",
                          hourlyRate: profile.hourlyRate,
                          visibility: profile.visibility || "private",
                          bio: profile.bio || "",
                        });
                      }
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-slate-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function MentorProfileView({ profile, onEdit }: { profile: MentorProfile; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-black to-slate-950 p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full border border-amber-500/40 overflow-hidden bg-slate-900 flex items-center justify-center text-amber-200">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <Globe2 size={28} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{profile.fullName || profile.userId}</h2>
            {profile.isInvestor && (
              <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-200 text-xs border border-emerald-500/30">
                Investor
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-full text-xs border ${profile.visibility === "public"
                ? "bg-green-500/10 text-green-200 border-green-500/30"
                : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
            >
              {profile.visibility}
            </span>
          </div>
          {profile.bio && <p className="text-slate-400 text-sm mt-2">{profile.bio}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.expertiseTags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400"
        >
          <Edit3 size={14} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoBlock title="Coaching Style" value={profile.coachingStyle} />
        <InfoBlock title="Industries" value={profile.industries?.join(", ") || "—"} />
        <InfoBlock title="Languages" value={profile.languages?.join(", ") || "—"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBlock title="Calendly" value={profile.calendlyUrl || "—"} />
        <InfoBlock title="Hourly Rate" value={profile.hourlyRate ? `$${profile.hourlyRate}` : "—"} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold">Portfolio</h3>
        </div>
        {profile.portfolio && profile.portfolio.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.portfolio.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{item.startupName}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${item.outcome === "Exited"
                      ? "bg-green-500/10 text-green-200 border-green-500/30"
                      : item.outcome === "Failed"
                        ? "bg-red-500/10 text-red-200 border-red-500/30"
                        : "bg-blue-500/10 text-blue-200 border-blue-500/30"
                      }`}
                  >
                    {item.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm font-mono">No portfolio entries yet.</p>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs uppercase font-mono text-slate-500">{title}</p>
      <p className="text-white text-sm mt-1">{value || "—"}</p>
    </div>
  );
}
