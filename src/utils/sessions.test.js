import { describe, it, expect } from 'vitest';
import { groupBySessions, latestEntry } from './sessions.js';

const entry = (overrides = {}) => ({
  userMessage: 'hello',
  botResponse: 'hi',
  model: null,
  source: 'web',
  timestamp: new Date().toISOString(),
  sessionId: null,
  ...overrides,
});

describe('groupBySessions', () => {
  it('each null-sessionId entry becomes its own standalone session', () => {
    const entries = [
      entry({ sessionId: null, timestamp: '2026-01-01T10:00:00Z' }),
      entry({ sessionId: null, timestamp: '2026-01-01T09:00:00Z' }),
    ];
    const sessions = groupBySessions(entries);
    expect(sessions).toHaveLength(2);
    expect(sessions[0].entries).toHaveLength(1);
    expect(sessions[1].entries).toHaveLength(1);
  });

  it('entries sharing a sessionId are grouped into one session', () => {
    const entries = [
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:05:00Z', userMessage: 'second' }),
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:00:00Z', userMessage: 'first' }),
    ];
    const sessions = groupBySessions(entries);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].entries).toHaveLength(2);
  });

  it('entries within a session are sorted chronologically (oldest first)', () => {
    const entries = [
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:05:00Z', userMessage: 'second' }),
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:00:00Z', userMessage: 'first' }),
    ];
    const sessions = groupBySessions(entries);
    expect(sessions[0].entries[0].userMessage).toBe('first');
    expect(sessions[0].entries[1].userMessage).toBe('second');
  });

  it('mixes grouped and standalone sessions preserving server order', () => {
    const entries = [
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:05:00Z' }),
      entry({ sessionId: null,  timestamp: '2026-01-01T09:30:00Z' }),
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:00:00Z' }),
    ];
    const sessions = groupBySessions(entries);
    // "abc" group appears first (server order); standalone second
    expect(sessions).toHaveLength(2);
    expect(sessions[0].sessionId).toBe('abc');
    expect(sessions[0].entries).toHaveLength(2);
    expect(sessions[1].sessionId).toBeNull();
  });

  it('returns empty array for empty input', () => {
    expect(groupBySessions([])).toEqual([]);
  });
});

describe('latestEntry', () => {
  it('returns the last entry (most recent) after chronological sort', () => {
    const entries = [
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:05:00Z', userMessage: 'second' }),
      entry({ sessionId: 'abc', timestamp: '2026-01-01T10:00:00Z', userMessage: 'first' }),
    ];
    const [session] = groupBySessions(entries);
    expect(latestEntry(session).userMessage).toBe('second');
  });

  it('returns the only entry for a standalone session', () => {
    const e = entry({ userMessage: 'solo' });
    const [session] = groupBySessions([e]);
    expect(latestEntry(session).userMessage).toBe('solo');
  });
});
