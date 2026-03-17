import { ChatGroq } from "@langchain/groq";
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tavilySearch } from "@/lib/tools/web-search.tool";
import type { Source, StreamChunk } from "@/types";

// ── State ────────────────────────────────────────────────────────────────────
const AgentState = Annotation.Root({
  query: Annotation<string>(),
  sources: Annotation<Source[]>({ default: () => [], reducer: (_, b) => b }),
  answer: Annotation<string>({ default: () => "", reducer: (_, b) => b }),
  followUps: Annotation<string[]>({ default: () => [], reducer: (_, b) => b }),
});

type State = typeof AgentState.State;

// ── LLM ──────────────────────────────────────────────────────────────────────
function createLLM(streaming = false) {
  return new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    streaming,
    apiKey: process.env.GROQ_API_KEY,
  });
}

// ── Nodes ────────────────────────────────────────────────────────────────────
async function fetchSources(state: State): Promise<Partial<State>> {
  const sources = await tavilySearch(state.query, 6);
  return { sources };
}

async function generateAnswer(state: State): Promise<Partial<State>> {
  const llm = createLLM(false);
  const context = state.sources
    .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet}`)
    .join("\n\n");

  const response = await llm.invoke([
    new SystemMessage(`You are an AI answer engine similar to Perplexity. 
Answer questions accurately and concisely using the provided search results.
- Synthesize information from multiple sources
- Use markdown formatting (headers, bullet points, bold) for clarity
- Cite sources inline using [1], [2], etc. notation
- If sources don't cover the topic, say so honestly
- Be direct and informative`),
    new HumanMessage(
      `Question: ${state.query}\n\nSearch Results:\n${context}\n\nProvide a comprehensive, well-structured answer.`,
    ),
  ]);

  return { answer: response.content as string };
}

async function generateFollowUps(state: State): Promise<Partial<State>> {
  const llm = createLLM(false);
  const response = await llm.invoke([
    new SystemMessage(
      "Generate exactly 4 concise follow-up questions. Return ONLY a JSON array of strings, no other text.",
    ),
    new HumanMessage(
      `Original question: "${state.query}"\nAnswer summary: ${state.answer.slice(0, 500)}`,
    ),
  ]);

  try {
    const text = (response.content as string).trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { followUps: Array.isArray(parsed) ? parsed.slice(0, 4) : [] };
  } catch {
    return { followUps: [] };
  }
}

// ── Graph ────────────────────────────────────────────────────────────────────
function buildGraph() {
  const graph = new StateGraph(AgentState)
    .addNode("fetch_sources", fetchSources)
    .addNode("generate_answer", generateAnswer)
    .addNode("generate_followups", generateFollowUps)
    .addEdge(START, "fetch_sources")
    .addEdge("fetch_sources", "generate_answer")
    .addEdge("generate_answer", "generate_followups")
    .addEdge("generate_followups", END);

  return graph.compile();
}

// ── Streaming Runner ─────────────────────────────────────────────────────────
export async function* runAnswerAgent(
  query: string,
): AsyncGenerator<StreamChunk> {
  const app = buildGraph();

  yield { type: "answer", content: "" }; // signal start

  for await (const event of await app.stream(
    { query },
    { streamMode: "values" },
  )) {
    if (event.sources?.length && !event.answer) {
      yield { type: "sources", sources: event.sources };
    }

    if (event.answer && !event.followUps?.length) {
      yield { type: "answer", content: event.answer };
    }

    if (event.followUps?.length) {
      yield { type: "followups", followUps: event.followUps };
    }
  }

  yield { type: "done" };
}

// ── Streaming Answer (word-by-word) ──────────────────────────────────────────
export async function* streamAnswer(
  query: string,
  sources: Source[],
): AsyncGenerator<string> {
  const llm = createLLM(true);
  const context = sources
    .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet}`)
    .join("\n\n");

  const stream = await llm.stream([
    new SystemMessage(`You are an AI answer engine. Answer questions accurately using provided search results.
Use markdown formatting. Cite sources with [1], [2] notation. Be comprehensive yet concise.`),
    new HumanMessage(
      `Question: ${query}\n\nSearch Results:\n${context}\n\nProvide a well-structured answer.`,
    ),
  ]);

  for await (const chunk of stream) {
    yield chunk.content as string;
  }
}

// ── Follow-up Answer ─────────────────────────────────────────────────────────
export async function answerFollowUp(
  originalQuery: string,
  originalAnswer: string,
  followUpQuestion: string,
): Promise<string> {
  const llm = createLLM(false);
  const response = await llm.invoke([
    new SystemMessage(
      "You are a helpful AI assistant. Answer follow-up questions in context of the original conversation.",
    ),
    new HumanMessage(
      `Original question: ${originalQuery}\nOriginal answer: ${originalAnswer}\n\nFollow-up: ${followUpQuestion}`,
    ),
  ]);
  return response.content as string;
}
