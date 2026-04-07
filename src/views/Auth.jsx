import { useState } from 'react';
import { login, register } from '../api/authApi.js';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      onLogin?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">E-mail</span>
        <input
          className="field__input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <label className="field">
        <span className="field__label">Password</span>
        <input
          className="field__input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      {error && <div className="alert alert--error">{error}</div>}
      <button
        className="btn btn--primary btn--full"
        type="submit"
        disabled={loading || !email.trim() || !password}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function RegisterForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await register(email, password, displayName.trim());
      onLogin?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim() && displayName.trim() && password && confirm && !loading;

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Name</span>
        <input
          className="field__input"
          type="text"
          autoComplete="name"
          placeholder="What should we call you?"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <label className="field">
        <span className="field__label">E-mail</span>
        <input
          className="field__input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <label className="field">
        <span className="field__label">Password</span>
        <input
          className="field__input"
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      <label className="field">
        <span className="field__label">Confirm password</span>
        <input
          className="field__input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          disabled={loading}
          required
        />
      </label>
      {error && <div className="alert alert--error">{error}</div>}
      <button
        className="btn btn--primary btn--full"
        type="submit"
        disabled={!canSubmit}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState('login');

  return (
    <div className="view auth-view">
      <div className="auth-card">
        <div className="auth-card__logo">🦅 Raptor</div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Sign in
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Register
          </button>
        </div>

        {tab === 'login'
          ? <LoginForm onLogin={onLogin} />
          : <RegisterForm onLogin={onLogin} />
        }
      </div>
    </div>
  );
}
