# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Serve production build locally
npm run lint      # ESLint
```

No test suite is configured.

## Local development setup

Requires both backend services running:

| Service | Command | Port |
|---|---|---|
| `raptor-chatbot-llm` | `uvicorn main:app --reload` | 8000 |
| `raptor-chatbot-server` | `node --watch app.js` | 3001 |

The Vite dev server proxies automatically:
- `/api/*` → `http://localhost:8000` (LLM API)
- `/auth/*` → `http://localhost:3001` (Auth server)

Required `.env` variables: none (proxy handles URLs).

## Architecture

React 19 SPA built with Vite. No state management library — local `useState` only. Routing via `react-router-dom` (client-side).

### File structure

```
src/
  App.jsx            # Root — BrowserRouter, route definitions, session state
  App.css            # All styles (no CSS modules, no Tailwind)
  index.css          # Body/root resets only
  components/
    Nav.jsx          # Sidebar (desktop) / bottom bar (mobile), receives user + onLogout props
  views/
    Chat.jsx         # POST /api/chat — message list + input form
    Playground.jsx   # Personality editor — preset cards + custom prompt → PUT /api/system-prompt
    Auth.jsx         # Login + Register tabs → /auth/login, /auth/register
```

### Routing

| Path | View | Auth required |
|---|---|---|
| `/` | Chat | No |
| `/personality` | Personality editor | **Yes** — redirects to `/auth` |
| `/auth` | Login / Register | No (redirects to `/` if already logged in) |

### Session management

Auth state is held in React state (`App.jsx`) and persisted to `sessionStorage`:
- `raptor_token` — Bearer JWT
- `raptor_user` — `{ email, displayName }` JSON string

Session is lost on tab close (intentional — `sessionStorage`).

### Styling

Single `App.css` file with BEM-ish class names. Responsive: sidebar on desktop (`≥ 641px`), bottom tab bar on mobile.

## Key Conventions

**No hardcoded URLs.** All API calls use relative paths (`/api/...`, `/auth/...`) — the Vite proxy resolves them in dev; configure a reverse proxy in production.

**No mocks.** All data comes from real backend calls. Never add `useState` seeded with fake data.

**CSS only in `App.css`.** Do not create per-component CSS files or use inline styles unless explicitly asked.

**Props over context.** `user` and `onLogout` are passed as props from `App.jsx` — do not introduce React Context without discussion.

**ESM only.** `"type": "module"` in `package.json` — use `import`/`export`, never `require`.
