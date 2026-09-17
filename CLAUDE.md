# Job Tracker

Local, single-user Next.js app for tracking PM/Dev job applications. Full spec: [SPEC.md](./SPEC.md). Build order: [PLAN.md](./PLAN.md).

## Stack
Next.js (App Router) + TypeScript + Tailwind + Prisma/SQLite. No auth, no external services — everything runs on localhost, data in `data/app.db`.

## Conventions
- Server Actions for mutations, not a separate API layer, unless a route handler is needed for file upload/download.
- All enums (roleType, status, priority) defined in `prisma/schema.prisma` — keep UI dropdowns driven from those, not hardcoded strings.
- Every status change on an Application writes a `StatusChange` row — never mutate `status` without also recording history.
- Never store passwords or credentials in the `Platform` model — username only.
- Run `npx prisma migrate dev` for schema changes; never hand-edit `data/app.db`.

## Subagents
Three project-specific subagents live in `.claude/agents/`:
- **feature-builder** — implements a full vertical slice (schema + server action + UI) for one feature from SPEC.md/PLAN.md.
- **db-migrator** — evolves `prisma/schema.prisma` and migrations safely, without data loss.
- **ui-tester** — runs the dev server and exercises a feature in the browser to confirm it actually works, per PLAN.md Phase 7.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
