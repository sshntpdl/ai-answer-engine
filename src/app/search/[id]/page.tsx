// src/app/search/[id]/page.tsx
import { notFound } from 'next/navigation';
import { searchRepository } from '@/lib/db/search.repository';
import { SearchDetailClient } from './SearchDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SearchDetailPage({ params }: Props) {
  const { id } = await params;
  const search = await searchRepository.findById(id);

  if (!search) notFound();

  return (
    <SearchDetailClient
      search={{
        id: search.id,
        query: search.query,
        answer: search.answer,
        sources: search.sources,
        followUps: search.followUps.map((f) => f.question),
        createdAt: search.createdAt.toISOString(),
      }}
      savedFollowUps={search.followUps.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        searchId: f.searchId,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
