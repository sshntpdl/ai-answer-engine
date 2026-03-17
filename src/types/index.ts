export interface Source {
  url: string;
  title: string;
  snippet: string;
  favicon?: string | null;
}

export interface SearchResult {
  id: string;
  query: string;
  answer: string;
  sources: Source[];
  followUps?: string[];
  createdAt: string;
}

export interface FollowUpResult {
  id: string;
  question: string;
  answer: string;
  searchId: string;
  createdAt: string;
}

export interface StreamChunk {
  type: "answer" | "sources" | "followups" | "done" | "error";
  content?: string;
  sources?: Source[];
  followUps?: string[];
  error?: string;
  searchId?: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  result: SearchResult | null;
  followUpResults: FollowUpResult[];
  error: string | null;
}

type StatusEvent = {
  type: "status";
  message: string;
};

type SourcesEvent = {
  type: "sources";
  sources: Source[]; // reuse your existing type
};

type TokenEvent = {
  type: "token";
  content: string;
};

type FollowUpsEvent = {
  type: "followups";
  followUps: string[];
};

type DoneEvent = {
  type: "done";
  searchId: string;
};

type ErrorEvent = {
  type: "error";
  error: string;
};

export type SearchStreamEvent =
  | StatusEvent
  | SourcesEvent
  | TokenEvent
  | FollowUpsEvent
  | DoneEvent
  | ErrorEvent;
