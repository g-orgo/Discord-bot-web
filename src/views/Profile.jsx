import { useState } from 'react';
import { updateProfile } from '../api/authApi.js';

export default function Profile({ user, onDiscordUpdate }) {
  const [username, setUsername] = useState(user?.discordUsername ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await updateProfile(username.trim() || null);
      onDiscordUpdate?.(data.discordUsername);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view profile-view">
      <div className="view__header">
        <h1 className="view__title">Profile</h1>
        <p className="view__subtitle">Configure your account and integrations.</p>
      </div>

      <div className="profile__card">
        <div className="profile__info">
          <span className="profile__label">Name</span>
          <span className="profile__value">{user?.displayName}</span>
        </div>
        <div className="profile__info">
          <span className="profile__label">E-mail</span>
          <span className="profile__value">{user?.email}</span>
        </div>
      </div>

      <div className="profile__section">
        <h2 className="profile__section-title">Discord Integration</h2>
        <p className="profile__section-desc">
          Enter your Discord username so your bot conversations are recorded
          here in the history.
        </p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Discord username</span>
            <input
              className="field__input"
              type="text"
              placeholder="e.g. myusername"
              value={username}
              onChange={e => { setUsername(e.target.value); setSuccess(false); }}
              disabled={loading}
              autoComplete="off"
            />
          </label>
          {error && <div className="alert alert--error">{error}</div>}
          {success && <div className="alert alert--success">Saved successfully!</div>}
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          {username.trim() && (
            <button
              className="btn btn--ghost"
              type="button"
              disabled={loading}
              onClick={() => { setUsername(''); setSuccess(false); }}
            >
              Remove integration
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
