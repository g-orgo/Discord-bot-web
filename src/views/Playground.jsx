import { useState, useEffect } from 'react';

const PRESETS = [
  {
    id: 'empathetic',
    label: 'Empathetic',
    emoji: '🤗',
    description: 'Warm, welcoming, and receptive. Rewrites messages with empathy and a gentle tone.',
    prompt:
      'You are an empathetic and welcoming communication assistant. Rewrite the user\'s message in a warmer, kinder, and more receptive way, keeping the original meaning intact. Always respond in modern English. Use a casual, friendly tone. Reply with the rewritten message only — no explanations.',
  },
  {
    id: 'professional',
    label: 'Professional',
    emoji: '💼',
    description: 'Formal, objective, and clear. Ideal for corporate emails and business communications.',
    prompt:
      'You are a professional communication assistant. Rewrite the user\'s message in a formal, clear, and concise way suitable for business communication. Always respond in English. Reply with the rewritten message only — no explanations.',
  },
  {
    id: 'casual',
    label: 'Casual',
    emoji: '😎',
    description: 'Relaxed, direct, and with personality. Uses modern slang sparingly.',
    prompt:
      'You are a casual and friendly communication assistant. Rewrite the user\'s message in a relaxed, conversational way with a bit of personality. Use modern slang sparingly. Always respond in English. Reply with the rewritten message only — no explanations.',
  },
  {
    id: 'concise',
    label: 'Concise',
    emoji: '⚡',
    description: 'Gets straight to the point. Removes any redundancy without losing the meaning.',
    prompt:
      'You are a concise communication assistant. Rewrite the user\'s message as briefly as possible without losing the core meaning. Cut every unnecessary word. Always respond in English. Reply with the rewritten message only — no explanations.',
  },
  {
    id: 'creative',
    label: 'Creative',
    emoji: '🎨',
    description: 'Expressive and original. Adds metaphors, vividness, and a unique touch.',
    prompt:
      'You are a creative communication assistant. Rewrite the user\'s message in an expressive, vivid, and original way — use metaphors and colorful language where fitting. Always respond in English. Reply with the rewritten message only — no explanations.',
  },
  {
    id: 'custom',
    label: 'Custom',
    emoji: '✏️',
    description: 'Define your own personality instruction.',
    prompt: '',
  },
];

export default function Personality() {
  const [selected, setSelected] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/system-prompt')
      .then(r => r.json())
      .then(data => {
        setCurrentPrompt(data.prompt);
        const match = PRESETS.find(p => p.id !== 'custom' && p.prompt === data.prompt);
        if (match) {
          setSelected(match.id);
        } else {
          setSelected('custom');
          setCustomPrompt(data.prompt);
        }
      })
      .catch(() => setFeedback({ type: 'error', text: 'Could not load the current personality.' }))
      .finally(() => setLoading(false));
  }, []);

  function selectPreset(preset) {
    setSelected(preset.id);
    setFeedback(null);
    if (preset.id !== 'custom') setCustomPrompt('');
  }

  function getActivePrompt() {
    if (selected === 'custom') return customPrompt.trim();
    return PRESETS.find(p => p.id === selected)?.prompt ?? '';
  }

  async function apply() {
    const prompt = getActivePrompt();
    if (!prompt) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/system-prompt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCurrentPrompt(prompt);
      setFeedback({ type: 'success', text: 'Personality applied successfully!' });
    } catch {
      setFeedback({ type: 'error', text: 'Failed to save. Make sure the server is running.' });
    } finally {
      setSaving(false);
    }
  }

  const activePrompt = getActivePrompt();
  const isDirty = activePrompt !== currentPrompt;

  return (
    <div className="view">
      <div className="view__header">
        <h1 className="view__title">Personality</h1>
        <p className="view__subtitle">Choose how the bot communicates when rewriting your messages.</p>
      </div>

      {loading ? (
        <p className="settings__loading">Loading…</p>
      ) : (
        <div className="personality">
          <div className="personality__presets">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                className={`preset-card${selected === preset.id ? ' preset-card--active' : ''}`}
                onClick={() => selectPreset(preset)}
                type="button"
              >
                <span className="preset-card__emoji">{preset.emoji}</span>
                <span className="preset-card__label">{preset.label}</span>
                <span className="preset-card__desc">{preset.description}</span>
              </button>
            ))}
          </div>

          {selected === 'custom' && (
            <label className="field">
              <span className="field__label">Personality instruction</span>
              <textarea
                className="field__textarea field__textarea--tall"
                rows={6}
                placeholder="Ex: You are a pirate assistant. Rewrite the message in pirate speak..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                disabled={saving}
              />
            </label>
          )}

          {feedback && (
            <div className={`alert alert--${feedback.type}`}>{feedback.text}</div>
          )}

          <button
            className="btn btn--primary"
            onClick={apply}
            disabled={saving || !activePrompt || !isDirty}
          >
            {saving ? 'Applying…' : 'Apply personality'}
          </button>
        </div>
      )}
    </div>
  );
}
