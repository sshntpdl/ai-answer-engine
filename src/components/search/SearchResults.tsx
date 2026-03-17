"use client";
import { useSearch } from "@/hooks/useSearch";
import { SearchBar } from "./SearchBar";
import { SourcesList } from "./SourcesList";
import { AnswerPanel } from "./AnswerPanel";
import { FollowUpSection } from "./FollowUpSection";
import { StatusBar } from "./StatusBar";

export function SearchResults() {
  const {
    query,
    isLoading,
    isStreaming,
    streamedAnswer,
    sources,
    followUps,
    followUpResults,
    status,
    error,
    search,
    askFollowUp,
  } = useSearch();

  return (
    <div className="flex flex-col h-full">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-20 px-6 py-4 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          <SearchBar onSearch={search} isLoading={isLoading} />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {/* Query heading */}
          {query && (
            <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
              {query}
            </h1>
          )}

          {/* Status */}
          {isLoading && <StatusBar status={status} />}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Sources */}
          {(sources.length > 0 || (isLoading && !streamedAnswer)) && (
            <SourcesList
              sources={sources}
              isLoading={isLoading && sources.length === 0}
            />
          )}

          {/* Answer */}
          {(streamedAnswer || (isLoading && sources.length > 0)) && (
            <AnswerPanel
              answer={streamedAnswer}
              isStreaming={isStreaming}
              status={status}
            />
          )}

          {/* Follow-ups */}
          {!isStreaming &&
            (followUps.length > 0 || followUpResults.length > 0) && (
              <FollowUpSection
                suggestions={followUps}
                results={followUpResults}
                onAsk={askFollowUp}
              />
            )}
        </div>
      </div>
    </div>
  );
}
