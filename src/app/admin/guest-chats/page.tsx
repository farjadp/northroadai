"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { Terminal, Calendar, Monitor, MessageSquare } from "lucide-react";

type GuestChat = {
    id: string;
    message: string;
    response: string;
    fingerprint?: string;
    ip?: string;
    userAgent?: string;
    createdAt?: Date | null;
};

export default function GuestChatsPage() {
    const [chats, setChats] = useState<GuestChat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const q = query(
                    collection(db, "guest_chats"),
                    orderBy("createdAt", "desc"),
                    limit(50)
                );
                const snapshot = await getDocs(q);
                const data: GuestChat[] = snapshot.docs.map(doc => {
                    const raw = doc.data();
                    const createdAt = raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : raw.createdAt?.toDate?.();
                    return {
                        id: doc.id,
                        message: raw.message,
                        response: raw.response,
                        fingerprint: raw.fingerprint,
                        ip: raw.ip,
                        userAgent: raw.userAgent,
                        createdAt: createdAt || null
                    };
                });
                setChats(data);
            } catch (error) {
                console.error("Error fetching chats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    if (loading) {
        return <div className="p-8 text-slate-400 font-mono">Loading neural logs...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Guest Chat Logs</h1>
                <p className="text-slate-500 text-sm font-mono">Recent interactions from the public homepage.</p>
            </header>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-mono text-xs">
                            <tr>
                                <th className="p-4">Time</th>
                                <th className="p-4">Fingerprint</th>
                                <th className="p-4">Message</th>
                                <th className="p-4">AI Response</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {chats.map((chat) => (
                                <tr key={chat.id} className="hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap font-mono text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} />
                                            {chat.createdAt?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            <Monitor size={12} />
                                            {chat.ip}
                                        </div>
                                        <div className="text-slate-600 text-[10px] mt-1 truncate max-w-[150px]" title={chat.userAgent}>
                                            {chat.userAgent}
                                        </div>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <div className="flex gap-2">
                                            <Terminal size={14} className="mt-1 flex-shrink-0 text-slate-500" />
                                            <span className="text-white">{chat.message}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <div className="flex gap-2">
                                            <MessageSquare size={14} className="mt-1 flex-shrink-0 text-cyan-500" />
                                            <span className="text-slate-300">{chat.response}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {chats.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 font-mono">
                                        No interactions recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
