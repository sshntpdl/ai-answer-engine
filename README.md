# Lumina — AI Answer Engine

A Perplexity-style AI answer engine built with Next.js 15, LangChain, LangGraph, Groq, and Prisma.

---

## Tech Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Framework        | Next.js 15 (App Router)               |
| Language         | TypeScript 5                          |
| Styling          | Tailwind CSS v3                       |
| AI Orchestration | LangChain + LangGraph                 |
| LLM              | Groq (llama-3.3-70b-versatile)        |
| Web Search       | Tavily API                            |
| State Management | Zustand                               |
| Database ORM     | Prisma (SQLite dev / PostgreSQL prod) |
| Streaming        | Vercel AI SDK + SSE                   |
| UI Components    | Radix UI + Lucide Icons               |

---

## Architecture

```
User Query
    │
    ▼
POST /api/search  (SSE stream)
    │
    ├─► Tavily Web Search  ──► sources[]  ──► stream { type:'sources' }
    │
    ├─► Groq LLM (streaming)  ──► token by token  ──► stream { type:'token' }
    │
    ├─► Groq LLM  ──► follow-up questions  ──► stream { type:'followups' }
    │
    └─► Prisma  ──► persist Search + Sources  ──► stream { type:'done', searchId }

Follow-up Questions
    │
    ▼
POST /api/chat
    │
    └─► answerFollowUp()  ──► Groq LLM  ──► persist FollowUp  ──► JSON response
```

### LangGraph Agent Flow

```
START
  │
  ▼
fetch_sources  (Tavily search)
  │
  ▼
generate_answer  (Groq streaming)
  │
  ▼
generate_followups  (Groq)
  │
  ▼
END
```

---

## Project Structure

```
answer-engine/
├── prisma/
│   └── schema.prisma           # DB schema: Search, Source, FollowUp
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with Sidebar
│   │   ├── page.tsx             # Home (hero or results based on state)
│   │   ├── globals.css
│   │   ├── api/
│   │   │   ├── search/route.ts  # SSE streaming search endpoint
│   │   │   ├── chat/route.ts    # Follow-up Q&A endpoint
│   │   │   └── history/
│   │   │       ├── route.ts     # GET history list
│   │   │       └── [id]/route.ts # GET/DELETE single search
│   │   └── search/
│   │       └── [id]/
│   │           ├── page.tsx     # Server component: loads from DB
│   │           └── SearchDetailClient.tsx  # Client component
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx      # Collapsible sidebar with history
│   │   └── search/
│   │       ├── SearchBar.tsx    # Input with suggestions & shortcuts
│   │       ├── SourceCard.tsx   # Individual source card
│   │       ├── SourcesList.tsx  # Grid of sources with skeleton
│   │       ├── AnswerPanel.tsx  # Markdown-rendered streaming answer
│   │       ├── FollowUpSection.tsx # Follow-up suggestions & answers
│   │       ├── StatusBar.tsx    # Loading status indicator
│   │       ├── SearchResults.tsx # Full results layout
│   │       └── HeroSearch.tsx   # Landing hero with search
│   │
│   ├── hooks/
│   │   ├── useSearch.ts         # SSE stream consumer + store dispatch
│   │   └── useHistory.ts        # History CRUD
│   │
│   ├── lib/
│   │   ├── agents/
│   │   │   └── answer.agent.ts  # LangGraph graph + Groq streaming
│   │   ├── db/
│   │   │   ├── prisma.ts        # Singleton PrismaClient
│   │   │   └── search.repository.ts  # Data access layer
│   │   ├── tools/
│   │   │   └── web-search.tool.ts    # Tavily search tool
│   │   └── utils.ts
│   │
│   ├── store/
│   │   └── search.store.ts      # Zustand store for search state
│   │
│   └── types/
│       └── index.ts             # Shared TypeScript types
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd answer-engine
npm install
```

### 2. Get API Keys

**Groq** (free tier available):

1. Go to https://console.groq.com
2. Create an API key
3. Model used: `llama-3.3-70b-versatile`

**Tavily** (free tier: 1000 searches/month):

1. Go to https://tavily.com
2. Sign up and get your API key

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
GROQ_API_KEY=gsk_your_groq_key_here
TAVILY_API_KEY=tvly-your_tavily_key_here
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

```bash
npm run db:push
```

This creates the SQLite database at `prisma/dev.db`.

### 5. Run development server

```bash
npm run dev
```

Open http://localhost:3000

---

## Production Deployment (Vercel)

### Switch to PostgreSQL

1. Create a PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)

2. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:

```bash
npm run db:migrate
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel Dashboard:

- `GROQ_API_KEY`
- `TAVILY_API_KEY`
- `DATABASE_URL` (PostgreSQL connection string)

---

## Key Design Decisions

### Why SSE instead of WebSockets?

Server-Sent Events are simpler for unidirectional streaming (server → client), work natively with Next.js Route Handlers, and don't require a WebSocket server upgrade.

### Why Zustand over React Context?

Zustand provides atomic updates, avoids re-render cascades, and has zero boilerplate compared to useReducer+Context. The store is used across the sidebar (history), search bar, and results panel without prop drilling.

### Why LangGraph?

LangGraph enables defining the search pipeline as an explicit state machine with nodes (fetch_sources → generate_answer → generate_followups), making it easy to add new steps (e.g., query rewriting, citation extraction) without changing the streaming logic.

### Repository Pattern

`search.repository.ts` isolates all Prisma calls. API routes import the repository, not Prisma directly. This makes testing easier and keeps routes thin.

### DRY principles applied

- `cn()` utility handles all className merging
- `AnswerPanel` is reused in both main results and follow-up answers
- `SearchBar` is reused in hero, sticky header, and detail page
- `handleEvent()` in `useSearch.ts` centralises all SSE event parsing
- Types are defined once in `src/types/index.ts`

---

## Adding Features

### Add a new LangGraph node

```ts
// In src/lib/agents/answer.agent.ts

async function myNewNode(state: State): Promise<Partial<State>> {
  // your logic
  return { /* partial state update */ };
}

// Add to graph:
.addNode('my_new_node', myNewNode)
.addEdge('generate_answer', 'my_new_node')
.addEdge('my_new_node', 'generate_followups')
```

### Add a new search tool

```ts
// In src/lib/tools/
export const myTool = tool(async ({ query }) => { ... }, {
  name: 'my_tool',
  description: '...',
  schema: z.object({ query: z.string() }),
});
```

### Switch LLM model

In `src/lib/agents/answer.agent.ts`:

```ts
model: 'llama-3.3-70b-versatile',  // change this
// Available Groq models:
// - llama-3.3-70b-versatile  (best quality)
// - llama-3.1-8b-instant     (fastest)
// - mixtral-8x7b-32768       (long context)
// - gemma2-9b-it             (efficient)
```

---

## Scripts

| Command              | Description             |
| -------------------- | ----------------------- |
| `npm run dev`        | Start dev server        |
| `npm run build`      | Build for production    |
| `npm run start`      | Start production server |
| `npm run db:push`    | Push schema to DB (dev) |
| `npm run db:migrate` | Create migration (prod) |
| `npm run db:studio`  | Open Prisma Studio      |
| `npm run lint`       | Run ESLint              |

#### SETUP PROCESS

npm install

# Your .env should look exactly like this:

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Generate the Prisma client

npx prisma generate

# Push the schema to create the SQLite database

npm run db:push
