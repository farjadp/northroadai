// ============================================================================
// 📁 Hardware Source: src/components/chat/chat-sidebar.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Displays chat history grouped by time periods.
// - New Chat button
// - Grouped sessions (Today, Yesterday, Previous 7 Days, Older)
// - Delete session capability
// ============================================================================

"use client";
import React from "react";
import { Plus, MessageSquare, Trash2, ChevronLeft } from "lucide-react";
import { ChatSession } from "@/lib/api/history";
import { format, isToday, isYesterday, subDays, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    isOpen,
    onClose
}: ChatSidebarProps) {

    // Group sessions by date
    const groupedSessions = sessions.reduce((groups, session) => {
        const date = session.updatedAt;
        let key = "Older";

        if (isToday(date)) {
            key = "Today";
        } else if (isYesterday(date)) {
            key = "Yesterday";
        } else if (isAfter(date, subDays(new Date(), 7))) {
            key = "Previous 7 Days";
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(session);
        return groups;
    }, {} as Record<string, ChatSession[]>);

    const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Older"];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    className="w-72 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 h-full"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">HISTORY</h3>
                        <button onClick={onClose} className="text-slate-600 hover:text-white">
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <button
                        onClick={onNewChat}
                        className="flex items-center gap-2 w-full p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-900/40 transition-all font-bold text-sm"
                    >
                        <Plus size={16} />
                        <span>NEW OPERATION</span>
                    </button>

                    {/* Session List */}
                    <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                        {groupOrder.map(group => {
                            const groupSessions = groupedSessions[group];
                            if (!groupSessions || groupSessions.length === 0) return null;

                            return (
                                <div key={group}>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 px-2">{group}</h4>
                                    <div className="space-y-1">
                                        {groupSessions.map(session => (
                                            <div
                                                key={session.id}
                                                onClick={() => onSelectSession(session.id)}
                                                className={`group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${currentSessionId === session.id
                                                        ? "bg-slate-800 text-white shadow-lg"
                                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                                    }`}
                                            >
                                                <MessageSquare size={14} className="shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{session.title}</p>
                                                    <p className="text-[10px] opacity-50 truncate">{session.preview}</p>
                                                </div>

                                                {/* Delete Button (Visible on Hover) */}
                                                <button
                                                    onClick={(e) => onDeleteSession(session.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {sessions.length === 0 && (
                            <div className="text-center text-slate-600 text-xs py-10">
                                No operations found.
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
