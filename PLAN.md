# Build Plan

Phased so each step leaves the app runnable. See [SPEC.md](./SPEC.md) for the full data model and screens.

## Phase 0 — Scaffold
- `create-next-app` (TypeScript, App Router, Tailwind, ESLint)
- Install Prisma, init SQLite provider, set up `data/` folder (db file + uploads) and add it to `.gitignore`
- Base layout with nav: Dashboard / Applications / CV / Platforms / ToDos

## Phase 1 — Data layer
- Write `prisma/schema.prisma` for all models in SPEC.md
- Run first migration, generate Prisma client
- Seed script: a few example Platforms (LinkedIn, Indeed) and an empty CvProfile row

## Phase 2 — Applications CRUD
- List page with table, filter/sort/search
- New/Edit form
- Detail page with status change (writes StatusChange row) and notes
- Delete with confirmation

## Phase 3 — CV / My Info
- CvProfile form (structured fields) with copy-to-clipboard buttons
- CvVersion: PDF upload (store in `data/uploads/`), list with download links
- LaTeX editor for a CvVersion's `latexSource` (code editor component, monospace + syntax highlighting)
- "Compile to PDF" Server Action: shells out to local `pdflatex`/`xelatex`, writes result to `data/uploads/`, updates `filePath`/`compiledAt`, or saves `compileError` and surfaces it in the UI on failure
- Detect and check for `pdflatex` on `PATH` at compile time; show a clear setup message (not a crash) if missing
- Stale-PDF indicator when `latexSource` has changed since `compiledAt`
- Link a CvVersion to an Application from the application form

## Phase 4 — Platforms
- CRUD for Platform list
- Application form references Platform (dropdown + "add new" inline)

## Phase 5 — ToDos
- CRUD, filters (overdue/done/all)
- Link a ToDo to an Application from the application detail page

## Phase 6 — Dashboard
- Status funnel chart (count by status, split PM vs Dev)
- Response rate stat
- "Needs follow-up" list (Applied 7+ days, no status change)
- Upcoming/overdue ToDos widget
- Recent activity feed (latest StatusChanges)

## Phase 7 — Polish
- Keyboard shortcut for "New application"
- Dark mode
- Basic empty states / loading states
- Manual QA pass in browser for every screen (golden path + edge cases: empty CV, no platforms, overdue todo, etc.)

## Out of scope for v1
Hosting, auth, multi-device sync — revisit only if you decide you want access from your phone later.
