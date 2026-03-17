import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Source } from "@/types";

interface TavilyResult {
  url: string;
  title: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilyResult[];
  answer?: string;
}

async function tavilySearch(query: string, maxResults = 6): Promise<Source[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!res.ok) throw new Error(`Tavily search failed: ${res.statusText}`);

  const data: TavilyResponse = await res.json();

  return data.results.map((r) => ({
    url: r.url,
    title: r.title,
    snippet: r.content.slice(0, 300),
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(r.url).hostname}&sz=32`,
  }));
}

export const webSearchTool = tool(
  async ({ query }: { query: string }) => {
    const sources = await tavilySearch(query);
    return JSON.stringify(sources);
  },
  {
    name: "web_search",
    description:
      "Search the web for current information about a topic. Returns a list of sources with titles, URLs, and snippets.",
    schema: z.object({
      query: z.string().describe("The search query to look up"),
    }),
  },
);

export { tavilySearch };
