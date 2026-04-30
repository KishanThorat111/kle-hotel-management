import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_CONTENT } from '@/lib/siteContent';
import type { SiteContent } from '@/lib/siteContent';
import { subscribeCmsUpdates } from '@/lib/cmsBroadcast';

const CACHE_KEY = 'kle_cms_v3';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

type CachedShape = { ts: number; content: Partial<SiteContent> };

const Ctx = createContext<SiteContent>(DEFAULT_CONTENT);

function merge(partial: Partial<SiteContent> | undefined): SiteContent {
  return {
    hero:     { ...DEFAULT_CONTENT.hero,    ...partial?.hero },
    about:    { ...DEFAULT_CONTENT.about,   ...partial?.about },
    programs: partial?.programs ?? DEFAULT_CONTENT.programs,
    contact:  { ...DEFAULT_CONTENT.contact, ...partial?.contact },
  };
}

function readCache(): Partial<SiteContent> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedShape;
    if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.content ?? null;
  } catch { return null; }
}

function writeCache(content: Partial<SiteContent>) {
  try {
    const payload: CachedShape = { ts: Date.now(), content };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch { /* quota */ }
}

function clearCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => merge(readCache() ?? undefined));

  const refetch = () => {
    fetch('/api/content/site', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { ok: boolean; content: Partial<SiteContent> } | null) => {
        if (!d?.ok || !d.content) return;
        setContent(merge(d.content));
        writeCache(d.content);
      })
      .catch(() => null);
  };

  useEffect(() => {
    // Refetch on mount only when cache is stale/missing
    if (!readCache()) refetch();

    // Live update from admin tab
    const unsub = subscribeCmsUpdates(() => {
      clearCache();
      refetch();
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

/** Use anywhere in the app to read CMS-managed content with default fallbacks. */
export const useContent = () => useContext(Ctx);
