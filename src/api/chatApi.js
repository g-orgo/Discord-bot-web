export async function sendMessage(message, userId = null, authToken = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  // Add auth headers if user is authenticated
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function sendMessageStream(message, onToken, onDone, onError, userId = null, authToken = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  // Add auth headers if user is authenticated
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    onError?.(error);
    throw error;
  }

  if (!res.body) {
    const error = new Error('Missing response body');
    onError?.(error);
    throw error;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              onDone?.(data.model);
              return;
            }
            onToken(data.token);
          } catch {
            continue;
          }
        }
      }
    }

    onDone?.();
  } catch (error) {
    onError?.(error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
