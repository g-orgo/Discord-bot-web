import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Chat from './views/Chat';
import Personality from './views/Playground';
import Auth from './views/Auth';
import History from './views/History';
import Profile from './views/Profile';
import { useAuth } from './hooks/useAuth.js';
import { useHistory } from './hooks/useHistory.js';
import { useHistoryStream } from './hooks/useHistoryStream.js';
import './App.css';

export default function App() {
  const { user, handleLogin, handleLogout, updateDiscord } = useAuth();
  const { recentHistory, refresh: refreshHistory, clear: clearRecentHistory } = useHistory(user);
  const [restoredContext, setRestoredContext] = useState(null);

  useHistoryStream(user, refreshHistory);

  function onLogin(data) {
    handleLogin(data);
    refreshHistory();
  }

  function onLogout() {
    handleLogout();
    clearRecentHistory();
    setRestoredContext(null);
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <Nav
          user={user}
          onLogout={onLogout}
          recentHistory={recentHistory}
          onRestoreHistory={entry => setRestoredContext(entry)}
        />
        <main className="layout__main">
          <Routes>
            <Route
              path="/"
              element={
                <Chat
                  user={user}
                  restoredContext={restoredContext}
                  onNewEntry={refreshHistory}
                />
              }
            />
            <Route
              path="/personality"
              element={user ? <Personality /> : <Navigate to="/auth" replace state={{ from: '/personality' }} />}
            />
            <Route
              path="/history"
              element={user ? <History user={user} /> : <Navigate to="/auth" replace state={{ from: '/history' }} />}
            />
            <Route
              path="/profile"
              element={user ? <Profile user={user} onDiscordUpdate={updateDiscord} /> : <Navigate to="/auth" replace state={{ from: '/profile' }} />}
            />
            <Route
              path="/auth"
              element={user ? <Navigate to="/" replace /> : <Auth onLogin={onLogin} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
