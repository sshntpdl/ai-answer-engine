// src/app/api/history/route.ts
import { searchRepository } from '@/lib/db/search.repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const history = await searchRepository.findHistory(30);
    return Response.json(history);
  } catch {
    return Response.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// src/app/api/history/[id]/route.ts
// (handled separately below)
