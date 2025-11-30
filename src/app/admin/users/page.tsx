// ============================================================================
// 📁 Hardware Source: src/app/admin/users/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.1 (User & Role Admin)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Lists users from Firestore with search.
// - Allows tier updates and role (user/admin) changes.
// - Shows loading states and inline dropdowns.
// ============================================================================

"use client";
import React, { useEffect, useState } from "react";
import { UserService, UserProfile, UserTier, UserRole } from "@/lib/user-service";
import { Shield, Search, ChevronDown, Check } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);
    const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await UserService.getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleTierChange = async (uid: string, newTier: UserTier) => {
        setUpdating(uid);
        try {
            await UserService.updateUserTier(uid, newTier);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, tier: newTier } : u));
        } catch (error) {
            console.error("Failed to update tier", error);
            alert("Failed to update user tier.");
        } finally {
            setUpdating(null);
        }
    };

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        setRoleUpdating(uid);
        try {
            await UserService.updateUserRole(uid, newRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Failed to update user role.");
        } finally {
            setRoleUpdating(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.uid.includes(searchTerm)
    );

    if (loading) return <div className="p-8 text-slate-400 font-mono">Loading user database...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">User Management</h1>
                    <p className="text-slate-500 text-sm font-mono">Manage access levels and tactical assignments.</p>
                </div>
                <div className="flex items-center bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400">
                    <Search size={14} className="mr-2" />
                    <input
                        type="text"
                        placeholder="Search email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none w-48 placeholder:text-slate-700"
                    />
                </div>
            </header>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 uppercase font-mono text-xs">
                        <tr>
                            <th className="p-4">User Identity</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Current Tier</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map((user) => (
                            <tr key={user.uid} className="hover:bg-slate-900/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-white">{user.email}</div>
                                    <div className="text-xs text-slate-600 font-mono mt-1">{user.uid}</div>
                                </td>
                                <td className="p-4 font-mono text-xs">
                                    {user.createdAt.toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${user.tier === 'COMMAND' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' :
                                            user.tier === 'VANGUARD' ? 'bg-cyan-900/20 text-cyan-400 border-cyan-500/30' :
                                                'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                        {user.tier}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="relative group inline-block">
                                        <button
                                            disabled={roleUpdating === user.uid}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-black border border-slate-700 rounded hover:border-slate-500 text-xs text-slate-300 transition-colors disabled:opacity-50"
                                        >
                                            {roleUpdating === user.uid ? "Saving..." : (user.role || "user")}
                                            <ChevronDown size={12} />
                                        </button>
                                        <div className="absolute right-0 mt-1 w-32 bg-black border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                            {['user', 'admin'].map((role) => (
                                                <button
                                                    key={role}
                                                    onClick={() => handleRoleChange(user.uid, role as UserRole)}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-between"
                                                >
                                                    {role}
                                                    {(user.role || "user") === role && <Check size={10} className="text-cyan-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="relative group inline-block">
                                        <button
                                            disabled={updating === user.uid}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-black border border-slate-700 rounded hover:border-slate-500 text-xs text-slate-300 transition-colors disabled:opacity-50"
                                        >
                                            {updating === user.uid ? "Updating..." : "Change Tier"}
                                            <ChevronDown size={12} />
                                        </button>

                                        {/* Dropdown */}
                                        <div className="absolute right-0 mt-1 w-32 bg-black border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                            {['SCOUT', 'VANGUARD', 'COMMAND'].map((tier) => (
                                                <button
                                                    key={tier}
                                                    onClick={() => handleTierChange(user.uid, tier as UserTier)}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-between"
                                                >
                                                    {tier}
                                                    {user.tier === tier && <Check size={10} className="text-cyan-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 font-mono">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
"// ============================================================================\n// 📁 Hardware Source: src/app/admin/users/page.tsx\n// 🕒 Date: 2025-11-30\n// 🧠 Version: v1.1 (User & Role Admin)\n// ----------------------------------------------------------------------------\n// ✅ Logic:\n// - Lists users from Firestore with search.\n// - Allows tier updates and role (user/admin) changes.\n// - Shows loading states and inline dropdowns.\n// ============================================================================\n\n\"use client\";\n"
