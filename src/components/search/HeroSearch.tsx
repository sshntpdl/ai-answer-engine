'use client';
// src/components/search/HeroSearch.tsx

import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/store/search.store';
import { useSearch } from '@/hooks/useSearch';
import { SearchBar } from './SearchBar';
import { Sparkles, Zap, Globe } from 'lucide-react';

const FEATURES = [
  { icon: Globe, label: 'Real-time web search' },
  { icon: Zap, label: 'Instant AI answers' },
  { icon: Sparkles, label: 'Follow-up questions' },
];

export function HeroSearch() {
  const { search, isLoading } = useSearch();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-zinc-900" />
          </div>
          <h1 className="text-4xl font-black text-zinc-100 tracking-tight">Lumina</h1>
        </div>

        <p className="text-zinc-500 text-lg">
          Ask anything. Get instant, accurate answers from across the web.
        </p>

        {/* Search */}
        <SearchBar
          onSearch={search}
          isLoading={isLoading}
          size="large"
          placeholder="Ask anything..."
        />

        {/* Feature tags */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-zinc-600"
            >
              <Icon className="w-3.5 h-3.5 text-zinc-700" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
