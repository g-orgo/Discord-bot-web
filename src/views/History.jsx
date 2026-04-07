import { useState, useEffect } from 'react';
import { fetchHistory, clearHistory as clearHistoryApi } from '../api/historyApi.js';

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchHistory()
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  async function clearHistory() {
    if (!window.confirm('Clear all history? This action cannot be undone.')) return;
    setClearing(true);
    try {
      await clearHistoryApi();
      setEntries([]);
    } finally {
      setClearing(false);
    }
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
        {entries.length > 0 && (
          <button className="history__clear" onClick={clearHistory} disabled={clearing} type="button">
            {clearing ? 'Clearing…' : 'Clear history'}
          </button>
        )}
      </div>

      {loading && <p className="history__empty">Loading…</p>}

      {!loading && entries.length === 0 && (
        <p className="history__empty">No interactions yet. Send a message in Chat!</p>
      )}

      <ul className="history__list">
        {entries.map((entry, i) => (
          <li key={i} className="history__entry">
            <div className="history__meta">
              <span className="history__date">{formatDate(entry.timestamp)}</span>
              {entry.model && <span className="history__model">{entry.model}</span>}
            </div>
            <div className="history__user">
              <span className="history__label">You</span>
              <p className="history__text">{entry.userMessage}</p>
            </div>
            <div className="history__bot">
              <span className="history__label">Raptor</span>
              <p className="history__text">{entry.botResponse}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
