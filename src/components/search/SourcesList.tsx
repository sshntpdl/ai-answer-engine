'use client';
// src/components/search/SourcesList.tsx

import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { SourceCard } from './SourceCard';
import { cn } from '@/lib/utils';
import type { Source } from '@/types';

interface SourcesListProps {
  sources: Source[];
  isLoading?: boolean;
}

const SKELETON_COUNT = 4;

export function SourcesList({ sources, isLoading }: SourcesListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sources : sources.slice(0, 4);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Sources
        </h2>
        {sources.length > 0 && (
          <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
            {sources.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SourceSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {visible.map((source, i) => (
              <SourceCard key={source.url} source={source} index={i} />
            ))}
          </div>

          {sources.length > 4 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronDown
                className={cn('w-3.5 h-3.5 transition-transform', showAll && 'rotate-180')}
              />
              {showAll ? 'Show fewer' : `Show ${sources.length - 4} more`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

function SourceSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-zinc-700" />
        <div className="h-3 bg-zinc-700 rounded w-16" />
      </div>
      <div className="h-3 bg-zinc-700 rounded w-full" />
      <div className="h-3 bg-zinc-700 rounded w-3/4" />
      <div className="h-2 bg-zinc-800 rounded w-1/2 mt-1" />
    </div>
  );
}
