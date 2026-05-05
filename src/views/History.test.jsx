import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import History from './History.jsx';

// ── Mocks ─────────────────────────────────────────────────────
const mockDeleteSession = vi.fn(() => Promise.resolve({ ok: true }));
const mockDeleteEntry = vi.fn(() => Promise.resolve({ ok: true }));
const mockFetchHistory = vi.fn();

vi.mock('../api/historyApi.js', () => ({
  fetchHistory: (...args) => mockFetchHistory(...args),
  clearHistory: vi.fn(() => Promise.resolve()),
  deleteSession: (...args) => mockDeleteSession(...args),
  deleteEntry: (...args) => mockDeleteEntry(...args),
}));

vi.mock('../hooks/useHistoryStream.js', () => ({
  useHistoryStream: vi.fn(),
}));

const user = { email: 'a@b.com', displayName: 'Tester' };

function makeEntry(overrides = {}) {
  return {
    id: `id-${Math.random()}`,
    userMessage: 'hello',
    botResponse: 'hi',
    source: 'web',
    timestamp: new Date().toISOString(),
    sessionId: null,
    ...overrides,
  };
}

function renderHistory(entries = [], props = {}) {
  mockFetchHistory.mockResolvedValue(entries);
  return render(
    <MemoryRouter>
      <History user={user} onRestoreHistory={vi.fn()} {...props} />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────
describe('History — session list', () => {
  beforeEach(() => { mockDeleteSession.mockClear(); mockDeleteEntry.mockClear(); });

  it('shows empty state when history is empty', async () => {
    renderHistory([]);
    await waitFor(() => expect(screen.getByText(/no history yet\. start chatting!/i)).toBeInTheDocument());
  });

  it('renders one card per session', async () => {
    const entries = [
      makeEntry({ sessionId: 'abc', timestamp: '2026-01-01T10:00:00Z' }),
      makeEntry({ sessionId: 'abc', timestamp: '2026-01-01T10:05:00Z' }),
      makeEntry({ sessionId: null }),
    ];
    renderHistory(entries);
    // 2 sessions: one with sessionId "abc", one standalone
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
  });

  it('shows "2 exchanges" badge for a two-entry session', async () => {
    const entries = [
      makeEntry({ sessionId: 'abc', timestamp: '2026-01-01T10:00:00Z' }),
      makeEntry({ sessionId: 'abc', timestamp: '2026-01-01T10:05:00Z' }),
    ];
    renderHistory(entries);
    await waitFor(() => expect(screen.getByText('2 exchanges')).toBeInTheDocument());
  });

  it('does not show exchanges badge for single-entry sessions', async () => {
    renderHistory([makeEntry()]);
    await waitFor(() => expect(screen.queryByText(/exchanges/i)).not.toBeInTheDocument());
  });
});

describe('History — delete', () => {
  beforeEach(() => { mockDeleteSession.mockClear(); mockDeleteEntry.mockClear(); });

  it('calls deleteEntry for a standalone session (null sessionId)', async () => {
    const entry = makeEntry({ id: 'entry-xyz', sessionId: null });
    renderHistory([entry]);
    await waitFor(() => screen.getAllByRole('button', { name: /delete/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    });

    expect(mockDeleteEntry).toHaveBeenCalledWith('entry-xyz');
    expect(mockDeleteSession).not.toHaveBeenCalled();
  });

  it('calls deleteSession for a session with a sessionId', async () => {
    const entries = [
      makeEntry({ sessionId: 'session-abc', timestamp: '2026-01-01T10:00:00Z' }),
      makeEntry({ sessionId: 'session-abc', timestamp: '2026-01-01T10:05:00Z' }),
    ];
    renderHistory(entries);
    await waitFor(() => screen.getByRole('button', { name: /delete/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    });

    expect(mockDeleteSession).toHaveBeenCalledWith('session-abc');
    expect(mockDeleteEntry).not.toHaveBeenCalled();
  });

  it('removes the session card from the list after delete', async () => {
    const entries = [makeEntry({ id: 'e1', userMessage: 'first' }), makeEntry({ id: 'e2', userMessage: 'second' })];
    renderHistory(entries);
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
  });
});
