# Vibe Maxxing

A personal assistant that turns your thoughts into actionable items.

## Plan

- **Jot down thoughts** → Get action items (todos)
- **Action items** can be completed:
  - Manually (e.g. draft email)
  - Automatically (e.g. send email)

## TODO

- [ ] UI (Dashboard)
- [ ] Calendar integration (ICS, Google Calendar)

## Tech Stack

- **Front-end & back-end:** Next.js (App Router, Server Actions)
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic (Claude SDK)
- **Firebase:** Boilerplate in place (auth / other services as needed)

## Getting Started

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local` with your keys (Anthropic, Firebase, Supabase).

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app/` — App Router routes and layout
- `src/app/actions/` — Server actions (e.g. `exampleAnthropicAction`)
- `src/lib/anthropic.ts` — Anthropic client (server-only)
- `src/lib/firebase.ts` — Firebase app and Auth (client-safe)
- `src/lib/supabase/client.ts` — Supabase browser client
- `src/lib/supabase/server.ts` — Supabase server client (with cookies)

## Learn More

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Anthropic API](https://docs.anthropic.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase for Web](https://firebase.google.com/docs/web/setup)
