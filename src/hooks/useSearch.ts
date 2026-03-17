// src/hooks/useSearch.ts
import { useCallback } from 'react';
import { useSearchStore } from '@/store/search.store';

export function useSearch() {
  const store = useSearchStore();

  const search = useCallback(async (query: string) => {
    store.startSearch(query);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Search request failed');
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            handleEvent(event, store);
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      store.setError(message);
    }
  }, [store]);

  const askFollowUp = useCallback(async (question: string) => {
    if (!store.searchId) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchId: store.searchId, question }),
      });

      if (!res.ok) throw new Error('Follow-up request failed');
      const result = await res.json();
      store.addFollowUpResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Follow-up failed';
      store.setError(message);
    }
  }, [store]);

  return { search, askFollowUp, ...store };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleEvent(event: any, store: ReturnType<typeof useSearchStore.getState>) {
  switch (event.type) {
    case 'status':
      store.setStatus(event.message);
      break;
    case 'sources':
      store.setSources(event.sources);
      break;
    case 'token':
      store.appendToken(event.content);
      break;
    case 'followups':
      store.setFollowUps(event.followUps);
      break;
    case 'done':
      store.finishSearch(event.searchId);
      break;
    case 'error':
      store.setError(event.error);
      break;
  }
}
