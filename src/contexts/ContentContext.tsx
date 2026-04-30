import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_CONTENT } from '@/lib/siteContent';
import type { SiteContent } from '@/lib/siteContent';

const CACHE_KEY = 'kle_cms_v2';

const Ctx = createContext<SiteContent>(DEFAULT_CONTENT);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => {
    // Hydrate from sessionStorage instantly — zero extra wait on re-navigations
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SiteContent>;
        return {
          hero:     { ...DEFAULT_CONTENT.hero,    ...saved.hero },
          about:    { ...DEFAULT_CONTENT.about,   ...saved.about },
          programs: saved.programs ?? DEFAULT_CONTENT.programs,
          contact:  { ...DEFAULT_CONTENT.contact, ...saved.contact },
        };
      }
    } catch { /* ignore parse errors */ }
    return DEFAULT_CONTENT;
  });

  useEffect(() => {
    // Skip fetch if already hydrated from cache
    if (sessionStorage.getItem(CACHE_KEY)) return;

    fetch('/api/content/site')
      .then(r => (r.ok ? r.json() : null))
      .then((d: { ok: boolean; content: Partial<SiteContent> } | null) => {
        if (!d?.ok || !d.content) return;
        const merged: SiteContent = {
          hero:     { ...DEFAULT_CONTENT.hero,    ...d.content.hero },
          about:    { ...DEFAULT_CONTENT.about,   ...d.content.about },
          programs: d.content.programs ?? DEFAULT_CONTENT.programs,
          contact:  { ...DEFAULT_CONTENT.contact, ...d.content.contact },
        };
        setContent(merged);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d.content)); } catch { /* quota */ }
      })
      .catch(() => null);
  }, []);

  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

/** Use anywhere in the app to read CMS-managed content with default fallbacks. */
export const useContent = () => useContext(Ctx);
