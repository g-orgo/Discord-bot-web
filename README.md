# Raptor Chatbot Web

Web frontend for the Raptor Chatbot. Provides a chat interface powered by a local LLM, a personality editor for customising the AI system prompt, and user authentication with persistent chat history.

## Stack

React 19 · Vite · react-router-dom

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server → http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Serve production build locally
npm run lint      # ESLint
```

## Local development setup

Both backend services must be running before starting the frontend:

| Service | Command | Port |
|---------|---------|------|
| `raptor-chatbot-llm` | `uvicorn main:app --reload` | 8000 |
| `raptor-chatbot-server` | `npm run dev` | 3001 |

The Vite dev server proxies API calls automatically — no `.env` required:

| Prefix | Proxied to |
|--------|-----------|
| `/api/*` | `http://localhost:8000` (LLM server) |
| `/auth/*` | `http://localhost:3001` (Auth server) |

## Routes

| Path | View | Auth required |
|------|------|---------------|
| `/` | Chat | No |
| `/personality` | Personality editor | Yes — redirects to `/auth` |
| `/history` | Session history | Yes — redirects to `/auth` |
| `/profile` | User profile (Discord link) | Yes — redirects to `/auth` |
| `/auth` | Login / Register | No — redirects to `/` if already logged in |

## Features

- **Chat** — streams responses from the LLM via SSE (`POST /api/chat/stream`)
- **Personality editor** — preset cards + custom prompt editor, persisted to `PUT /api/system-prompt`
- **Auth** — login and register with JWT sessions stored in `sessionStorage`
- **History** — chat history synced with the auth server, updated in real time via SSE
- **Session restore** — history grouped by `sessionId`, with full-thread restore into chat
- **Profile linking** — optional `discordUsername` bridge to merge Discord and web history

## Architecture

React 19 SPA with no external state management library (`useState` only). Client-side routing via `react-router-dom`.

```
src/
  App.jsx            # Root — BrowserRouter, route definitions, session state
  App.css            # All styles (no CSS modules, no Tailwind)
  index.css          # Body/root resets only
  components/
    Nav.jsx          # Sidebar (desktop) / bottom bar (mobile)
  views/
    Chat.jsx         # LLM chat interface
    Playground.jsx   # Personality / system prompt editor
    Auth.jsx         # Login + Register tabs
```

**Session management:** Auth state is held in React state (`App.jsx`) and persisted to `sessionStorage`:
- `raptor_token` — Bearer JWT
- `raptor_user` — `{ email, displayName }` JSON string

Session is lost on tab close (intentional — `sessionStorage`).

## Related services

- [`raptor-chatbot-llm`](https://github.com/g-orgo/Discord-bot-LLM) — LLM server (chat, streaming, system prompt)
- [`raptor-chatbot-server`](https://github.com/g-orgo/Discord-bot-web-server) — Auth & history server
