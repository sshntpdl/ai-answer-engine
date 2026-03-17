"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { formatDate, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { history, isLoading, deleteItem } = useHistory();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-zinc-800 bg-zinc-950",
        "transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-14" : "w-64",
      )}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-zinc-400" />
        )}
      </button>

      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-5 border-b border-zinc-800",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <Search className="w-4 h-4 text-zinc-900" />
        </div>
        {!collapsed && (
          <span className="font-bold text-zinc-100 text-lg tracking-tight">
            Lumina
          </span>
        )}
      </div>

      {/* New Search */}
      <div
        className={cn(
          "px-3 py-3 border-b border-zinc-800/50",
          collapsed && "px-2",
        )}
      >
        <button
          onClick={() => router.push("/")}
          className={cn(
            "flex items-center gap-2 w-full rounded-xl px-3 py-2.5",
            "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40",
            "text-amber-400 hover:text-amber-300 text-sm font-medium",
            "transition-all duration-200",
            collapsed && "justify-center px-0",
          )}
        >
          <Search className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Search</span>}
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
              History
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-1 px-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-zinc-900 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          !collapsed && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-zinc-600">No searches yet</p>
            </div>
          )
        ) : (
          <div className="space-y-0.5 px-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                onClick={() => router.push(`/search/${item.id}`)}
              >
                {collapsed ? (
                  <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-400 truncate leading-snug">
                        {truncate(item.query, 35)}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-zinc-600 transition-all rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
