// ============================================================================
// 📁 Hardware Source: src/app/admin/users/page.tsx
// 🕒 Date: 2025-12-01
// 🧠 Version: v1.0 (Admin User Management)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Paginated User Table.
// - Create/Edit/Delete Modals.
// - Role Management.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
    getUsers,
    createUser,
    editUser,
    deleteUser,
    setUserRole,
    AdminUser,
    CreateUserDTO,
    EditUserDTO
} from "@/app/actions/admin-user-actions";
import { UserRole } from "@/lib/user-service";
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";

export default function AdminUsersPage() {
    // State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [actionLoading, setActionLoading] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    // Forms
    const [createForm, setCreateForm] = useState<CreateUserDTO>({ email: "", fullName: "", role: "user" });
    const [editForm, setEditForm] = useState<EditUserDTO>({ uid: "" });

    // Fetch Data
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers(page, 20, roleFilter);
            setUsers(res.users);
            setTotal(res.total);
        } catch (err) {
            console.error(err);
            alert("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    // Handlers
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        const res = await createUser(createForm);
        setActionLoading(false);
        if (res.success) {
            setShowCreateModal(false);
            setCreateForm({ email: "", fullName: "", role: "user" });
            fetchUsers();
            alert("User created successfully. Reset email sent.");
        } else {
            alert("Error: " + res.error);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        const res = await editUser(editForm);
        setActionLoading(false);
        if (res.success) {
            setShowEditModal(false);
            fetchUsers();
        } else {
            alert("Error: " + res.error);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        const res = await deleteUser(selectedUser.uid);
        setActionLoading(false);
        if (res.success) {
            setShowDeleteModal(false);
            fetchUsers();
        } else {
            alert("Error: " + res.error);
        }
    };

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        if (!confirm(`Change role to ${newRole}? This will force a token refresh for the user.`)) return;
        setActionLoading(true);
        const res = await setUserRole(uid, newRole);
        setActionLoading(false);
        if (res.success) {
            fetchUsers();
        } else {
            alert("Error: " + res.error);
        }
    };

    // Render Helpers
    const RoleBadge = ({ role }: { role: string }) => {
        const colors: Record<string, string> = {
            admin: "bg-red-950/30 text-red-400 border-red-900/50",
            mentor: "bg-amber-950/30 text-amber-400 border-amber-900/50",
            founder: "bg-blue-950/30 text-blue-400 border-blue-900/50",
            accelerator: "bg-purple-950/30 text-purple-400 border-purple-900/50",
            user: "bg-zinc-800 text-slate-400 border-zinc-700"
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${colors[role] || colors.user}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#020202] text-slate-300 font-sans p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="text-amber-500" /> User Management
                    </h1>
                    <p className="text-slate-500 text-sm font-mono mt-1">
                        TOTAL USERS: {total} • PAGE: {page}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm rounded-lg flex items-center gap-2 transition"
                >
                    <Plus size={16} /> Create User
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative">
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value as any); setPage(1); }}
                        className="appearance-none bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="mentor">Mentor</option>
                        <option value="founder">Founder</option>
                        <option value="accelerator">Accelerator</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/50 text-slate-500 font-mono uppercase text-xs border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <Loader2 className="animate-spin mx-auto mb-2" />
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{user.displayName}</div>
                                        <div className="text-slate-500 text-xs font-mono">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <RoleBadge role={user.role} />
                                            {/* Quick Role Switcher (Hidden by default, visible on hover) */}
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-[10px] text-white rounded border border-white/10 px-1 py-0.5 focus:outline-none"
                                            >
                                                <option value="user">User</option>
                                                <option value="founder">Founder</option>
                                                <option value="mentor">Mentor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setEditForm({ uid: user.uid, email: user.email, fullName: user.displayName, role: user.role });
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-white transition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 hover:bg-red-950/30 rounded-lg text-slate-400 hover:text-red-400 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-slate-400 disabled:opacity-50 hover:text-white transition"
                >
                    Previous
                </button>
                <span className="text-slate-500 text-sm font-mono">Page {page}</span>
                <button
                    disabled={users.length < 20} // Simple check, ideally use total count
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-slate-400 disabled:opacity-50 hover:text-white transition"
                >
                    Next
                </button>
            </div>

            {/* --- MODALS --- */}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Create New User</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={createForm.fullName}
                                    onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-amber-500/50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={createForm.email}
                                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-amber-500/50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Role</label>
                                <select
                                    value={createForm.role}
                                    onChange={e => setCreateForm({ ...createForm, role: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-amber-500/50 focus:outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="founder">Founder</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 bg-zinc-800 text-slate-300 rounded-lg hover:bg-zinc-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2 bg-amber-600 text-black font-bold rounded-lg hover:bg-amber-500 transition"
                                >
                                    {actionLoading ? "Creating..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-amber-500/50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-amber-500/50 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2 bg-zinc-800 text-slate-300 rounded-lg hover:bg-zinc-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2 bg-amber-600 text-black font-bold rounded-lg hover:bg-amber-500 transition"
                                >
                                    {actionLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0a0a0a] border border-red-900/30 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Delete User?</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Are you sure you want to delete <strong>{selectedUser?.displayName}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2 bg-zinc-800 text-slate-300 rounded-lg hover:bg-zinc-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition"
                            >
                                {actionLoading ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
