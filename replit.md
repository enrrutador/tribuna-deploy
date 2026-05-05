# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
This is a clone of https://canchallena.lanacion.com.ar/ — Argentine football scores/fixtures site.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TanStack Query, Wouter router, Tailwind CSS, shadcn/ui

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Artifacts
- `artifacts/api-server` — Express 5 API server, runs at `/api`, port 8080
- `artifacts/cancha-llena` — React + Vite frontend, runs at `/`, port varies

### Shared Libraries
- `lib/db` — Drizzle ORM schema + database client
- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-zod` — Generated Zod schemas (from Orval). IMPORTANT: `src/index.ts` must only export `./generated/api`, NOT `./generated/types` (causes duplicate export errors)
- `lib/api-client-react` — Generated TanStack Query hooks (from Orval)

### DB Schema Tables
- `tournaments` — tournaments with slug, category (destacados/argentina/world), flagEmoji
- `teams` — teams with shortName, logoUrl, slug, stadium, city, country, founded, coach, description (32 teams seeded)
- `matches` — match records with status (upcoming/live/finished), minute, scores, broadcastChannel, round
- `match_events` — individual match events (goal/owngoal/yellow_card/red_card/substitution/penalty/penalty_miss/var_review) with minute, player_name, assist_name, team_id
- `standings` — table positions per tournament (position, played, won, drawn, lost, goals, points, form) — seeded for 9 tournaments
- `players` — player names and nationality (20 players seeded)
- `scorers` — top scorers per tournament (goals, assists, played) — seeded for 8 tournaments

### Seeded Data
- 20 tournaments across destacados/argentina/world categories with descriptions, country, format, participantCount, currentChampion
- 32 teams (Argentine clubs + European + national teams) with full metadata (stadium, city, country, founded, coach, description, slug)
- Matches for May 4–5 2026 across all tournaments (live, finished, upcoming)
- 30 match events (goals, cards) seeded across 10 key matches
- 9 tournaments with standings data
- 8 tournaments with scorer data
- 20 players seeded

### Visual Design
- Dark outer background (#1a1a1a), light content area (#f0f0f0)
- Circular team badges with club colors (teamColors.ts)
- Broadcaster badges: ESPN (red), TNT Sports (purple), ESPN Premium, TyC Sports, etc.
- Two-tier header: hex pattern band (22px) + logo row (56px)
- Dark sidebar (#111, 250px) with active left-border highlight
- Match group cards: white with border + shadow, round separated by border-left
- Live match indicator: red pulsing dot with minute counter

### API Routes
- `GET /api/tournaments` — all tournaments grouped by category
- `GET /api/tournaments/by-slug/:slug` — tournament by slug
- `GET /api/tournaments/:id` — tournament by id
- `GET /api/tournaments/:id/standings` — standings table
- `GET /api/tournaments/:id/scorers` — top scorers
- `GET /api/tournaments/:id/fixtures` — all matches for tournament
- `GET /api/matches` — matches with optional `status` and `date` filters, grouped by tournament
- `GET /api/matches/today` — today's matches grouped by tournament
- `GET /api/matches/live` — live matches
- `GET /api/matches/:id` — single match with events array (goals, cards, etc.)
- `GET /api/teams` — list all teams
- `GET /api/teams/:id` — team detail with metadata + recent matches

### Frontend Pages
- `/` — Home (all today's matches, date picker, filter tabs, auto-refresh)
- `/torneo/:slug` — Tournament page (Partidos / Tabla / Goleadores tabs)
- `/equipo/:id` — Team detail page (badge, description, stadium/city/coach/founded, recent matches with G/E/P results)
- `/partido/:id` — Match detail page (score card, event timeline, match info)

### Navigation
- Match rows in MatchGroupCard are clickable → navigate to `/partido/:id`
- Team badges in MatchGroupCard are clickable → navigate to `/equipo/:id` (stops propagation so only badge navigates to team)
- Team badges in match detail page link to team pages
- Breadcrumb navigation on match detail: Inicio > Torneo > Ronda

### Frontend Components
- `Layout` — wraps Header + Sidebar + main content + Footer
- `Header` — logo + hex pattern background
- `Sidebar` — dark sidebar with tournament navigation, active state per route
- `MatchList` — main match list with filters, date picker, live count badge, auto-refresh
- `MatchGroupCard` — reusable match group (used in home and tournament pages)
- `Footer` — dark footer with links and copyright

## Codegen Notes
- After editing `lib/api-spec/openapi.yaml`, run codegen to regenerate types and hooks
- After codegen, manually restore `lib/api-zod/src/index.ts` to only: `export * from "./generated/api";`
- The `schemas: { path: "generated/types" }` orval option generates conflicting TypeScript types — keep in orval config for now but ensure index.ts doesn't re-export them

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
