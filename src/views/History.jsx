import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistory, clearHistory as clearHistoryApi, deleteSession, deleteEntry } from '../api/historyApi.js';
import { useHistoryStream } from '../hooks/useHistoryStream.js';
import { groupBySessions, latestEntry } from '../utils/sessions.js';

export default function History({ user, onRestoreHistory }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState(null);

  const load = useCallback(() => {
    fetchHistory()
      .then(data => setSessions(groupBySessions(Array.isArray(data) ? data : [])))
      .catch(err => {
        console.error('[History] Failed to fetch history:', err);
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useHistoryStream(user, load);

  async function clearHistory() {
    if (!window.confirm('Clear all history? This action cannot be undone.')) return;
    setClearing(true);
    try {
      await clearHistoryApi();
      setSessions([]);
    } finally {
      setClearing(false);
    }
  }

  async function deleteSessionItem(session, index) {
    setDeletingIdx(index);
    try {
      if (session.sessionId) {
        await deleteSession(session.sessionId);
      } else {
        await deleteEntry(session.entries[0].id);
      }
      setSessions(prev => prev.filter((_, i) => i !== index));
    } catch {
      // silent — list stays intact on failure
    } finally {
      setDeletingIdx(null);
    }
  }

  function restoreSession(session) {
    onRestoreHistory(session);
    navigate('/');
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="view history-view">
      <div className="view__header">
        <h1 className="view__title">History</h1>
        <p className="view__subtitle">Your latest interactions with Raptor LLM.</p>
        {sessions.length > 0 && (
          <button className="history__clear" onClick={clearHistory} disabled={clearing} type="button">
            {clearing ? 'Clearing…' : 'Clear history'}
          </button>
        )}
      </div>

      {loading && <p className="history__empty">Loading…</p>}

      {!loading && sessions.length === 0 && (
        <p className="history__empty">No history yet. Start chatting!</p>
      )}

      <ul className="history__list">
        {sessions.map((session, si) => {
          const last = latestEntry(session);
          const isDeleting = deletingIdx === si;
          return (
            <li key={si} className="history__entry">
              <div className="history__meta">
                <span className="history__date">{formatDate(last.timestamp)}</span>
                {session.entries.length > 1 && (
                  <span className="history__exchanges-count">
                    {session.entries.length} exchanges
                  </span>
                )}
                {last.source === 'discord' && (
                  <span className="history__source history__source--discord">🎮 Discord</span>
                )}
                <div className="history__actions">
                  {onRestoreHistory && last.source !== 'discord' && (
                    <button
                      type="button"
                      className="history__restore"
                      onClick={() => restoreSession(session)}
                      disabled={isDeleting}
                    >
                      💬 Open in Chat
                    </button>
                  )}
                  <button
                    type="button"
                    className="history__delete"
                    onClick={() => deleteSessionItem(session, si)}
                    disabled={isDeleting}
                    aria-label="Delete session"
                  >
                    {isDeleting ? '…' : '🗑'}
                  </button>
                </div>
              </div>

              {/* Show all exchanges in session */}
              {session.entries && session.entries.length > 0 && (
                <div className="history__exchanges">
                  {session.entries.map((entry, ei) => (
                    <div key={ei} className="history__exchange">
                      <div className="history__user">
                        <span className="history__label">You</span>
                        <p className="history__text">{entry.userMessage}</p>
                      </div>
                      <div className="history__bot">
                        <span className="history__label">Raptor</span>
                        <p className="history__text">{entry.botResponse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
