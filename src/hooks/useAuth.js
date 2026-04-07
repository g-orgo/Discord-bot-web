import { useState } from 'react';

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('raptor_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  sessionStorage.setItem('raptor_token', data.token);
  sessionStorage.setItem('raptor_user', JSON.stringify({ email: data.email, displayName: data.displayName }));
}

function clearSession() {
  sessionStorage.removeItem('raptor_token');
  sessionStorage.removeItem('raptor_user');
}

export function useAuth() {
  const [user, setUser] = useState(getStoredUser);

  function handleLogin(data) {
    saveSession(data);
    setUser({ email: data.email, displayName: data.displayName });
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  return { user, handleLogin, handleLogout };
}
