// src/store/search.store.ts
import { create } from 'zustand';
import type { SearchResult, FollowUpResult, Source } from '@/types';

interface SearchStore {
  // State
  query: string;
  isLoading: boolean;
  isStreaming: boolean;
  streamedAnswer: string;
  sources: Source[];
  followUps: string[];
  currentSearch: SearchResult | null;
  followUpResults: FollowUpResult[];
  status: string;
  error: string | null;
  searchId: string | null;

  // Actions
  setQuery: (q: string) => void;
  startSearch: (query: string) => void;
  appendToken: (token: string) => void;
  setSources: (sources: Source[]) => void;
  setFollowUps: (followUps: string[]) => void;
  setStatus: (status: string) => void;
  finishSearch: (searchId: string) => void;
  addFollowUpResult: (result: FollowUpResult) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  query: '',
  isLoading: false,
  isStreaming: false,
  streamedAnswer: '',
  sources: [],
  followUps: [],
  currentSearch: null,
  followUpResults: [],
  status: '',
  error: null,
  searchId: null,
};

export const useSearchStore = create<SearchStore>((set) => ({
  ...initialState,

  setQuery: (query) => set({ query }),

  startSearch: (query) =>
    set({ ...initialState, query, isLoading: true, isStreaming: true }),

  appendToken: (token) =>
    set((state) => ({ streamedAnswer: state.streamedAnswer + token })),

  setSources: (sources) => set({ sources }),

  setFollowUps: (followUps) => set({ followUps }),

  setStatus: (status) => set({ status }),

  finishSearch: (searchId) =>
    set((state) => ({
      isLoading: false,
      isStreaming: false,
      searchId,
      currentSearch: {
        id: searchId,
        query: state.query,
        answer: state.streamedAnswer,
        sources: state.sources,
        followUps: state.followUps,
        createdAt: new Date().toISOString(),
      },
    })),

  addFollowUpResult: (result) =>
    set((state) => ({ followUpResults: [...state.followUpResults, result] })),

  setError: (error) =>
    set({ error, isLoading: false, isStreaming: false }),

  reset: () => set(initialState),
}));
