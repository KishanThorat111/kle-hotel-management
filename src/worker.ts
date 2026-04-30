/**
 * Cloudflare Worker — API handler for KLE Hotel Management
 *
 * Routes:
 *   POST /api/enquiry          — save a new enquiry (public)
 *   GET  /api/enquiries        — list all (requires ?pin=ADMIN_PIN)
 *   GET  /api/stats            — summary counts (requires ?pin=ADMIN_PIN)
 *   DELETE /api/enquiry/:id    — delete one (requires ?pin=ADMIN_PIN)
 *
 * Everything else is forwarded to the static SPA assets.
 */

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_PIN: string; // set via: npx wrangler secret put ADMIN_PIN
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function checkPin(env: Env, url: URL): boolean {
  const pin = env.ADMIN_PIN ?? 'KLE2026';
  return url.searchParams.get('pin') === pin;
}

async function initDB(env: Env): Promise<void> {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      phone      TEXT NOT NULL,
      interest   TEXT NOT NULL DEFAULT 'Admission',
      message    TEXT,
      source     TEXT DEFAULT 'popup',
      ip         TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // ─── API routes ──────────────────────────────────────────────────
    if (url.pathname.startsWith('/api/')) {
      try {
        await initDB(env);

        // POST /api/enquiry — save new enquiry
        if (request.method === 'POST' && url.pathname === '/api/enquiry') {
          const body = await request.json() as {
            name?: string; phone?: string;
            interest?: string; message?: string; source?: string;
          };

          if (!body.name?.trim() || !body.phone?.trim()) {
            return json({ ok: false, error: 'Name and phone are required' }, 400);
          }

          const phone = body.phone.replace(/\D/g, '');
          if (phone.length < 10) {
            return json({ ok: false, error: 'Invalid phone number' }, 400);
          }

          await env.DB.prepare(
            `INSERT INTO enquiries (name, phone, interest, message, source, ip, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            body.name.trim().slice(0, 100),
            phone.slice(-10),
            (body.interest ?? 'Admission').slice(0, 50),
            (body.message ?? '').slice(0, 500),
            (body.source ?? 'popup').slice(0, 30),
            request.headers.get('CF-Connecting-IP') ?? '',
            (request.headers.get('User-Agent') ?? '').slice(0, 200),
          ).run();

          return json({ ok: true });
        }

        // GET /api/enquiries — list all (admin)
        if (request.method === 'GET' && url.pathname === '/api/enquiries') {
          if (!checkPin(env, url)) return json({ ok: false, error: 'Unauthorized' }, 401);

          const page  = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
          const limit = 50;
          const offset = (page - 1) * limit;

          const { results } = await env.DB.prepare(
            `SELECT * FROM enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?`
          ).bind(limit, offset).all();

          const { results: countResult } = await env.DB.prepare(
            `SELECT COUNT(*) as total FROM enquiries`
          ).all();

          return json({ ok: true, data: results, total: (countResult[0] as { total: number }).total, page });
        }

        // GET /api/stats
        if (request.method === 'GET' && url.pathname === '/api/stats') {
          if (!checkPin(env, url)) return json({ ok: false, error: 'Unauthorized' }, 401);

          const { results } = await env.DB.prepare(`
            SELECT
              COUNT(*) as total,
              SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today,
              SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as week,
              interest, COUNT(*) as cnt
            FROM enquiries GROUP BY interest
          `).all();

          const total_row = await env.DB.prepare(
            `SELECT COUNT(*) as total,
             SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today,
             SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as week
             FROM enquiries`
          ).first<{ total: number; today: number; week: number }>();

          const by_interest = await env.DB.prepare(
            `SELECT interest, COUNT(*) as cnt FROM enquiries GROUP BY interest ORDER BY cnt DESC`
          ).all();

          return json({ ok: true, ...total_row, by_interest: by_interest.results });
        }

        // DELETE /api/enquiry/:id
        if (request.method === 'DELETE' && url.pathname.startsWith('/api/enquiry/')) {
          if (!checkPin(env, url)) return json({ ok: false, error: 'Unauthorized' }, 401);
          const id = parseInt(url.pathname.split('/').pop() ?? '0');
          if (!id) return json({ ok: false, error: 'Invalid id' }, 400);
          await env.DB.prepare(`DELETE FROM enquiries WHERE id = ?`).bind(id).run();
          return json({ ok: true });
        }

        return json({ ok: false, error: 'Not found' }, 404);
      } catch (err) {
        console.error(err);
        return json({ ok: false, error: 'Server error' }, 500);
      }
    }

    // ─── Static SPA assets ────────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
