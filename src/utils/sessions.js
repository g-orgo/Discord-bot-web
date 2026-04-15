/**
 * Groups flat history entries (sorted newest-first from server) into
 * session objects. Entries sharing a sessionId form one session;
 * entries without a sessionId each become a standalone session.
 *
 * Within each session, entries are sorted oldest-first (chronological).
 *
 * @param {Array} entries - raw history entries from the server
 * @returns {Array<{ sessionId: string|null, entries: Array }>}
 */
export function groupBySessions(entries) {
  const sessions = [];
  const map = new Map();

  for (const entry of entries) {
    if (entry.sessionId) {
      if (map.has(entry.sessionId)) {
        map.get(entry.sessionId).push(entry);
      } else {
        const group = [entry];
        map.set(entry.sessionId, group);
        sessions.push({ sessionId: entry.sessionId, entries: group });
      }
    } else {
      sessions.push({ sessionId: null, entries: [entry] });
    }
  }

  // Sort entries within each session chronologically (oldest first)
  for (const session of sessions) {
    if (session.entries.length > 1) {
      session.entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  }

  return sessions;
}

/** Returns the most recent entry in a session (last after chronological sort). */
export function latestEntry(session) {
  return session.entries[session.entries.length - 1];
}
