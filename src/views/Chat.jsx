import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../api/chatApi.js';
import { saveHistoryEntry } from '../api/historyApi.js';

export default function Chat({ user, restoredContext, onNewEntry }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!restoredContext) return;
    setMessages([
      { role: 'user', text: restoredContext.userMessage },
      { role: 'bot', text: restoredContext.botResponse, model: restoredContext.model },
    ]);
  }, [restoredContext]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const data = await sendMessage(text);
      const botMessage = { role: 'bot', text: data.response, model: data.model };
      setMessages(prev => [...prev, botMessage]);

      if (user) {
        saveHistoryEntry(text, data.response, data.model).then(() => onNewEntry?.()).catch(() => {});
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
        {messages.length > 0 && (
          <button
            type="button"
            className="chat__new"
            onClick={() => setMessages([])}
          >
            Novo chat
          </button>
        )}
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
