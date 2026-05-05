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
    hero:         { ...DEFAULT_CONTENT.hero,         ...partial?.hero },
    about:        { ...DEFAULT_CONTENT.about,        ...partial?.about },
    programs:     partial?.programs ?? DEFAULT_CONTENT.programs,
    programs_header: { ...DEFAULT_CONTENT.programs_header, ...partial?.programs_header },
    contact:      { ...DEFAULT_CONTENT.contact,      ...partial?.contact },
    placements:   { ...DEFAULT_CONTENT.placements,   ...partial?.placements },
    facilities:   { ...DEFAULT_CONTENT.facilities,   ...partial?.facilities },
    curriculum:   { ...DEFAULT_CONTENT.curriculum,   ...partial?.curriculum },
    student_life: { ...DEFAULT_CONTENT.student_life, ...partial?.student_life },
    testimonials: { ...DEFAULT_CONTENT.testimonials, ...partial?.testimonials },
    admission:    { ...DEFAULT_CONTENT.admission,    ...partial?.admission },
    footer:       { ...DEFAULT_CONTENT.footer,       ...partial?.footer },
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
    // ALWAYS refetch on mount (stale-while-revalidate). Cache only seeds the
    // first render to avoid a flash of defaults; the network call updates state
    // and cache so visitors on any device/browser see admin edits within one
    // page load — not after the 1h TTL.
    refetch();

    // Refetch when tab becomes visible again (long-lived sessions / SPA back-fwd).
    const onVisible = () => { if (document.visibilityState === 'visible') refetch(); };
    document.addEventListener('visibilitychange', onVisible);

    // Refetch on window focus (catches users who alt-tab back from admin).
    window.addEventListener('focus', refetch);

    // Live update from admin tab in the same browser.
    const unsub = subscribeCmsUpdates(() => {
      clearCache();
      refetch();
    });

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refetch);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

/** Use anywhere in the app to read CMS-managed content with default fallbacks. */
export const useContent = () => useContext(Ctx);
