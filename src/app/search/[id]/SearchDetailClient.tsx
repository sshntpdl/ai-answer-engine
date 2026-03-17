'use client';
// src/app/search/[id]/SearchDetailClient.tsx

import { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SourcesList } from '@/components/search/SourcesList';
import { AnswerPanel } from '@/components/search/AnswerPanel';
import { FollowUpSection } from '@/components/search/FollowUpSection';
import type { SearchResult, FollowUpResult } from '@/types';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';

interface Props {
  search: SearchResult;
  savedFollowUps: FollowUpResult[];
}

export function SearchDetailClient({ search, savedFollowUps }: Props) {
  const [followUpResults, setFollowUpResults] = useState<FollowUpResult[]>(savedFollowUps);
  const { search: newSearch, isLoading } = useSearch();

  const handleFollowUp = async (question: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchId: search.id, question }),
    });
    if (res.ok) {
      const data = await res.json();
      setFollowUpResults((prev) => [...prev, data]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-20 px-6 py-4 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          <SearchBar onSearch={newSearch} isLoading={isLoading} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">{search.query}</h1>

          <SourcesList sources={search.sources} />
          <AnswerPanel answer={search.answer} />

          {(search.followUps?.length > 0 || followUpResults.length > 0) && (
            <FollowUpSection
              suggestions={search.followUps ?? []}
              results={followUpResults}
              onAsk={handleFollowUp}
            />
          )}
        </div>
      </div>
    </div>
  );
}
