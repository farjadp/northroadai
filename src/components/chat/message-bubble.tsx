// ============================================================================
// 📁 Hardware Source: src/components/chat/message-bubble.tsx
// 🧠 Logic: Renders Markdown safely (TypeScript friendly).
// ============================================================================

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
}

export const MessageBubble = ({ content, isUser }: MessageBubbleProps) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-emerald-400">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // حذف 'node' از ورودی‌ها برای جلوگیری از ارور تایپ‌اسکریپت
          strong: ({ ...props }) => (
            <span 
              className="font-bold text-emerald-400" 
              {...props} 
            />
          ),
          ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
          a: ({ ...props }) => (
            <a 
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};