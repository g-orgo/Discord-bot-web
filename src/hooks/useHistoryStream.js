import { useEffect } from 'react';

/**
 * Opens an SSE connection to /auth/history/stream and calls onUpdate
 * whenever a 'history:new' event is received.
 * Automatically reconnects when the connection closes unexpectedly.
 * No-ops when user is not logged in.
 * @param {object|null} user
 * @param {() => void} onUpdate
 */
export function useHistoryStream(user, onUpdate) {
  useEffect(() => {
    if (!user) return;

    const token = sessionStorage.getItem('raptor_token');
    if (!token) return;

    let es;
    let closed = false;
    let reconnectTimer;

    function connect() {
      es = new EventSource(`/auth/history/stream?token=${encodeURIComponent(token)}`);

      es.addEventListener('history:new', () => {
        onUpdate();
      });

      es.onerror = () => {
        es.close();
        if (!closed) {
          // Reconnect after 3s on unexpected close
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [user, onUpdate]);
}
