import { useState, useRef, useEffect } from 'react';

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const botMessage = { role: 'bot', text: data.response, model: data.model };
      setMessages(prev => [...prev, botMessage]);

      if (user) {
        const token = sessionStorage.getItem('raptor_token');
        fetch('/auth/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userMessage: text, botResponse: data.response, model: data.model }),
        }).catch(() => {});
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Failed to reach Raptor LLM.', error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="view chat-view">
      <div className="view__header">
        <h1 className="view__title">Chat</h1>
        <p className="view__subtitle">Messages are rewritten by the AI using the active system prompt.</p>
      </div>

      <div className="chat__messages">
        {messages.length === 0 && (
          <p className="chat__empty">Type a message below to get started.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}${m.error ? ' msg--error' : ''}`}>
            <div className="msg__text">{m.text}</div>
            {m.model && <div className="msg__meta">{m.model}</div>}
          </div>
        ))}
        {loading && (
          <div className="msg msg--bot msg--thinking">
            <div className="msg__text">Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat__form" onSubmit={e => { e.preventDefault(); send(); }}>
        <textarea
          className="chat__input"
          rows={1}
          placeholder="Message Raptor…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button className="chat__send" type="submit" disabled={loading || !input.trim()}>
          ↑
        </button>
      </form>
    </div>
  );
}
