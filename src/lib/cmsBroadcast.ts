/**
 * Cross-tab CMS sync.
 * Admin tab calls broadcastCmsUpdate() after a successful save.
 * Public website tabs listen via subscribeCmsUpdates() and refetch content.
 *
 * Falls back to a localStorage event when BroadcastChannel is unavailable.
 */

const CHANNEL_NAME = 'kle-cms';
const PING_KEY     = 'kle_cms_ping';

export type CmsMessage = { type: 'updated'; section?: string; ts: number };

export function broadcastCmsUpdate(section?: string) {
  const msg: CmsMessage = { type: 'updated', section, ts: Date.now() };
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage(msg);
    ch.close();
  } catch { /* fallback below */ }
  // Fallback for older browsers — fires `storage` event in other tabs
  try { localStorage.setItem(PING_KEY, JSON.stringify(msg)); } catch { /* ignore */ }
}

export function subscribeCmsUpdates(handler: (msg: CmsMessage) => void): () => void {
  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (e) => { if (e.data?.type === 'updated') handler(e.data); };
  } catch { /* ignore */ }

  const onStorage = (e: StorageEvent) => {
    if (e.key === PING_KEY && e.newValue) {
      try {
        const msg = JSON.parse(e.newValue) as CmsMessage;
        if (msg?.type === 'updated') handler(msg);
      } catch { /* ignore */ }
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    if (ch) try { ch.close(); } catch { /* ignore */ }
    window.removeEventListener('storage', onStorage);
  };
}
