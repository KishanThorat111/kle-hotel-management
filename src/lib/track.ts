/**
 * Client-side event tracking — fires POST /api/track.
 * Session ID is a UUID stored in localStorage (anonymous, no PII).
 */
const VID_KEY = 'kle_vid';

function getVid(): string {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch { return 'anon'; }
}

export function track(event: string, meta?: Record<string, string>): void {
  try {
    const vid = getVid();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Id': vid },
      body: JSON.stringify({ event, meta }),
    }).catch(() => null);
  } catch { /* ignore */ }
}
