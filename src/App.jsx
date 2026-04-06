import { useState, useRef, useEffect } from 'react';
import './App.css';

const LLM_URL = import.meta.env.VITE_LLM_URL ?? 'http://localhost:8000';

export default function App() {
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
      const res = await fetch(`${LLM_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
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
    <div className="chat">
      <div className="chat__header">Raptor LLM</div>

      <div className="chat__messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg msg--${m.role}${m.error ? ' msg--thinking' : ''}`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="msg msg--bot msg--thinking">Thinking...</div>}
        <div ref={bottomRef} />
      </div>

      <form className="chat__form" onSubmit={e => { e.preventDefault(); send(); }}>
        <textarea
          className="chat__input"
          rows={1}
          placeholder="Message Raptor..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button className="chat__send" type="submit" disabled={loading || !input.trim()}>
          ?
        </button>
      </form>
    </div>
  );
}
