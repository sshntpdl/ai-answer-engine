// src/app/page.tsx
'use client';

import { useSearchStore } from '@/store/search.store';
import { HeroSearch } from '@/components/search/HeroSearch';
import { SearchResults } from '@/components/search/SearchResults';

export default function HomePage() {
  const { query, streamedAnswer, sources, isLoading } = useSearchStore();

  const hasResults = !!(query && (isLoading || streamedAnswer || sources.length));

  if (hasResults) return <SearchResults />;
  return <HeroSearch />;
}
