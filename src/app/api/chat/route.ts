// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { answerFollowUp } from '@/lib/agents/answer.agent';
import { searchRepository } from '@/lib/db/search.repository';

const ChatSchema = z.object({
  searchId: z.string().cuid(),
  question: z.string().min(1).max(500).trim(),
});

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchId, question } = ChatSchema.parse(body);

    const search = await searchRepository.findById(searchId);
    if (!search) {
      return Response.json({ error: 'Search not found' }, { status: 404 });
    }

    const answer = await answerFollowUp(search.query, search.answer, question);
    const followUp = await searchRepository.addFollowUp(searchId, question, answer);

    return Response.json(followUp);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
