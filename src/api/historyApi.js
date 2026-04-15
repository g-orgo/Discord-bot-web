function getToken() {
  return sessionStorage.getItem('raptor_token');
}

export async function fetchHistory() {
  const res = await fetch('/auth/history', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveHistoryEntry(userMessage, botResponse, model, sessionId) {
  return fetch('/auth/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ userMessage, botResponse, model, sessionId }),
  });
}

export async function patchSessionId(id, sessionId) {
  return fetch(`/auth/history/${id}/session`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ sessionId }),
  });
}

export async function clearHistory() {
  return fetch('/auth/history', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
