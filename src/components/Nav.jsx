import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Chat', icon: '💬' },
  { to: '/personality', label: 'Personalidade', icon: '🎭' },
];

export default function Nav({ user, onLogout }) {
  return (
    <nav className="nav">
      <div className="nav__logo">Raptor LLM</div>
      <ul className="nav__links">
        {NAV_LINKS.map(({ to, label, icon }) => (
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
      </ul>

      <div className="nav__bottom">
        {user ? (
          <div className="nav__user">
            <span className="nav__user-name">{user.displayName}</span>
            <button className="nav__logout" onClick={onLogout} type="button">
              Sair
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
