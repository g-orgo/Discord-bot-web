import { useState, useCallback, useEffect } from 'react';
import { fetchHistory } from '../api/historyApi.js';
import { groupBySessions } from '../utils/sessions.js';

export function useHistory(user) {
  const [recentHistory, setRecentHistory] = useState([]);

  const refresh = useCallback(async () => {
    const token = sessionStorage.getItem('raptor_token');
    if (!token) return;
    try {
      const data = await fetchHistory();
      const sessions = groupBySessions(Array.isArray(data) ? data : []);
      setRecentHistory(sessions.slice(0, 3));
    } catch {
      // silent — sidebar history is non-critical
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  function clear() {
    setRecentHistory([]);
  }

  return { recentHistory, refresh, clear };
}
