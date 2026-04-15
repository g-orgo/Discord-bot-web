# Translation History Feature

**Date:** 2026-04-06

## Summary
Added a translation history feature for logged-in users. Each chat interaction is stored server-side per user. A new `/history` view displays all past interactions with timestamps, user messages, and bot responses.

## Files created/modified

| File | Change |
|---|---|
| `raptor-chatbot-server/app.js` | Added `GET/POST/DELETE /auth/history` endpoints with in-memory `HISTORY` Map per user; fixed CORS to allow `DELETE` method |
| `raptor-chatbot-web/src/views/Chat.jsx` | Accepts `user` prop; fires `POST /auth/history` (fire-and-forget) after each successful LLM response when user is logged in |
| `raptor-chatbot-web/src/views/History.jsx` | New view — fetches and renders history entries in reverse chronological order; includes clear-all button with confirmation |
| `raptor-chatbot-web/src/App.jsx` | Imported `History`; added `/history` route (auth-gated with redirect to `/auth`); passed `user` prop to `<Chat />` |
| `raptor-chatbot-web/src/components/Nav.jsx` | Added `AUTH_LINKS` array; History link (`/history`, 📋) appears only when user is logged in |
| `raptor-chatbot-web/src/App.css` | Added `.history-view`, `.history__entry`, `.history__user`, `.history__bot`, `.history__label`, `.history__text`, `.history__clear`, `.history__meta`, `.history__date`, `.history__model` styles |

## Decisions made
- **Fire-and-forget for history POST**: wrapped in `.catch(() => {})` to avoid bubbling errors to the chat UX if the server is down.
- **In-memory Map on server**: consistent with existing in-memory USERS — no persistence added without discussion.
- **Reverse chronological order**: newest entries shown first by calling `.slice().reverse()` client-side after fetch.
- **Auth-links separate array in Nav**: keeps base links always visible while auth-only links are conditionally rendered, avoiding ternaries inside the map.

## Update — 2026-04-15

### Summary
Added "Open in Chat" restore button to the History view so users can resume any past session directly from the `/history` page (previously only possible via the sidebar dropdown).

### Files modified
| File | Change |
|---|---|
| `raptor-chatbot-web/src/views/History.jsx` | Accepts `onRestoreHistory` prop; added `useNavigate`; added `restoreEntry()` function; renders `💬 Open in Chat` button per entry in `.history__meta` (only when prop is provided) |
| `raptor-chatbot-web/src/App.jsx` | Passes `onRestoreHistory={entry => setRestoredContext(entry)}` to `<History>` |
| `raptor-chatbot-web/src/App.css` | Added `.history__restore` button styles (ghost style, hover highlight) |

### Decisions made
- Button is guarded by `onRestoreHistory && (...)` so the component stays usable standalone without the prop.
- Navigation to `/` is handled inside `History.jsx` via `useNavigate` — keeps restore logic self-contained.
- Style is ghost (transparent bg, subtle border) to not compete visually with the date/model metadata.

## Update — 2026-04-15 (session tracking)

### Summary
Introduced `sessionId` so that multiple exchanges in the same conversation are linked. Restoring a session from History or the nav sidebar now replays the full conversation thread in Chat. New messages continue under the same session.

### Files modified
| File | Change |
|---|---|
| `raptor-chatbot-server/src/models/HistoryEntry.js` | Added `sessionId: String` (optional, indexed) |
| `raptor-chatbot-server/src/routes/history.js` | GET exposes `sessionId`; POST accepts and stores it |
| `raptor-chatbot-web/src/utils/sessions.js` | New utility — `groupBySessions` and `latestEntry` |
| `raptor-chatbot-web/src/api/historyApi.js` | `saveHistoryEntry` forwards `sessionId` param |
| `raptor-chatbot-web/src/hooks/useHistory.js` | Returns grouped sessions (max 3) instead of flat entries |
| `raptor-chatbot-web/src/components/Nav.jsx` | Uses session objects; shows exchange count badge |
| `raptor-chatbot-web/src/views/Chat.jsx` | `sessionIdRef` tracks current UUID; restores full session; resets on New Chat |
| `raptor-chatbot-web/src/App.jsx` | `restoredSession` replaces `restoredContext`; shape is `{ sessionId, entries }` |
| `raptor-chatbot-web/src/views/History.jsx` | Groups by session; threads multi-exchange sessions; Open in Chat passes full session |
| `raptor-chatbot-web/src/App.css` | `.history__exchange`, `.history__exchanges-count`, `.nav__dropdown-count` |

### Decisions made
- Discord entries have no `sessionId` (null) — each is its own standalone session. "Open in Chat" button is hidden for Discord entries.
- Old web entries (pre-feature) also have no `sessionId` — each shows as a standalone session with no visual change.
- `groupBySessions` extracted as a shared utility to avoid duplication between `useHistory` and `History.jsx`.
- `sessionIdRef` (not state) in Chat to avoid re-renders; reset on "New Chat" and on session restore.

## Known issues / next steps
- No pagination — could grow large for active users.
