# AGENTS.md

Instructions for AI coding assistants (Claude Code, Cursor, GitHub Copilot, Codex…) working in this
repository. Humans: keep this file short and up to date — it's the brief your AI tools read first.

## Project

<One paragraph: what the app does, who uses it, and the core user flow.>

## Stack

- Frontend: <e.g. Next.js 16 App Router, TypeScript strict, Tailwind CSS>
- Backend: <e.g. Next.js route handlers / FastAPI>
- Database: <e.g. Supabase Postgres with Row Level Security>
- Package manager: <pnpm / npm / uv>

## Commands

```bash
<pnpm dev>          # run locally
<pnpm test>         # unit tests — must pass before committing
<pnpm lint>         # lint
<pnpm typecheck>    # type check
<pnpm build>        # production build
```

## Conventions

- Folder layout: <e.g. `app/` routes, `components/` UI, `lib/` logic, `tests/` tests>.
- Put business logic in plain functions under `lib/` and test them; keep components thin.
- Validate all external input (request bodies, form data, model output) with zod / pydantic.
- Use the existing UI components before creating new ones.
- Match the style of surrounding code; don't reformat unrelated files.

## Rules

- Make small, focused changes and explain what you changed and why.
- Write or update tests for any logic you change, and run them.
- Read the installed library docs (e.g. `node_modules/<pkg>/docs`) instead of relying on memory — APIs change.
- Never commit secrets or print them in logs. Environment variables live in `.env.local` (git-ignored).
- Never disable lint rules, type checks, or security checks to make something pass.
- Don't add new dependencies without saying why.
- Ask before deleting files, changing the database schema, or touching auth/permissions.

## Academic integrity

This is a student project. Team members must understand and be able to explain all code.
Prefer explaining and suggesting over generating large features in one go.
