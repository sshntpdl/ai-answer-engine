'use client';
// src/components/search/AnswerPanel.tsx

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnswerPanelProps {
  answer: string;
  isStreaming?: boolean;
  status?: string;
}

export function AnswerPanel({ answer, isStreaming, status }: AnswerPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Answer
          </h2>
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-amber-500/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {status || 'Generating...'}
            </span>
          )}
        </div>

        {answer && !isStreaming && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy</>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        'rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5',
        'prose prose-invert prose-sm max-w-none',
        isStreaming && 'border-amber-500/20'
      )}>
        {answer ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-zinc-100 mt-4 mb-2 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-zinc-200 mt-4 mb-2 first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-zinc-200 mt-3 mb-1.5">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-zinc-300 leading-relaxed mb-3 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1.5 mb-3 text-zinc-300">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1.5 mb-3 text-zinc-300">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-zinc-300 leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-zinc-100">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-zinc-300">{children}</em>
              ),
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                return isBlock ? (
                  <code className="block bg-zinc-800 rounded-lg p-3 text-sm text-amber-300/80 overflow-x-auto font-mono">
                    {children}
                  </code>
                ) : (
                  <code className="inline bg-zinc-800 rounded px-1.5 py-0.5 text-xs text-amber-300/80 font-mono">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-zinc-800/50 rounded-xl overflow-x-auto mb-3 p-0">{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-amber-500/50 pl-4 text-zinc-400 italic mb-3">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-3">
                  <table className="w-full border-collapse text-sm">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-zinc-700 px-3 py-2 bg-zinc-800 text-zinc-200 font-semibold text-left">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-zinc-800 px-3 py-2 text-zinc-300">{children}</td>
              ),
            }}
          >
            {answer}
          </ReactMarkdown>
        ) : (
          <AnswerSkeleton />
        )}

        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-amber-500 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </section>
  );
}

function AnswerSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[100, 90, 75, 85, 60].map((w, i) => (
        <div key={i} className={`h-3 bg-zinc-800 rounded`} style={{ width: `${w}%` }} />
      ))}
      <div className="h-3 bg-zinc-800 rounded w-1/2" />
    </div>
  );
}
