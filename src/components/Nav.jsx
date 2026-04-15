import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { latestEntry } from '../utils/sessions.js';

const BASE_LINKS = [
  { to: '/', label: 'Chat', icon: '💬' },
  { to: '/personality', label: 'Personality', icon: '🎭' },
];

export default function Nav({ user, onLogout, recentHistory, onRestoreHistory }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const navigate = useNavigate();

  function handleRestore(entry) {
    onRestoreHistory(entry);
    navigate('/');
    setHistoryOpen(false);
  }

  function truncate(text, max = 32) {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  return (
    <nav className="nav">
      <div className="nav__logo">Raptor LLM</div>
      <ul className="nav__links">
        {BASE_LINKS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
            >
              <span className="nav__icon">{icon}</span>
              <span className="nav__label">{label}</span>
            </NavLink>
          </li>
        ))}

        <li className={`nav__dropdown-item${historyOpen ? ' nav__dropdown-item--open' : ''}`}>
          <div className="nav__link nav__dropdown-trigger">
            <NavLink
              to="/history"
              className={({ isActive }) => `nav__dropdown-main${isActive ? ' nav__link--active' : ''}`}
            >
              <span className="nav__icon">📋</span>
              <span className="nav__label">History</span>
            </NavLink>
            {user && recentHistory.length > 0 && (
              <button
                type="button"
                className="nav__dropdown-chevron"
                onClick={() => setHistoryOpen(o => !o)}
                aria-label="Expand history"
              >
                {historyOpen ? '▴' : '▾'}
              </button>
            )}
          </div>

          {user && historyOpen && recentHistory.length > 0 && (
            <ul className="nav__dropdown-list">
              {recentHistory.map((session, i) => {
                const preview = latestEntry(session);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className="nav__dropdown-entry"
                      onClick={() => handleRestore(session)}
                      title={preview.userMessage}
                    >
                      {truncate(preview.userMessage)}
                      {session.entries.length > 1 && (
                        <span className="nav__dropdown-count">{session.entries.length}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      </ul>

      <div className="nav__bottom">
        {user ? (
          <div className="nav__user">
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav__user-name nav__user-link${isActive ? ' nav__link--active' : ''}`}
            >
              {user.displayName}
              {user.discordUsername && <span className="nav__discord-badge" title={`Discord: ${user.discordUsername}`}>🎮</span>}
            </NavLink>
            <button className="nav__logout" onClick={onLogout} type="button">
              Sign out
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth"
            className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
          >
            <span className="nav__icon">🔑</span>
            <span className="nav__label">Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
