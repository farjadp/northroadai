// ============================================================================
// 📁 Hardware Source: src/app/dashboard/chat/page.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v3.1 (Tactical Chat Persistence + UI Fixes)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Integrates History System (Firestore).
// - Manages Sessions (Create, Load, Delete).
// - URL Routing for Sessions.
// - Fixed Agent Icon Rendering Bug.
// ============================================================================

"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  RefreshCw,
  Paperclip,
  FileText,
  X,
  Lock,
  History,
  Compass // Fallback icon
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStartupDNA, StartupProfile } from "@/lib/api/startup";
import { AGENTS, Agent, getAgentById } from "@/lib/agents";
import { UserService } from "@/lib/user-service";
import { HistoryService, ChatSession } from "@/lib/api/history";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

type Attachment = {
  uri: string;
  mime: string;
  name: string;
};

function PiraChatContent() {
  const { user, unlockedAgents, refreshUnlockedAgents } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session");
  const agentParam = searchParams.get("agent");

  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(true);
  
  // Default to Navigator or URL param
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  
  const [agentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [agentToUnlock, setAgentToUnlock] = useState<Agent | null>(null);
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startupContext, setStartupContext] = useState<StartupProfile | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load & URL Parsing
  useEffect(() => {
    if (agentParam) {
      const agent = getAgentById(agentParam);
      if (agent) setSelectedAgent(agent);
    }
  }, [agentParam]);

  // 2. Load Startup DNA
  useEffect(() => {
    if (user?.uid) {
      getStartupDNA(user.uid).then((data) => {
        if (data) setStartupContext(data);
      });
    }
  }, [user]);

  // 3. Load Sessions List
  useEffect(() => {
    if (user?.uid) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user?.uid) return;
    const userSessions = await HistoryService.getUserSessions(user.uid);
    setSessions(userSessions);
  };

  // 4. Handle Session Change via URL
  useEffect(() => {
    if (user?.uid && urlSessionId) {
      loadSessionMessages(urlSessionId);
    } else if (!urlSessionId) {
      setCurrentSessionId(null);
      setMessages([]); // Clear chat for new session
    }
  }, [urlSessionId, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessionMessages = async (sessionId: string) => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const history = await HistoryService.getSessionMessages(user.uid, sessionId);
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        const agent = getAgentById(session.agentId);
        if (agent) setSelectedAgent(agent);
      }

      setMessages(history.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt
      })));
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push("/dashboard/chat");
    setMessages([]);
    setCurrentSessionId(null);
    setAgentSidebarOpen(true);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    if (confirm("Are you sure you want to delete this operation log?")) {
      await HistoryService.deleteSession(user.uid, sessionId);
      await loadSessions();
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    }
  };

  const handleAgentSwitch = (agent: Agent) => {
    const hasAccess = unlockedAgents.includes(agent.id) || !agent.isPremium;
    
    if (!hasAccess) {
      setAgentToUnlock(agent);
      setUnlockModalOpen(true);
      return;
    }
    
    setSelectedAgent(agent);
    
    // Only show greeting if starting fresh
    if (!currentSessionId) {
      // Optional: Add a local welcome message
    }
    setAgentSidebarOpen(false);
  };

  const handleUnlock = async () => {
    if (!agentToUnlock || !user) return;
    try {
      await UserService.unlockAgent(user.uid, agentToUnlock.id);
      await refreshUnlockedAgents(); // Update context
      setUnlockModalOpen(false);
      setSelectedAgent(agentToUnlock);
      setAgentToUnlock(null);
    } catch (error) {
      console.error("Unlock failed:", error);
      alert("Failed to unlock agent.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 4 * 1024 * 1024) {
      alert("File is too large. Max 4MB.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.fileUri) {
        setAttachment({ uri: data.fileUri, mime: data.mimeType, name: file.name });
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;
    if (isLoading || isUploading || !user?.uid) return;

    const displayContent = input + (attachment ? `\n\n📎 [Attached: ${attachment.name}]` : "");
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayContent,
      timestamp: new Date()
    };

    // Optimistic UI Update
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Prepare File Data
    const fileToSend = attachment ? { fileUri: attachment.uri, mimeType: attachment.mime } : null;
    setAttachment(null);

    let activeSessionId = currentSessionId;

    try {
      // 1. Create Session if needed
      if (!activeSessionId) {
        activeSessionId = await HistoryService.createNewSession(user.uid, selectedAgent.id, userMsg.content);
        setCurrentSessionId(activeSessionId);
        // Shallow routing update without refresh
        window.history.replaceState(null, "", `/dashboard/chat?session=${activeSessionId}`);
        loadSessions(); // Refresh sidebar
      }

      // 2. Save User Message
      await HistoryService.addMessageToSession(user.uid, activeSessionId, "user", userMsg.content, fileToSend ? [fileToSend] : []);

      // 3. Call AI API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          startupContext: startupContext,
          fileData: fileToSend,
          agentId: selectedAgent.id,
          userId: user.uid,
          history: messages //
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.reply,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiMsg]);
        // 4. Save AI Message
        await HistoryService.addMessageToSession(user.uid, activeSessionId, "ai", data.reply);
        loadSessions(); // Refresh sidebar timestamp
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        role: "ai",
        content: "⚠️ Connection interrupted. Please check your connection.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Safe Icon Rendering
  const SelectedAgentIcon = selectedAgent?.icon || Compass;

  return (
    <div className="flex h-[calc(100vh-140px)] max-w-7xl mx-auto relative gap-4">
      
      {/* --- HISTORY SIDEBAR --- */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => router.push(`/dashboard/chat?session=${id}`)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={historySidebarOpen}
        onClose={() => setHistorySidebarOpen(false)}
      />

      {/* --- AGENT SELECTOR SIDEBAR (RIGHT) --- */}
      <AnimatePresence>
        {agentSidebarOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 z-30 w-72 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">TACTICAL DEPLOYMENT</h3>
              <button onClick={() => setAgentSidebarOpen(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            {AGENTS.map(agent => {
              const isActive = selectedAgent.id === agent.id;
              const hasAccess = unlockedAgents.includes(agent.id) || !agent.isPremium;
              const isLocked = !hasAccess;
              const AgentIcon = agent.icon; // Correct component rendering

              return (
                <motion.button
                  key={agent.id}
                  onClick={() => handleAgentSwitch(agent)}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  className={`relative p-3 rounded-xl text-left transition-all group ${
                    isActive
                      ? `bg-${agent.themeColor}-900/20 border border-${agent.themeColor}-500/50`
                      : isLocked
                        ? "bg-white/5 border border-transparent opacity-60 cursor-not-allowed"
                        : "bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${agent.colorClass} p-1.5 rounded-lg bg-white/5`}>
                        <AgentIcon size={20} />
                    </div>
                    {isLocked && <Lock size={14} className="text-slate-500" />}
                  </div>
                  <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{agent.name}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{agent.description}</p>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a]">
        
        {/* Toggle History Button */}
        <div className="absolute top-3 left-3 z-10">
          {!historySidebarOpen && (
            <button
              onClick={() => setHistorySidebarOpen(true)}
              className="p-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg hover:border-white/20 transition-colors"
            >
              <History size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-3 bg-white/[0.02] border-b border-white/5">
          <div
            className="flex items-center gap-3 cursor-pointer group pl-8"
            onClick={() => setAgentSidebarOpen(true)}
          >
            <div className={`p-1.5 rounded-lg bg-white/5 ${selectedAgent.colorClass} group-hover:bg-white/10 transition-colors`}>
                <SelectedAgentIcon size={20} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">{selectedAgent.name.toUpperCase()}</span>
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 group-hover:text-white transition-colors">SWITCH</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${startupContext ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></div>
                    <span className="text-[10px] font-mono text-slate-500">
                        {startupContext ? `CONTEXT: ${startupContext.name}` : "LOADING CONTEXT..."}
                    </span>
                </div>
            </div>
          </div>
          
          <button onClick={() => setMessages([])} className="text-slate-600 hover:text-white transition p-2 hover:bg-white/5 rounded-lg">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.length === 0 && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                 <SelectedAgentIcon size={48} className={selectedAgent.colorClass} />
                 <p className="text-sm text-slate-500 font-mono">ENCRYPTED CHANNEL OPEN</p>
             </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-3xl mx-auto w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.role === "ai" 
                    ? `bg-slate-900 border-slate-800 ${selectedAgent.colorClass}` 
                    : "bg-white/10 border-white/10 text-white"
                  }`}>
                  {msg.role === "ai" ? <Bot size={16} /> : <UserIcon size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`relative max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "ai"
                    ? "bg-[#0f0f0f] border border-white/10 text-slate-300"
                    : "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg"
                  }`}>
                  {msg.content}
                  <div className={`text-[9px] font-mono mt-2 opacity-50 ${msg.role === "user" ? "text-emerald-100" : "text-slate-600"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl mx-auto w-full">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Loader2 size={16} className={`${selectedAgent.colorClass} animate-spin`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-500 mt-2">
                <span>PROCESSING</span>
                <span className="animate-pulse">...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
                {attachment && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 mb-2 p-2 bg-emerald-900/20 border border-emerald-500/30 rounded-lg w-fit"
                >
                    <FileText size={14} className="text-emerald-400" />
                    <span className="text-xs text-emerald-200 truncate max-w-[200px] font-mono">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} className="hover:text-red-400 transition-colors ml-2">
                    <X size={14} />
                    </button>
                </motion.div>
                )}
            </AnimatePresence>

            <div className="relative flex items-end bg-[#0f0f0f] border border-white/10 rounded-xl p-2 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
                <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf,text/plain,text/csv"
                onChange={handleFileSelect}
                />

                <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                className="p-3 text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                title="Attach Intel (PDF/CSV)"
                >
                {isUploading ? <Loader2 size={18} className="animate-spin text-emerald-500" /> : <Paperclip size={18} />}
                </button>

                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={attachment ? "Brief me on this file..." : `Direct uplink to ${selectedAgent.name}...`}
                className="w-full bg-transparent text-white placeholder:text-slate-600 text-sm px-2 py-3 outline-none resize-none h-12 max-h-32 scrollbar-thin"
                rows={1}
                />

                <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachment) || isLoading || isUploading}
                className="p-3 bg-white text-black rounded-lg hover:bg-emerald-400 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                >
                <Send size={18} />
                </button>
            </div>

            <div className="text-center mt-2 flex justify-between px-2 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-slate-600 font-mono">
                SECURE LINE // ENCRYPTED
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                AI may hallucinate. Verify critical intel.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- UNLOCK MODAL --- */}
      <AnimatePresence>
        {unlockModalOpen && agentToUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setUnlockModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${agentToUnlock.themeColor}-500/20 blur-[50px] rounded-full pointer-events-none`}></div>

              <div className="text-center mb-8 relative z-10">
                <div className={`mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4 ${agentToUnlock.colorClass}`}>
                    {/* Render Icon Component */}
                    {React.createElement(agentToUnlock.icon, { size: 40 })}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{agentToUnlock.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{agentToUnlock.description}</p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-6 relative z-10">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">CLEARANCE COST</p>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">LIFETIME ACCESS</span>
                </div>
                <p className="text-4xl font-bold text-white">$9</p>
              </div>

              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setUnlockModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors text-sm font-bold tracking-wide"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUnlock}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all text-sm font-bold tracking-wide shadow-lg shadow-emerald-900/20"
                >
                  AUTHORIZE UNLOCK
                </button>
              </div>

              <p className="text-[10px] text-slate-600 text-center mt-6 font-mono">
                // Mock Transaction Protocol Initiated
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrap in Suspense to handle useSearchParams safely
export default function PiraChat() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>}>
      <PiraChatContent />
    </Suspense>
  );
}