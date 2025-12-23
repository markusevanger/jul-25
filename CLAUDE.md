# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time multiplayer quiz game built with Next.js 15, Sanity CMS, and Supabase. Players join via PIN code, answer questions, and compete on a live leaderboard.

## Commands

```bash
# Development (runs both frontend and studio)
pnpm run dev

# Run only frontend (localhost:3000)
pnpm run dev:next

# Run only Sanity Studio (localhost:3333)
pnpm run dev:studio

# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Format code
pnpm run format

# Generate Sanity TypeScript types (runs automatically before dev/build)
pnpm --filter frontend run typegen

# Deploy Sanity Studio
cd studio && npx sanity deploy

# Import sample data
pnpm run import-sample-data
```

## Architecture

### Monorepo Structure (pnpm workspaces)
- **frontend/** - Next.js 15 app (App Router, Turbopack)
- **studio/** - Sanity Studio v4

### Data Layer
- **Sanity CMS** - Quiz content (questions, answers, media)
- **Supabase** - Real-time game state (lobbies, players, answers)

### Key Patterns

**Server Actions** (`frontend/app/actions/`):
- `lobby.ts` - Create/fetch lobbies, update status
- `player.ts` - Join game, manage player state
- `game.ts` - Answer submission, game progression

**Supabase Integration**:
- `frontend/lib/supabase/server.ts` - Server-side client
- `frontend/lib/supabase/client.ts` - Browser client for real-time subscriptions
- `frontend/types/supabase.ts` - Database schema types

**Sanity Integration**:
- `frontend/sanity/lib/queries.ts` - GROQ queries for quizzes
- `frontend/sanity/lib/client.ts` - Sanity client with stega for visual editing
- `frontend/sanity.types.ts` - Auto-generated types from schema

**Game State** (`frontend/contexts/GameContext.tsx`):
- React context with reducer pattern
- Tracks lobby, players, quiz, and current question

**Real-time Hooks** (`frontend/hooks/`):
- `useRealtimeLobby.ts` - Supabase subscription for lobby/player updates
- `useLeaderboard.ts` - Live leaderboard data
- `usePenaltyTimer.ts` - Wrong answer penalty countdown

### Route Structure
```
app/(game)/
  page.tsx        - Home/start page
  create/         - Admin creates lobby, selects quiz
  join/           - Players enter PIN
  lobby/[pin]/    - Waiting room before game starts
  admin/[pin]/    - Admin dashboard during game
  play/[pin]/     - Player game interface
  results/[pin]/  - Final leaderboard
```

### Database Schema (Supabase)
- `lobbies` - Game sessions with PIN, quiz_id, status
- `players` - Participants with progress tracking
- `answers` - Answer history per player

### Sanity Schema
- `quiz` - Document with title, description, penalty settings
- `question` - Object with text/radio types, optional media, correct answer

## Environment Variables

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- Supabase credentials (check `.env.example`)

**Studio** (`.env`):
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
