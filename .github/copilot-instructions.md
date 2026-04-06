# Raptor Web — Workspace Guidelines

React 19 SPA (Vite) for the Raptor Chatbot interface. Communicates with `raptor-chatbot-llm` (LLM API) and `raptor-chatbot-server` (Auth API) via Vite proxy.

## Build & Run

```bash
npm run dev       # Dev server → http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Serve production build
npm run lint      # ESLint
```

No test suite is configured.

**Local dev:** Requires `raptor-chatbot-llm` on port 8000 and `raptor-chatbot-server` on port 3001.

## Architecture

### Views

| Route | File | Auth required | Description |
|---|---|---|---|
| `/` | `Chat.jsx` | No | Chat interface using `POST /api/chat` |
| `/personality` | `Playground.jsx` | **Yes** | Personality preset editor → `PUT /api/system-prompt` |
| `/auth` | `Auth.jsx` | No | Login + Register tabs |

### Key files

| File | Role |
|---|---|
| `App.jsx` | Root: router, session state, route guards |
| `App.css` | All application styles (BEM-ish, single file) |
| `components/Nav.jsx` | Navigation — sidebar (desktop) / bottom bar (mobile) |
| `vite.config.js` | Proxy: `/api` → :8000, `/auth` → :3001 |

### Session

Stored in `sessionStorage`: `raptor_token` (JWT) and `raptor_user` `{ email, displayName }`.

## Key Conventions

**No hardcoded URLs.** All fetches use relative paths (`/api/...`, `/auth/...`).

**No mocks.** All data from real backend calls.

**CSS only in `App.css`.** No per-component CSS files, no inline styles.

**Props over context.** `user` + `onLogout` flow from `App.jsx` as props.

**ESM modules.** `import`/`export` only — never `require`.

**Responsive layout.** Sidebar on `≥ 641px`, bottom tab bar on mobile — handled via CSS `@media`.

## Dev Skill (always apply)

Before any code change in this workspace, load and follow the dev skill:
`e:/raptor/.claude/skills/dev/SKILL.md`
