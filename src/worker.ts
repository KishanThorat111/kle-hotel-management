/**
 * Cloudflare Worker — API handler for KLE Hotel Management
 *
 * Routes:
 *   POST /api/enquiry          — save a new enquiry (public, rate-limited)
 *   GET  /api/enquiries        — list all (requires Authorization: Bearer <PIN>)
 *   GET  /api/stats            — summary counts (requires Authorization: Bearer <PIN>)
 *   DELETE /api/enquiry/:id    — delete one (requires Authorization: Bearer <PIN>)
 *
 * Everything else is forwarded to the static SPA assets.
 */

export interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  DB: {
    exec(sql: string): Promise<unknown>;
    prepare(sql: string): D1Stmt;
  };
  ADMIN_PIN: string;
}

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  run(): Promise<unknown>;
  all(): Promise<{ results: Record<string, unknown>[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

// ─── Allowed origins (add your custom domain when ready) ─────────────────
const ALLOWED_ORIGINS = [
  'https://kle-hotel-management.kishan-6c3.workers.dev',
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Vary': 'Origin',
  };
}

function json(data: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ─── PIN check via Authorization header (not URL) ─────────────────────────
function checkPin(env: Env, request: Request): boolean {
  const pin = env.ADMIN_PIN ?? 'KLE2026';
  const auth = request.headers.get('Authorization') ?? '';
  // Accept "Bearer <pin>" or legacy "?pin=" for backwards compat during transition
  if (auth.startsWith('Bearer ')) return auth.slice(7) === pin;
  return new URL(request.url).searchParams.get('pin') === pin;
}

// ─── Simple IP-based rate limit (max 5 submissions per IP per hour) ───────
// Uses D1 as a lightweight counter — good enough for a small site
async function isRateLimited(env: Env, ip: string): Promise<boolean> {
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM enquiries
       WHERE ip = ? AND created_at >= datetime('now', '-1 hour')`
    ).bind(ip).first<{ cnt: number }>();
    return (row?.cnt ?? 0) >= 5;
  } catch {
    return false; // fail open — don't block if DB glitches
  }
}

// ─── DB init (idempotent, called once on first request per isolate) ────────
let dbReady = false;
async function ensureDB(env: Env): Promise<void> {
  if (dbReady) return;
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      phone      TEXT NOT NULL,
      interest   TEXT NOT NULL DEFAULT 'Admission',
      message    TEXT DEFAULT '',
      source     TEXT DEFAULT 'popup',
      ip         TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  dbReady = true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ─── API routes ──────────────────────────────────────────────────
    if (url.pathname.startsWith('/api/')) {
      try {
        await ensureDB(env);

        // POST /api/enquiry — save new enquiry
        if (request.method === 'POST' && url.pathname === '/api/enquiry') {
          const body = await request.json() as {
            name?: string; phone?: string;
            interest?: string; message?: string; source?: string;
          };

          if (!body.name?.trim() || !body.phone?.trim()) {
            return json({ ok: false, error: 'Name and phone are required' }, 400, origin);
          }

          const phone = body.phone.replace(/\D/g, '');
          if (phone.length < 10) {
            return json({ ok: false, error: 'Invalid phone number' }, 400, origin);
          }

          const ip = request.headers.get('CF-Connecting-IP') ?? '';
          if (ip && await isRateLimited(env, ip)) {
            return json({ ok: false, error: 'Too many requests. Please try again later.' }, 429, origin);
          }

          // Whitelist interest values
          const allowedInterests = ['Admission', 'Support', 'General'];
          const interest = allowedInterests.includes(body.interest ?? '')
            ? body.interest!
            : 'Admission';

          await env.DB.prepare(
            `INSERT INTO enquiries (name, phone, interest, message, source, ip, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            body.name.trim().slice(0, 100),
            phone.slice(-10),
            interest,
            (body.message ?? '').slice(0, 500),
            'popup',
            ip,
            (request.headers.get('User-Agent') ?? '').slice(0, 200),
          ).run();

          return json({ ok: true }, 200, origin);
        }

        // GET /api/enquiries — list all (admin)
        if (request.method === 'GET' && url.pathname === '/api/enquiries') {
          if (!checkPin(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);

          const page   = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
          const limit  = 50;
          const offset = (page - 1) * limit;

          const { results: rows } = await env.DB.prepare(
            `SELECT id, name, phone, interest, source, created_at FROM enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?`
          ).bind(limit, offset).all();

          const countRow = await env.DB.prepare(
            `SELECT COUNT(*) as total FROM enquiries`
          ).first<{ total: number }>();

          return json({ ok: true, data: rows, total: countRow?.total ?? 0, page }, 200, origin);
        }

        // GET /api/stats
        if (request.method === 'GET' && url.pathname === '/api/stats') {
          if (!checkPin(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);

          const total_row = await env.DB.prepare(
            `SELECT
               COUNT(*) as total,
               SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today,
               SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as week
             FROM enquiries`
          ).first<{ total: number; today: number; week: number }>();

          const { results: by_interest } = await env.DB.prepare(
            `SELECT interest, COUNT(*) as cnt FROM enquiries GROUP BY interest ORDER BY cnt DESC`
          ).all();

          return json({ ok: true, ...total_row, by_interest }, 200, origin);
        }

        // DELETE /api/enquiry/:id
        if (request.method === 'DELETE' && url.pathname.startsWith('/api/enquiry/')) {
          if (!checkPin(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const idStr = url.pathname.split('/').pop() ?? '';
          const id = parseInt(idStr) || 0;
          if (id <= 0) return json({ ok: false, error: 'Invalid id' }, 400, origin);
          await env.DB.prepare(`DELETE FROM enquiries WHERE id = ?`).bind(id).run();
          return json({ ok: true }, 200, origin);
        }

        return json({ ok: false, error: 'Not found' }, 404, origin);
      } catch (err) {
        console.error(err);
        return json({ ok: false, error: 'Server error' }, 500, origin);
      }
    }

    // ─── /admin → serve admin.html ───────────────────────────────────
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      const adminReq = new Request(url.origin + '/admin.html', request);
      return env.ASSETS.fetch(adminReq);
    }

    // ─── Static SPA assets ────────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
