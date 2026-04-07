import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Chat from './views/Chat';
import Personality from './views/Playground';
import Auth from './views/Auth';
import History from './views/History';
import './App.css';

function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('raptor_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    sessionStorage.removeItem('raptor_token');
    sessionStorage.removeItem('raptor_user');
    setUser(null);
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <Nav user={user} onLogout={handleLogout} />
        <main className="layout__main">
          <Routes>
            <Route path="/" element={<Chat user={user} />} />
            <Route
              path="/personality"
              element={user ? <Personality /> : <Navigate to="/auth" replace state={{ from: '/personality' }} />}
            />
            <Route
              path="/history"
              element={user ? <History /> : <Navigate to="/auth" replace state={{ from: '/history' }} />}
            />
            <Route
              path="/auth"
              element={user ? <Navigate to="/" replace /> : <Auth onLogin={handleLogin} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
