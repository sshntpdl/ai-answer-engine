'use client';
// src/components/search/FollowUpSection.tsx

import { useState } from 'react';
import { ChevronRight, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { AnswerPanel } from './AnswerPanel';
import { cn } from '@/lib/utils';
import type { FollowUpResult } from '@/types';

interface FollowUpSectionProps {
  suggestions: string[];
  results: FollowUpResult[];
  onAsk: (question: string) => Promise<void>;
  isLoading?: boolean;
}

export function FollowUpSection({
  suggestions,
  results,
  onAsk,
  isLoading,
}: FollowUpSectionProps) {
  const [asking, setAsking] = useState<string | null>(null);

  const handleAsk = async (question: string) => {
    if (isLoading || asking) return;
    setAsking(question);
    await onAsk(question);
    setAsking(null);
  };

  if (!suggestions.length && !results.length) return null;

  return (
    <section className="space-y-4">
      {/* Previous follow-up answers */}
      {results.map((r) => (
        <FollowUpAnswer key={r.id} result={r} />
      ))}

      {/* Suggested questions */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Related Questions
            </h2>
          </div>

          <div className="space-y-2">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={!!asking || isLoading}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3',
                  'rounded-xl border border-zinc-800 bg-zinc-900/40',
                  'text-left text-sm text-zinc-300 hover:text-zinc-100',
                  'hover:bg-zinc-800/60 hover:border-zinc-700',
                  'transition-all duration-200 group',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <span>{q}</span>
                {asking === q ? (
                  <Loader2 className="shrink-0 w-4 h-4 text-amber-500 animate-spin" />
                ) : (
                  <ChevronRight className="shrink-0 w-4 h-4 text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function FollowUpAnswer({ result }: { result: FollowUpResult }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
      >
        <span className="text-sm font-medium text-zinc-200">{result.question}</span>
        {expanded ? (
          <ChevronUp className="shrink-0 w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="shrink-0 w-4 h-4 text-zinc-500" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-800">
          <AnswerPanel answer={result.answer} />
        </div>
      )}
    </div>
  );
}
