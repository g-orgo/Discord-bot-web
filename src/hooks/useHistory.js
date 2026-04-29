import { useState, useCallback, useEffect } from 'react';
import { fetchHistory } from '../api/historyApi.js';
import { groupBySessions } from '../utils/sessions.js';

export function useHistory(user) {
  const [recentHistory, setRecentHistory] = useState([]);

  const refresh = useCallback(async () => {
    const token = sessionStorage.getItem('raptor_token');
    if (!token) return null;
    try {
      const data = await fetchHistory();
      const sessions = groupBySessions(Array.isArray(data) ? data : []);
      const next = sessions.slice(0, 3);
      setRecentHistory(next);
      return next;
    } catch {
      // silent — sidebar history is non-critical
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, refresh]);

  function clear() {
    setRecentHistory([]);
  }

  return { recentHistory, refresh, clear };
}
