// ============================================================================
// 📁 Hardware Source: src/components/chat/message-bubble.tsx
// 🧠 Logic: Renders Markdown and styles **bold** text with Brand Color.
// ============================================================================

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
}

export const MessageBubble = ({ content, isUser }: MessageBubbleProps) => {
  return (
    <div className={`text-sm leading-relaxed overflow-hidden ${isUser ? 'text-white' : 'text-slate-300'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 1. تغییر استایل Bold (**text**)
          strong: ({ node, ...props }) => (
            <span 
              className={`font-bold ${isUser ? 'text-white underline decoration-white/30' : 'text-emerald-400'}`} 
              {...props} 
            />
          ),
          // 2. تغییر استایل لیست‌ها
          ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
          // 3. تغییر استایل لینک‌ها
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          // 4. پاراگراف‌ها
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};