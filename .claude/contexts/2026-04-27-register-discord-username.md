# Context

Date: 2026-04-27

## Summary
Added optional Discord username input to the register flow so users can link their Discord identity at account creation and immediately claim pending Discord history.

## Files created/modified
- src/views/Auth.jsx
  - Added `discordUsername` field in register form and included it in register submit payload.
- src/api/authApi.js
  - Extended `register` API helper to send optional `discordUsername` as `null` when empty.
- src/hooks/useHistory.js
  - Refactored initial refresh effect to avoid direct setState-in-effect lint violation while preserving refresh behavior for SSE updates.

## Decisions made
- Kept the field optional to preserve the existing onboarding flow.
- Trimmed input before sending to backend to avoid accidental whitespace-only usernames.

## Known issues or next steps
- No remaining lint issues after the `useHistory` refactor.
