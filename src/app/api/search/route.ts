// src/app/api/search/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { tavilySearch } from '@/lib/tools/web-search.tool';
import { streamAnswer } from '@/lib/agents/answer.agent';
import { searchRepository } from '@/lib/db/search.repository';

const SearchSchema = z.object({
  query: z.string().min(1).max(500).trim(),
});

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = SearchSchema.parse(body);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (chunk: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        };

        try {
          // Step 1: Fetch sources
          send({ type: 'status', message: 'Searching the web...' });
          const sources = await tavilySearch(query);
          send({ type: 'sources', sources });

          // Step 2: Stream the answer
          send({ type: 'status', message: 'Generating answer...' });
          let fullAnswer = '';

          for await (const token of streamAnswer(query, sources)) {
            fullAnswer += token;
            send({ type: 'token', content: token });
          }

          // Step 3: Generate follow-ups
          send({ type: 'status', message: 'Generating follow-ups...' });
          const { ChatGroq } = await import('@langchain/groq');
          const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

          const llm = new ChatGroq({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            apiKey: process.env.GROQ_API_KEY,
          });

          const fuResponse = await llm.invoke([
            new SystemMessage('Generate exactly 4 concise follow-up questions as a JSON array. Return ONLY the JSON array.'),
            new HumanMessage(`Question: "${query}"\nAnswer: ${fullAnswer.slice(0, 600)}`),
          ]);

          let followUps: string[] = [];
          try {
            const text = (fuResponse.content as string).replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(text);
            followUps = Array.isArray(parsed) ? parsed.slice(0, 4) : [];
          } catch { /* ignore parse errors */ }

          send({ type: 'followups', followUps });

          // Step 4: Persist to DB
          const saved = await searchRepository.create(query, fullAnswer, sources);
          send({ type: 'done', searchId: saved.id });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          send({ type: 'error', error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid query' }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
