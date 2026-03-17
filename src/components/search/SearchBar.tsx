"use client";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Search, ArrowRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
}

const SUGGESTIONS = [
  "How does quantum computing work?",
  "Latest advances in AI research",
  "Best practices for React performance",
  "Climate change solutions 2024",
  "How to learn machine learning?",
];

export function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Ask anything...",
  className,
  size = "default",
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") setValue("");
  };

  const handleSuggestion = (s: string) => {
    setValue(s);
    onSearch(s);
  };

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {/* Search Input */}
      <div
        className={cn(
          "relative flex items-center rounded-2xl border transition-all duration-300",
          "bg-zinc-900/80 backdrop-blur-sm",
          focused
            ? "border-amber-500/60 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
            : "border-zinc-700/60 hover:border-zinc-600",
          size === "large" ? "px-5 py-4" : "px-4 py-3",
        )}
      >
        {isLoading ? (
          <Loader2 className="shrink-0 w-5 h-5 text-amber-500 animate-spin" />
        ) : (
          <Search className="shrink-0 w-5 h-5 text-zinc-500" />
        )}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-500",
            "mx-3 disabled:opacity-50",
            size === "large" ? "text-lg" : "text-base",
          )}
        />

        {value && !isLoading && (
          <button
            onClick={() => setValue("")}
            className="shrink-0 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className={cn(
            "shrink-0 ml-2 p-2 rounded-xl transition-all duration-200",
            "bg-amber-500 hover:bg-amber-400 active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-500",
          )}
        >
          <ArrowRight className="w-4 h-4 text-zinc-900" />
        </button>
      </div>

      {/* Suggestions (shown when empty and focused) */}
      {focused && !value && (
        <div className="mt-2 p-2 rounded-xl bg-zinc-900/90 border border-zinc-700/50 backdrop-blur-sm">
          <p className="text-xs text-zinc-500 px-2 pb-1 font-medium uppercase tracking-wider">
            Try asking
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onMouseDown={() => handleSuggestion(s)}
              className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
