import { useState, useEffect, useCallback } from "react";
import type { HistoryItem } from "@/types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, fetchHistory, deleteItem };
}
