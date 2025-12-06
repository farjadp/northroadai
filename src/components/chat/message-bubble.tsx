// ============================================================================
// 📁 Hardware Source: src/components/chat/message-bubble.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v2.1 (Polished UI & Logic Fixes)
// ----------------------------------------------------------------------------
// ✅ Fixes:
// 1. Renders Markdown safely with GFM support.
// 2. Visualizes Confidence Score with dynamic colors.
// 3. Handles "Internal Knowledge" source distinction.
// ============================================================================

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThumbsUp, ThumbsDown, Database, FileText, Cpu, Check, ShieldCheck, BrainCircuit } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  messageId?: string;
  sources?: {
    files?: number;
    knowledge_base?: boolean;
    internal_knowledge?: boolean;
  };
  confidenceScore?: number;
  onFeedback?: (id: string, rating: 1 | -1) => void;
}

export const MessageBubble = ({ content, isUser, messageId, sources, confidenceScore = 0, onFeedback }: MessageBubbleProps) => {
  const [feedback, setFeedback] = useState<1 | -1 | null>(null);

  const handleFeedback = (rating: 1 | -1) => {
    if (feedback || !messageId || !onFeedback) return;
    setFeedback(rating);
    onFeedback(messageId, rating);
  };

  if (isUser) {
    // برای پیام کاربر، رندر ساده انجام میدیم
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // --- SOURCE IDENTITY LOGIC ---
  // پیش‌فرض: مدل هوش مصنوعی
  let sourceLabel = "AI Model";
  let SourceIcon = Cpu;
  let sourceColor = "text-slate-500";
  let progressBarColor = "bg-slate-700";

  // اولویت ۱: فایل‌ها (چون کاربر آپلود کرده مهمتر است)
  if (sources?.files && sources.files > 0) {
    sourceLabel = `Analyzed ${sources.files} File${sources.files > 1 ? 's' : ''}`;
    SourceIcon = FileText;
    sourceColor = "text-emerald-400";
    progressBarColor = "bg-emerald-500";
  } 
  // اولویت ۲: دیتابیس وکتور
  else if (sources?.knowledge_base) {
    sourceLabel = "Verified Database";
    SourceIcon = Database;
    sourceColor = "text-amber-400"; // زرد/نارنجی برای دیتابیس
    progressBarColor = "bg-amber-500";
  }
  // اولویت ۳: دانش داخلی مدل
  else if (sources?.internal_knowledge) {
    sourceLabel = "Internal Knowledge";
    SourceIcon = BrainCircuit;
    sourceColor = "text-sky-400"; // آبی برای دانش خود مدل
    progressBarColor = "bg-sky-500";
  }

  // --- CONFIDENCE LEVEL TEXT ---
  let confidenceText = "Low Confidence";
  if (confidenceScore >= 80) confidenceText = "High Confidence";
  else if (confidenceScore >= 50) confidenceText = "Medium Confidence";

  return (
    <div className="group w-full">
      {/* 1. MARKDOWN CONTENT */}
      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-emerald-400 prose-a:text-blue-400">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            strong: ({ ...props }) => <span className="font-bold text-emerald-400" {...props} />,
            a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* 2. FOOTER: METADATA & ACTIONS */}
      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/5">

        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            {/* Source Label */}
            <div className={`flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider ${sourceColor} opacity-90`}>
              <SourceIcon size={12} />
              <span>{sourceLabel}</span>
            </div>

            {/* Confidence Bar (Only if score exists) */}
            {confidenceScore > 0 && (
              <div 
                className="flex items-center gap-2 cursor-help" 
                title={`${confidenceText} (${confidenceScore}%)`}
              >
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${progressBarColor} rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                  <ShieldCheck size={10} />
                  <span>{confidenceScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Buttons */}
          <div className="flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleFeedback(1)}
              disabled={!!feedback}
              className={`p-1 rounded hover:bg-white/10 transition ${feedback === 1 ? 'text-green-400' : 'text-slate-600'}`}
              title="Helpful"
            >
              {feedback === 1 ? <Check size={14} /> : <ThumbsUp size={14} />}
            </button>
            <button
              onClick={() => handleFeedback(-1)}
              disabled={!!feedback}
              className={`p-1 rounded hover:bg-white/10 transition ${feedback === -1 ? 'text-red-400' : 'text-slate-600'}`}
              title="Not Helpful"
            >
              <ThumbsDown size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};