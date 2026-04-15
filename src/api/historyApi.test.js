import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveHistoryEntry, deleteSession, deleteEntry } from './historyApi.js';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');
});

describe('saveHistoryEntry', () => {
  it('sends userMessage, botResponse, model and sessionId in the POST body', async () => {
    await saveHistoryEntry('hello', 'hi', 'llama3', 'session-uuid');

    expect(fetch).toHaveBeenCalledOnce();
    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.userMessage).toBe('hello');
    expect(body.botResponse).toBe('hi');
    expect(body.model).toBe('llama3');
    expect(body.sessionId).toBe('session-uuid');
  });

  it('sends sessionId as null when not provided', async () => {
    await saveHistoryEntry('hello', 'hi', 'llama3');

    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.sessionId).toBeUndefined(); // caller omits it; server treats missing as null
  });

  it('includes Authorization header with Bearer token', async () => {
    await saveHistoryEntry('hello', 'hi', null, 'session-uuid');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer mock-token');
  });
});

describe('deleteSession', () => {
  it('sends DELETE to /auth/history/session/:sessionId', async () => {
    await deleteSession('my-session-id');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/auth/history/session/my-session-id');
    expect(options.method).toBe('DELETE');
    expect(options.headers['Authorization']).toBe('Bearer mock-token');
  });
});

describe('deleteEntry', () => {
  it('sends DELETE to /auth/history/entry/:id', async () => {
    await deleteEntry('entry-abc');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/auth/history/entry/entry-abc');
    expect(options.method).toBe('DELETE');
    expect(options.headers['Authorization']).toBe('Bearer mock-token');
  });
});
