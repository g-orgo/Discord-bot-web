import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Chat from './Chat.jsx';

// ── Mocks ────────────────────────────────────────────────────
vi.mock('../api/chatApi.js', () => ({
  sendMessageStream: vi.fn(async (_msg, onToken, onDone) => {
    onToken('Hello');
    onDone('test-model');
  }),
}));

const mockSave = vi.fn(() => Promise.resolve());
const mockPatch = vi.fn(() => Promise.resolve());
vi.mock('../api/historyApi.js', () => ({
  saveHistoryEntry: (...args) => mockSave(...args),
  patchSessionId: (...args) => mockPatch(...args),
}));

const user = { email: 'a@b.com', displayName: 'Tester' };

function renderChat(props = {}) {
  return render(
    <MemoryRouter>
      <Chat user={user} onNewEntry={vi.fn()} {...props} />
    </MemoryRouter>
  );
}

async function sendMessage(text = 'test message') {
  const textarea = screen.getByPlaceholderText('Message Raptor…');
  fireEvent.change(textarea, { target: { value: text } });
  await act(async () => {
    fireEvent.submit(textarea.closest('form'));
  });
}

// ── Tests ─────────────────────────────────────────────────────
describe('Chat — session tracking', () => {
  beforeEach(() => { mockSave.mockClear(); mockPatch.mockClear(); });

  it('saves with a non-null sessionId on first message', async () => {
    renderChat();
    await sendMessage('hello');

    expect(mockSave).toHaveBeenCalledOnce();
    const [, , , sessionId] = mockSave.mock.calls[0];
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });

  it('uses the same sessionId for consecutive messages in the same chat', async () => {
    renderChat();
    await sendMessage('first');
    await sendMessage('second');

    expect(mockSave).toHaveBeenCalledTimes(2);
    const sessionId1 = mockSave.mock.calls[0][3];
    const sessionId2 = mockSave.mock.calls[1][3];
    expect(sessionId1).toBe(sessionId2);
  });

  it('uses the restored sessionId (not a new one) when restoredSession is provided', async () => {
    const restoredSession = {
      sessionId: 'original-session-uuid',
      entries: [{ userMessage: 'old q', botResponse: 'old a' }],
    };
    renderChat({ restoredSession });
    await sendMessage('continuation');

    expect(mockSave).toHaveBeenCalledOnce();
    const [, , , sessionId] = mockSave.mock.calls[0];
    expect(sessionId).toBe('original-session-uuid');
  });

  it('generates a new sessionId when restoredSession has no sessionId (legacy entry)', async () => {
    const restoredSession = {
      sessionId: null,
      entries: [{ userMessage: 'old q', botResponse: 'old a' }],
    };
    renderChat({ restoredSession });
    await sendMessage('continuation');

    expect(mockSave).toHaveBeenCalledOnce();
    const [, , , sessionId] = mockSave.mock.calls[0];
    // Must be a non-null string (a newly generated UUID), not null
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });

  it('uses a different sessionId after clicking New Chat', async () => {
    renderChat();
    await sendMessage('first session message');
    const firstSessionId = mockSave.mock.calls[0][3];

    // Click New Chat
    await act(async () => {
      fireEvent.click(screen.getByText('New chat'));
    });

    await sendMessage('second session message');
    const secondSessionId = mockSave.mock.calls[1][3];

    expect(firstSessionId).not.toBe(secondSessionId);
  });

  it('patches legacy entries with the generated sessionId when restoredSession.sessionId is null', async () => {
    const restoredSession = {
      sessionId: null,
      entries: [
        { id: 'entry-id-1', userMessage: 'q1', botResponse: 'a1' },
        { id: 'entry-id-2', userMessage: 'q2', botResponse: 'a2' },
      ],
    };
    renderChat({ restoredSession });
    await sendMessage('continuation');

    // patchSessionId must be called once per legacy entry
    expect(mockPatch).toHaveBeenCalledTimes(2);
    const patchedId1 = mockPatch.mock.calls[0][0];
    const patchedSessionId = mockPatch.mock.calls[0][1];
    expect(patchedId1).toBe('entry-id-1');
    expect(typeof patchedSessionId).toBe('string');
    expect(patchedSessionId.length).toBeGreaterThan(0);

    // saveHistoryEntry must use the same sessionId as the patch
    const savedSessionId = mockSave.mock.calls[0][3];
    expect(savedSessionId).toBe(patchedSessionId);
  });

  it('does not patch entries when restoredSession already has a sessionId', async () => {
    const restoredSession = {
      sessionId: 'existing-uuid',
      entries: [{ id: 'entry-id-1', userMessage: 'q1', botResponse: 'a1' }],
    };
    renderChat({ restoredSession });
    await sendMessage('continuation');

    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('restores all messages from a multi-exchange session', () => {
    const restoredSession = {
      sessionId: 'abc',
      entries: [
        { userMessage: 'q1', botResponse: 'a1' },
        { userMessage: 'q2', botResponse: 'a2' },
      ],
    };
    renderChat({ restoredSession });

    expect(screen.getByText('q1')).toBeInTheDocument();
    expect(screen.getByText('a1')).toBeInTheDocument();
    expect(screen.getByText('q2')).toBeInTheDocument();
    expect(screen.getByText('a2')).toBeInTheDocument();
  });
});
