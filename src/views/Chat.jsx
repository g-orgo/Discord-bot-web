import { useState, useRef, useEffect } from 'react';
import { sendMessageStream } from '../api/chatApi.js';
import { saveHistoryEntry } from '../api/historyApi.js';

export default function Chat({ user, restoredSession, onNewEntry }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const sessionIdRef = useRef(crypto.randomUUID());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!restoredSession) return;
    sessionIdRef.current = restoredSession.sessionId ?? crypto.randomUUID();
    const restored = [];
    for (const entry of restoredSession.entries) {
      restored.push({ role: 'user', text: entry.userMessage });
      restored.push({ role: 'bot', text: entry.botResponse });
    }
    setMessages(restored);
  }, [restoredSession]);

  async function send() {
    const text = input.trim();
    if (!text || loading || streaming) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    let fullText = '';
    let firstToken = true;

    try {
      await sendMessageStream(
        text,
        (token) => {
          fullText += token;
          if (firstToken) {
            firstToken = false;
            setLoading(false);
            setStreaming(true);
            setMessages(prev => [...prev, { role: 'bot', text: fullText }]);
          } else {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'bot', text: fullText };
              return updated;
            });
          }
        },
        (model) => {
          setStreaming(false);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'bot', text: fullText, model };
            return updated;
          });
          if (user) {
            saveHistoryEntry(text, fullText, model, sessionIdRef.current).then(() => onNewEntry?.()).catch(() => {});
          }
        }
      );
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Failed to reach Raptor LLM.', error: true }]);
    } finally {
      setLoading(false);
      setStreaming(false);
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
            onClick={() => { setMessages([]); sessionIdRef.current = crypto.randomUUID(); }}
          >
            New chat
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
          disabled={loading || streaming}
        />
        <button className="chat__send" type="submit" disabled={loading || streaming || !input.trim()}>
          ↑
        </button>
      </form>
    </div>
  );
}
