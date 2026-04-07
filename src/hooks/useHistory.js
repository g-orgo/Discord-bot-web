import { useState, useCallback } from 'react';
import { fetchHistory } from '../api/historyApi.js';

export function useHistory(user) {
  const [recentHistory, setRecentHistory] = useState([]);

  const refresh = useCallback(async () => {
    const token = sessionStorage.getItem('raptor_token');
    if (!token) return;
    try {
      const data = await fetchHistory();
      setRecentHistory(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch {
      // silent — sidebar history is non-critical
    }
  }, []);

  function clear() {
    setRecentHistory([]);
  }

  return { recentHistory, refresh, clear };
}
