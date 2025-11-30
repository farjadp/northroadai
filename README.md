# North Road AI

Founder copilot built with Next.js, Firebase, and Gemini. This doc is meant for reviewers on GitHub to understand how the system works and how to run it locally.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind, Framer Motion.
- Firebase Auth + Firestore.
- Gemini via `@google/generative-ai` (v1 endpoints, model `models/gemini-1.5-flash-002` text-only).

## Environment
Create `.env.local` with:
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `GEMINI_API_KEY`

## Auth & Roles
- Google Sign-In (`src/context/auth-context.tsx`).
- Firestore `users/{uid}` stores `tier` (SCOUT/VANGUARD/COMMAND), `unlockedAgents`, `role` (`user`/`admin`).
- Admin gate in `src/app/admin/layout.tsx`; set `role: "admin"` on your user doc to enter `/admin`.

## Data Model (Firestore)
- Users: `users/{uid}` → tier, unlockedAgents, role, timestamps.
- Startup DNA: `startups/{uid}` → profile fields (name, oneLiner, burnRate, etc.).
- Chat sessions: `users/{uid}/chat_sessions/{sessionId}` with subcollection `messages`.
- Plans: `plans/{tier}` → price, description, features, includedAgents.
- Guest chats: `guest_chats` (public landing chat logs).
- Settings: `settings/chat` → `guestLimit`.

## Agents (Multi-Agent Grid)
- Defined in `src/lib/agents.ts` (Navigator, Builder, Ledger, Counsel, Rainmaker) with strict boundaries and upsell prompts.
- Access control: SCOUT has Navigator + per-agent unlocks; VANGUARD/COMMAND all agents; plan includes `includedAgents` for flexibility.

## APIs
- Chat: `src/app/api/chat/route.ts`
  - Input: `{ message, startupContext?, fileData?, agentId?, userId? }`
  - Access: validates agent access via `UserService`.
  - RAG: fetches global/user docs; currently sends doc URIs in text (no file upload with current key; `fileData` is ignored).
  - Model: `models/gemini-1.5-flash-002` (v1), text-only. No GoogleAIFileManager used.
- Guest Chat: `src/app/api/guest-chat/route.ts` (rate-limited by `settings/chat.guestLimit`, logs to `guest_chats`).
- Admin Settings: `/api/admin/settings/chat` for guest limit.

## UI Pages (Key)
- Home + guest chat: `src/app/page.tsx`
- Dashboard: `src/app/dashboard/page.tsx` (shows DNA readiness, recent sessions, quick deploy)
- Chat: `src/app/dashboard/chat/page.tsx` (multi-agent sessions with persistence)
- About/Protocol/Manifesto/Access: content pages using `TopNav`
- Admin: `/admin` (users, packages/plans, guest chats, settings)

## Admin Tools
- Users: edit tier and role at `/admin/users`
- Packages/Plans: `/admin/packages` (price, features, includedAgents per tier)
- Guest chats log: `/admin/guest-chats`
- Chat settings: `/admin/settings/chat` (guest limit)

## Running Locally
```
npm install
npm run dev
# open http://localhost:3000
```
Sign in via `/login`. To test admin, set your Firestore user doc role to `"admin"`.

## Known Notes
- Gemini usage is text-only; file uploads are not sent (URIs passed in prompt, `fileData` ignored). If you get 404/400, verify model access in Google AI Studio and switch to `models/gemini-1.5-pro` if needed.
- Firestore rules should restrict writes (especially role/plan). Current code expects proper security rules in your Firebase project.

## Architecture Diagram (Mermaid)
```mermaid
flowchart LR
    subgraph Client
        UI[Next.js App Pages\n/dashboard, /admin, /login]
        AuthCtx[Auth Context\nuser, tier, role, agents]
    end

    subgraph Backend (Next API Routes)
        ChatAPI[/api/chat\nMulti-Agent + RAG/]
        GuestAPI[/api/guest-chat/]
        AdminAPI[/api/admin/settings/chat/]
    end

    subgraph Firebase
        Auth[Firebase Auth\nGoogle Sign-In]
        Firestore[Firestore\nusers, startups, chat_sessions,\nplans, guest_chats, settings]
    end

    subgraph Gemini
        Model[models/gemini-1.5-flash-002\n(v1)]
    end

    UI -->|uses| AuthCtx
    AuthCtx --> Auth
    AuthCtx --> Firestore
    UI --> ChatAPI
    UI --> GuestAPI
    UI --> AdminAPI
    ChatAPI --> Firestore
    ChatAPI --> Model
    GuestAPI --> Firestore
    GuestAPI --> Model
    AdminAPI --> Firestore
```
