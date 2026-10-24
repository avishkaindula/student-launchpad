# AI Agent App — Next.js + AI SDK starter

A small, readable starter for building **real AI features** — not just a chat box.
It ships a "Project Mentor" agent that helps student teams scope their projects, and
shows the four patterns you'll use in almost every AI app:

| Pattern | Where | What it teaches |
|---|---|---|
| **Agent loop with tools** | `lib/agent/mentor-agent.ts` | The model decides when to call your functions, reads the results, and keeps going |
| **RAG (retrieval)** | `lib/knowledge/*` + `searchPlaybook` tool | Ground answers in *your* content instead of the model's memory |
| **Deterministic tools** | `lib/agent/scope.ts` + `checkScope` tool | Give the model facts it can't hallucinate (maths, rules, DB lookups) |
| **Structured output** | `app/api/brief/route.ts` | Force the model to return JSON that matches a zod schema |

Plus a streaming chat UI with typed tool results, input validation, and **tests that run without an API key**.

**Stack:** Next.js 16 (App Router) · AI SDK 7 (`ai`, `@ai-sdk/react`) · Vercel AI Gateway · zod 4 · Tailwind CSS 4 · Vitest

---

## Quick start

```bash
pnpm install
cp .env.example .env.local      # add your AI_GATEWAY_API_KEY
pnpm dev                        # http://localhost:3000
```

**Getting a key:** create an AI Gateway key at [vercel.com/ai-gateway](https://vercel.com/ai-gateway).
One key gives you models from OpenAI, Anthropic, Google and others; switch with `AI_MODEL` in `.env.local`.

> **No card / want a free tier?** Use a provider SDK directly — e.g. a Google AI Studio key:
> `pnpm add @ai-sdk/google`, then change one line in `lib/ai/model.ts` (instructions are in the file).

```bash
pnpm test        # unit + agent-loop tests (mock model, no key needed)
pnpm typecheck
pnpm lint
pnpm build
```

---

## How it works

```
Browser (useChat)  ──POST /api/chat──▶  createAgentUIStreamResponse(mentorAgent)
      ▲                                         │
      │  streamed UI message parts              ▼
      │  (text, tool-searchPlaybook,      ToolLoopAgent
      │   tool-checkScope)                 ├─ step 1: model → "call searchPlaybook"
      └─────────────────────────────────── ├─ run tool → results back to model
                                           └─ step 2: model → final answer
```

- `lib/agent/mentor-agent.ts` — instructions + tools + a step limit. `createMentorAgent(model)` is a factory so tests can inject a mock model.
- `app/api/chat/route.ts` — five lines: validate, then stream the agent's response.
- `components/chat.tsx` — `useChat<MentorAgentUIMessage>()`. The generic makes each tool part fully typed: `part.type === "tool-checkScope"` knows its `input` and `output`.
- `tests/agent.test.ts` — scripts a fake model ("call this tool", then "answer") and asserts the tool ran and its result was fed back. **This is how you test AI code without spending money.**

## Make it yours

**Add a tool** (e.g. look up your Supabase data, call a weather API):

```ts
// lib/agent/tools.ts
export const getTimetable = tool({
  description: "Get the user's lecture timetable for a given day",   // tells the model WHEN to use it
  inputSchema: z.object({ day: z.enum(["mon", "tue", "wed", "thu", "fri"]) }),
  execute: async ({ day }) => fetchTimetable(day),                   // runs on the server
});
export const mentorTools = { searchPlaybook, checkScope, getTimetable };
```

Then render it in `components/chat.tsx` with a `case "tool-getTimetable":` branch.

**Use your own knowledge base:** replace the notes in `lib/knowledge/docs.ts`. Keyword search
(BM25) is fine for a few hundred short docs. When you need semantic search, swap `searchDocs`
for embeddings + a vector store (e.g. Supabase `pgvector`) and keep the tool's input/output the same.

**Change the personality:** edit `instructions` in `mentor-agent.ts`. Be specific about *when* to use each tool.

## Deploy

Push to GitHub → import on [vercel.com/new](https://vercel.com/new). On Vercel the AI Gateway
authenticates automatically (OIDC), so you don't need to paste the key into project settings.

### ⚠️ Before you deploy publicly

`/api/chat` and `/api/brief` spend **your** AI credits on every request. The template already
rejects oversized input (`lib/chat/limits.ts`) and stops the agent when the user disconnects —
but anyone who finds your URL can still call it. Before sharing a public link:

1. **Require sign-in** — e.g. combine with the [`nextjs-supabase-saas`](../nextjs-supabase-saas) template and check the user in the route handler.
2. **Rate-limit** — add a rate-limit rule for `/api/*` in your host's firewall (e.g. Vercel Firewall), or use a library such as `@upstash/ratelimit`.
3. **Cap spend** — set a budget/spend limit on your AI Gateway or provider account so a bug or abuse can't drain it.
4. **Keep the demo key separate** — use a dedicated key for public demos and revoke it after the event.

## Good habits baked in (and worth keeping)

- **Never trust the model with irreversible actions.** Payments, deletes and emails should be a button the user clicks (or a tool with approval), not something the model triggers alone.
- **Keep maths and rules in code.** The model explains; your functions calculate.
- **Validate every input** (zod) — request bodies *and* tool inputs.
- **Never use `eval`/`Function()` on model output.** Treat model text like untrusted user input.
- **Keep secrets server-side.** API keys live in route handlers and tools, never in `"use client"` files or `NEXT_PUBLIC_*` vars.
- **Cap the loop.** `stopWhen: isStepCount(6)` stops runaway tool loops (and runaway bills).

## Learn more

- AI SDK docs: [ai-sdk.dev/docs](https://ai-sdk.dev/docs) — the installed version's docs are also in `node_modules/ai/docs/`
- Agents: [ai-sdk.dev/docs/agents](https://ai-sdk.dev/docs/agents)
- Model list: `curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '.data[].id'`
