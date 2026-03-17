'use client';
// src/components/search/SourceCard.tsx

import { ExternalLink } from 'lucide-react';
import { cn, truncate } from '@/lib/utils';
import type { Source } from '@/types';

interface SourceCardProps {
  source: Source;
  index: number;
  className?: string;
}

export function SourceCard({ source, index, className }: SourceCardProps) {
  const hostname = (() => {
    try { return new URL(source.url).hostname.replace('www.', ''); }
    catch { return source.url; }
  })();

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col gap-2 p-3 rounded-xl border border-zinc-800',
        'bg-zinc-900/50 hover:bg-zinc-800/70 hover:border-zinc-700',
        'transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {source.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={source.favicon}
              alt=""
              className="w-4 h-4 rounded shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-4 h-4 rounded bg-zinc-700 shrink-0 flex items-center justify-center">
              <span className="text-[8px] text-zinc-400 font-bold">
                {hostname[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-zinc-500 truncate">{hostname}</span>
        </div>
        <span className="shrink-0 text-xs text-zinc-600 font-mono">[{index + 1}]</span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 line-clamp-2 leading-snug transition-colors">
        {source.title}
      </p>

      {/* Snippet */}
      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
        {truncate(source.snippet, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-zinc-600 group-hover:text-amber-500/70 transition-colors mt-auto">
        <ExternalLink className="w-3 h-3" />
        <span>View source</span>
      </div>
    </a>
  );
}
