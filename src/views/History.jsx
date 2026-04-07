import { useState, useEffect } from 'react';

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  function getToken() {
    return sessionStorage.getItem('raptor_token');
  }

  useEffect(() => {
    fetch('/auth/history', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setEntries(Array.isArray(data) ? data.slice().reverse() : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  async function clearHistory() {
    if (!window.confirm('Limpar todo o histórico? Esta ação não pode ser desfeita.')) return;
    setClearing(true);
    try {
      await fetch('/auth/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setEntries([]);
    } finally {
      setClearing(false);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="view history-view">
      <div className="view__header">
        <h1 className="view__title">Histórico</h1>
        <p className="view__subtitle">Suas últimas interações com o Raptor LLM.</p>
        {entries.length > 0 && (
          <button className="history__clear" onClick={clearHistory} disabled={clearing} type="button">
            {clearing ? 'Limpando…' : 'Limpar histórico'}
          </button>
        )}
      </div>

      {loading && <p className="history__empty">Carregando…</p>}

      {!loading && entries.length === 0 && (
        <p className="history__empty">Nenhuma interação registrada ainda. Envie uma mensagem no Chat!</p>
      )}

      <ul className="history__list">
        {entries.map((entry, i) => (
          <li key={i} className="history__entry">
            <div className="history__meta">
              <span className="history__date">{formatDate(entry.timestamp)}</span>
              {entry.model && <span className="history__model">{entry.model}</span>}
            </div>
            <div className="history__user">
              <span className="history__label">Você</span>
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
