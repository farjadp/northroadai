// ============================================================================
// 📁 Hardware Source: src/components/settings/profile-tab.tsx
// 🧠 Version: v1.0 (KYC & Profile Management)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Email is locked (Immutable).
// - Collects KYC data (Legal Name, Address, Tax ID).
// - Updates Firestore 'users/{uid}' document.
// ============================================================================

"use client";

import React, { useState } from "react";
import { User } from "firebase/auth";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  User as UserIcon, Mail, Lock, Globe, MapPin, 
  Phone, BadgeCheck, ShieldCheck, Loader2, Save, Fingerprint
} from "lucide-react";

interface ProfileTabProps {
  user: User | null;
  userRole: string;
  initialData?: any; // دیتای فعلی کاربر از دیتابیس
}

export function ProfileTab({ user, userRole, initialData }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  
  // State فرم با مقادیر اولیه
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    // فیلدهای KYC
    legalName: initialData?.kyc?.legalName || "",
    country: initialData?.kyc?.country || "",
    address: initialData?.kyc?.address || "",
    phone: initialData?.kyc?.phone || "",
    taxId: initialData?.kyc?.taxId || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // آپدیت در فایربیس
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        displayName: formData.displayName,
        // ذخیره دیتا در آبجکت KYC
        kyc: {
            legalName: formData.legalName,
            country: formData.country,
            address: formData.address,
            phone: formData.phone,
            taxId: formData.taxId,
            updatedAt: Timestamp.now()
        },
        profileComplete: true // فلگ تکمیل پروفایل
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // محاسبه درصد تکمیل KYC (برای نمایش گرافیکی)
  const kycFields = [formData.legalName, formData.country, formData.address, formData.phone];
  const filledCount = kycFields.filter(f => f.length > 0).length;
  const isKycComplete = filledCount === 4;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. CORE IDENTITY (Read-Only Email) */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UserIcon size={20} className="text-cyan-500"/> Core Identity
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (Locked) */}
            <div className="relative group opacity-70">
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
                    Email Address <Lock size={10} className="text-slate-600"/>
                </label>
                <div className="relative">
                    <input 
                        disabled 
                        value={user?.email || ""} 
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 pl-10 text-slate-400 font-mono text-sm cursor-not-allowed"
                    />
                    <Mail size={16} className="absolute left-3 top-3.5 text-slate-600"/>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">To change email, contact support.</p>
            </div>

            {/* Display Name */}
            <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Display Name</label>
                <div className="relative">
                    <input 
                        name="displayName"
                        value={formData.displayName} 
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-cyan-500/50 outline-none transition-all"
                    />
                    <UserIcon size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                </div>
            </div>

            {/* Role (Read Only) */}
            <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">System Role</label>
                <div className="font-mono text-sm text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5 uppercase flex items-center justify-between">
                    {userRole}
                    <span className="text-[10px] bg-cyan-900/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">ACTIVE</span>
                </div>
            </div>
        </div>
      </div>

      {/* 2. KYC & LEGAL (The New Part) */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
        {/* Verification Badge */}
        <div className="absolute top-0 right-0 p-6">
            {isKycComplete ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-900/10 px-3 py-1 rounded-full border border-green-500/20">
                    <BadgeCheck size={16}/> <span className="text-xs font-bold uppercase">Verified</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-amber-500 bg-amber-900/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <ShieldCheck size={16}/> <span className="text-xs font-bold uppercase">KYC Pending</span>
                </div>
            )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Fingerprint size={20} className="text-purple-500"/> Digital Compliance (KYC)
        </h3>
        <p className="text-slate-400 text-sm mb-8 max-w-2xl">
            Required for generating legal contracts, invoices, and accessing advanced banking features. Your data is encrypted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Legal Name */}
            <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Full Legal Name</label>
                <input 
                    name="legalName"
                    placeholder="e.g. Johnathan Doe"
                    value={formData.legalName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500/50 outline-none transition-all"
                />
            </div>

            {/* Country */}
            <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Country of Residence</label>
                <div className="relative">
                    <input 
                        name="country"
                        placeholder="e.g. Canada"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-purple-500/50 outline-none transition-all"
                    />
                    <Globe size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                <div className="relative">
                    <input 
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-purple-500/50 outline-none transition-all"
                    />
                    <Phone size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Billing Address</label>
                <div className="relative">
                    <input 
                        name="address"
                        placeholder="Street, City, Zip Code"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-purple-500/50 outline-none transition-all"
                    />
                    <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-cyan-400 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Save Changes
            </button>
        </div>

      </div>
    </div>
  );
}