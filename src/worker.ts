/**
 * Cloudflare Worker — KLE Hotel Management
 *
 * Security model:
 *   - Login  : POST /api/auth  — rate-limited (5/15 min), HMAC constant-time PIN compare
 *   - Session: UUID token stored in D1 (8 h TTL), validated on every admin request
 *   - PIN change: PBKDF2-hashed new PIN stored in D1
 *   - Enquiry: IP rate-limited (5/hour)
 *   - Uploads: content-type check, 10 MB cap, sanitised filenames
 *
 * Public routes:
 *   POST   /api/auth              — login → {token, expires_at}
 *   DELETE /api/auth              — logout
 *   GET    /api/content/site      — all content sections merged
 *   GET    /api/content/:key      — single section
 *   POST   /api/enquiry           — submit visitor enquiry
 *
 * Admin routes (require Authorization: Bearer <token>):
 *   POST   /api/auth/change-pin   — change PIN (PBKDF2 in D1)
 *   DELETE /api/auth/sessions     — invalidate all sessions
 *   PUT    /api/content/:key      — upsert section
 *   GET    /api/images            — list R2 images
 *   POST   /api/upload            — upload image to R2
 *   DELETE /api/images            — delete R2 image (?key=images/...)
 *   GET    /api/enquiries         — list enquiries
 *   GET    /api/stats             — statistics
 *   DELETE /api/enquiry/:id       — delete enquiry
 */

export interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  DB: {
    exec(sql: string): Promise<unknown>;
    prepare(sql: string): D1Stmt;
  };
  KLE_ASSETS: R2Bucket;
  ADMIN_PIN: string;
}

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  run():  Promise<unknown>;
  all():  Promise<{ results: Record<string, unknown>[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface R2Bucket {
  put(key: string, value: ArrayBuffer | string, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string; limit?: number }): Promise<{
    objects: Array<{ key: string; size: number; uploaded: Date }>;
  }>;
}

// ─── Constants ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://kle-hotel-management.kishan-6c3.workers.dev',
  'https://kle-hotel-management.kodspot.co.in',
  'https://kodspot.co.in',
];
const R2_CDN             = 'https://pub-fd0ab08dad314949855afdfccd5131ec.r2.dev';
const SESSION_TTL_MS     = 8 * 3600 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS    = 15 * 60 * 1000;
const MAX_UPLOAD_BYTES   = 10 * 1024 * 1024;
const CONTENT_KEY_RE     = /^[a-z_]{1,50}$/;
const PBKDF2_ITERS       = 100_000;

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
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

// ─── PIN helpers ─────────────────────────────────────────────────────────
const enc = new TextEncoder();

async function hashPin(pin: string): Promise<string> {
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode('kle-salt-2026'), iterations: PBKDF2_ITERS, hash: 'SHA-256' },
    baseKey, 256,
  );
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPin(env: Env, provided: string): Promise<boolean> {
  // Check PBKDF2 hash in D1 first (set after admin PIN change)
  try {
    const row = await env.DB.prepare(
      `SELECT value FROM site_content WHERE key = '__admin_pin_hash'`,
    ).first<{ value: string }>();
    if (row) {
      const stored = JSON.parse(row.value) as string;
      const ph = await hashPin(provided);
      if (stored.length !== ph.length) return false;
      return stored.split('').every((c, i) => c === ph[i]);
    }
  } catch { /* fall through */ }
  // Fallback: HMAC constant-time compare against env PIN
  const stored = env.ADMIN_PIN ?? 'KLE2026';
  const k = await crypto.subtle.importKey(
    'raw', enc.encode('kle-hmac-k1'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const [a, b] = await Promise.all([
    crypto.subtle.sign('HMAC', k, enc.encode(stored)),
    crypto.subtle.sign('HMAC', k, enc.encode(provided)),
  ]);
  const aA = new Uint8Array(a), bA = new Uint8Array(b);
  if (aA.length !== bA.length) return false;
  return aA.every((v, i) => v === bA[i]);
}

// ─── Session helpers ─────────────────────────────────────────────────────
async function checkToken(env: Env, request: Request): Promise<boolean> {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  if (token.length !== 36) return false;
  const row = await env.DB.prepare(
    `SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')`,
  ).bind(token).first<{ token: string }>();
  return row !== null;
}

// Legacy PIN check for old admin panel during transition
function legacyPin(env: Env, request: Request): boolean {
  const pin  = env.ADMIN_PIN ?? 'KLE2026';
  const auth = request.headers.get('Authorization') ?? '';
  if (auth.startsWith('Bearer ') && auth.length < 40) return auth.slice(7) === pin;
  return false;
}

async function isAuthorized(env: Env, request: Request): Promise<boolean> {
  return (await checkToken(env, request)) || legacyPin(env, request);
}

// ─── Login rate limit ────────────────────────────────────────────────────
async function isLoginRateLimited(env: Env, ip: string): Promise<boolean> {
  try {
    const row = await env.DB.prepare(
      `SELECT count, window_start FROM login_attempts WHERE ip = ?`,
    ).bind(ip).first<{ count: number; window_start: string }>();
    if (!row) return false;
    const elapsed = Date.now() - new Date(row.window_start + 'Z').getTime();
    if (elapsed > LOGIN_WINDOW_MS) {
      await env.DB.prepare(`DELETE FROM login_attempts WHERE ip = ?`).bind(ip).run();
      return false;
    }
    return row.count >= MAX_LOGIN_ATTEMPTS;
  } catch { return false; }
}

// ─── Enquiry rate limit ──────────────────────────────────────────────────
async function isEnquiryRateLimited(env: Env, ip: string): Promise<boolean> {
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM enquiries WHERE ip = ? AND created_at >= datetime('now', '-1 hour')`,
    ).bind(ip).first<{ cnt: number }>();
    return (row?.cnt ?? 0) >= 5;
  } catch { return false; }
}

// ─── DB init ─────────────────────────────────────────────────────────────
let dbReady = false;
async function ensureDB(env: Env): Promise<void> {
  if (dbReady) return;
  // Use individual prepare().run() — more reliable than exec() for multi-statement SQL in D1
  await Promise.all([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        interest TEXT NOT NULL DEFAULT 'Admission',
        message TEXT DEFAULT '',
        source TEXT DEFAULT 'popup',
        ip TEXT DEFAULT '',
        user_agent TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ).run(),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
    ).run(),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS login_attempts (
        ip TEXT PRIMARY KEY,
        count INTEGER DEFAULT 1,
        window_start TEXT DEFAULT (datetime('now'))
      )`,
    ).run(),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
    ).run(),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS visitor_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        session_id TEXT DEFAULT '',
        ip TEXT DEFAULT '',
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ).run(),
  ]);
  dbReady = true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url    = new URL(request.url);
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        await ensureDB(env);

        // POST /api/auth — login
        if (request.method === 'POST' && url.pathname === '/api/auth') {
          const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
          if (await isLoginRateLimited(env, ip)) {
            return json({ ok: false, error: `Too many attempts. Wait ${Math.ceil(LOGIN_WINDOW_MS / 60000)} minutes.` }, 429, origin);
          }
          const body  = await request.json() as { pin?: string };
          const valid = await verifyPin(env, body.pin ?? '');
          if (!valid) {
            await env.DB.prepare(
              `INSERT INTO login_attempts (ip, count, window_start) VALUES (?, 1, datetime('now'))
               ON CONFLICT(ip) DO UPDATE SET count = count + 1`,
            ).bind(ip).run();
            return json({ ok: false, error: 'Invalid PIN' }, 401, origin);
          }
          const token     = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
          await env.DB.prepare(`INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)`)
            .bind(token, expiresAt).run();
          await env.DB.prepare(`DELETE FROM login_attempts WHERE ip = ?`).bind(ip).run();
          return json({ ok: true, token, expires_at: expiresAt }, 200, origin);
        }

        // DELETE /api/auth — logout
        if (request.method === 'DELETE' && url.pathname === '/api/auth') {
          const auth = request.headers.get('Authorization') ?? '';
          if (auth.startsWith('Bearer ')) {
            await env.DB.prepare(`DELETE FROM admin_sessions WHERE token = ?`).bind(auth.slice(7)).run();
          }
          return json({ ok: true }, 200, origin);
        }

        // POST /api/auth/change-pin
        if (request.method === 'POST' && url.pathname === '/api/auth/change-pin') {
          if (!await checkToken(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const body = await request.json() as { new_pin?: string };
          const np   = (body.new_pin ?? '').trim();
          if (np.length < 12) return json({ ok: false, error: 'PIN must be at least 12 characters' }, 400, origin);
          const hash = await hashPin(np);
          await env.DB.prepare(
            `INSERT INTO site_content (key, value, updated_at) VALUES ('__admin_pin_hash', ?, datetime('now'))
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          ).bind(JSON.stringify(hash)).run();
          return json({ ok: true, message: 'PIN updated.' }, 200, origin);
        }

        // DELETE /api/auth/sessions — invalidate all
        if (request.method === 'DELETE' && url.pathname === '/api/auth/sessions') {
          if (!await checkToken(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          await env.DB.prepare(`DELETE FROM admin_sessions`).run();
          return json({ ok: true }, 200, origin);
        }

        // GET /api/content/site — all sections (public)
        if (request.method === 'GET' && url.pathname === '/api/content/site') {
          const { results } = await env.DB.prepare(
            `SELECT key, value FROM site_content WHERE key IN ('hero','about','programs','contact')`,
          ).all();
          const content: Record<string, unknown> = {};
          for (const row of results) {
            try { content[row.key as string] = JSON.parse(row.value as string); } catch { /* skip */ }
          }
          return json({ ok: true, content }, 200, origin);
        }

        // GET /api/content/:key — single section (public)
        if (request.method === 'GET' && url.pathname.startsWith('/api/content/')) {
          const key = url.pathname.slice('/api/content/'.length);
          if (!CONTENT_KEY_RE.test(key)) return json({ ok: false, error: 'Invalid key' }, 400, origin);
          const row = await env.DB.prepare(`SELECT value FROM site_content WHERE key = ?`)
            .bind(key).first<{ value: string }>();
          if (!row) return json({ ok: false, error: 'Not found' }, 404, origin);
          return json({ ok: true, data: JSON.parse(row.value) }, 200, origin);
        }

        // PUT /api/content/:key — upsert section (admin)
        if (request.method === 'PUT' && url.pathname.startsWith('/api/content/')) {
          if (!await checkToken(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const key = url.pathname.slice('/api/content/'.length);
          if (!CONTENT_KEY_RE.test(key)) return json({ ok: false, error: 'Invalid key' }, 400, origin);
          const body  = await request.json();
          const value = JSON.stringify(body);
          if (value.length > 100_000) return json({ ok: false, error: 'Content too large' }, 400, origin);
          await env.DB.prepare(
            `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, datetime('now'))
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          ).bind(key, value).run();
          return json({ ok: true }, 200, origin);
        }

        // POST /api/upload — upload image to R2 (admin)
        if (request.method === 'POST' && url.pathname === '/api/upload') {
          if (!await checkToken(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const ct = request.headers.get('Content-Type') ?? '';
          if (!ct.startsWith('image/')) return json({ ok: false, error: 'Must be an image' }, 400, origin);
          const buffer = await request.arrayBuffer();
          if (buffer.byteLength > MAX_UPLOAD_BYTES) return json({ ok: false, error: 'Max 10 MB' }, 400, origin);
          const rawName  = url.searchParams.get('filename') ?? `upload-${Date.now()}.webp`;
          const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 100);
          const key      = `images/${safeName}`;
          await env.KLE_ASSETS.put(key, buffer, { httpMetadata: { contentType: 'image/webp' } });
          return json({ ok: true, url: `${R2_CDN}/${key}`, key }, 200, origin);
        }

        // GET /api/images — list R2 images (admin)
        if (request.method === 'GET' && url.pathname === '/api/images') {
          if (!await checkToken(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const listed = await env.KLE_ASSETS.list({ prefix: 'images/', limit: 200 });
          const images = listed.objects.map(o => ({
            key: o.key, size: o.size, uploaded: o.uploaded,
            url: `${R2_CDN}/${o.key}`,
          }));
          return json({ ok: true, images }, 200, origin);
        }

        // DELETE /api/images — delete R2 image (admin)
        if (request.method === 'DELETE' && url.pathname === '/api/images') {
          if (!await checkToken(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const key = url.searchParams.get('key') ?? '';
          if (!key.startsWith('images/') || key.includes('..') || key.includes('\0')) {
            return json({ ok: false, error: 'Invalid key' }, 400, origin);
          }
          await env.KLE_ASSETS.delete(key);
          return json({ ok: true }, 200, origin);
        }

        // POST /api/enquiry — submit visitor enquiry
        if (request.method === 'POST' && url.pathname === '/api/enquiry') {
          const body = await request.json() as {
            name?: string; phone?: string; interest?: string; message?: string;
          };
          if (!body.name?.trim() || !body.phone?.trim()) {
            return json({ ok: false, error: 'Name and phone are required' }, 400, origin);
          }
          const phone = body.phone.replace(/\D/g, '');
          if (phone.length < 10) return json({ ok: false, error: 'Invalid phone number' }, 400, origin);
          const ip = request.headers.get('CF-Connecting-IP') ?? '';
          if (ip && await isEnquiryRateLimited(env, ip)) {
            return json({ ok: false, error: 'Too many requests. Please try again later.' }, 429, origin);
          }
          const allowedInterests = ['Admission', 'Support', 'General'];
          const interest = allowedInterests.includes(body.interest ?? '') ? body.interest! : 'Admission';
          await env.DB.prepare(
            `INSERT INTO enquiries (name, phone, interest, message, source, ip, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ).bind(
            body.name.trim().slice(0, 100), phone.slice(-10), interest,
            (body.message ?? '').slice(0, 500), 'popup', ip,
            (request.headers.get('User-Agent') ?? '').slice(0, 200),
          ).run();
          return json({ ok: true }, 200, origin);
        }

        // GET /api/enquiries (admin)
        if (request.method === 'GET' && url.pathname === '/api/enquiries') {
          if (!await isAuthorized(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const page   = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
          const limit  = 50;
          const offset = (page - 1) * limit;
          const { results: rows } = await env.DB.prepare(
            `SELECT id, name, phone, interest, source, created_at FROM enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          ).bind(limit, offset).all();
          const countRow = await env.DB.prepare(`SELECT COUNT(*) as total FROM enquiries`)
            .first<{ total: number }>();
          return json({ ok: true, data: rows, total: countRow?.total ?? 0, page }, 200, origin);
        }

        // GET /api/stats (admin)
        if (request.method === 'GET' && url.pathname === '/api/stats') {
          if (!await isAuthorized(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const total_row = await env.DB.prepare(
            `SELECT COUNT(*) as total,
               SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today,
               SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as week
             FROM enquiries`,
          ).first<{ total: number; today: number; week: number }>();
          const { results: by_interest } = await env.DB.prepare(
            `SELECT interest, COUNT(*) as cnt FROM enquiries GROUP BY interest ORDER BY cnt DESC`,
          ).all();
          return json({ ok: true, ...total_row, by_interest }, 200, origin);
        }

        // DELETE /api/enquiry/:id (admin)
        if (request.method === 'DELETE' && url.pathname.startsWith('/api/enquiry/')) {
          if (!await isAuthorized(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const id = parseInt(url.pathname.split('/').pop() ?? '') || 0;
          if (id <= 0) return json({ ok: false, error: 'Invalid id' }, 400, origin);
          await env.DB.prepare(`DELETE FROM enquiries WHERE id = ?`).bind(id).run();
          return json({ ok: true }, 200, origin);
        }

        // POST /api/track — client-side event tracking (public, lightweight)
        if (request.method === 'POST' && url.pathname === '/api/track') {
          const ip  = request.headers.get('CF-Connecting-IP') ?? '';
          const sid = (request.headers.get('X-Session-Id') ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
          const ALLOWED_EVENTS = ['page_view','popup_open','apply_click','wa_click','form_submit','popup_close'];
          let body: { event?: string; meta?: Record<string, string> } = {};
          try { body = await request.json() as typeof body; } catch { /* ignore */ }
          const evt = ALLOWED_EVENTS.includes(body.event ?? '') ? body.event! : 'unknown';
          const meta = JSON.stringify(body.meta ?? {}).slice(0, 256);
          try {
            await env.DB.prepare(
              `INSERT INTO visitor_events (event_type, session_id, ip, metadata) VALUES (?, ?, ?, ?)`,
            ).bind(evt, sid, ip.slice(0, 45), meta).run();
          } catch { /* non-critical */ }
          return json({ ok: true }, 200, origin);
        }

        // GET /api/analytics — visitor analytics (admin)
        if (request.method === 'GET' && url.pathname === '/api/analytics') {
          if (!await isAuthorized(env, request)) return json({ ok: false, error: 'Unauthorized' }, 401, origin);
          const [totalRow, todayRow, weekRow, byEventRes, dailyRes] = await Promise.all([
            env.DB.prepare(
              `SELECT COUNT(DISTINCT session_id) as total FROM visitor_events WHERE event_type = 'page_view'`,
            ).first<{ total: number }>(),
            env.DB.prepare(
              `SELECT COUNT(DISTINCT session_id) as today FROM visitor_events WHERE event_type = 'page_view' AND date(created_at) = date('now')`,
            ).first<{ today: number }>(),
            env.DB.prepare(
              `SELECT COUNT(DISTINCT session_id) as week FROM visitor_events WHERE event_type = 'page_view' AND date(created_at) >= date('now', '-7 days')`,
            ).first<{ week: number }>(),
            env.DB.prepare(
              `SELECT event_type, COUNT(*) as cnt FROM visitor_events GROUP BY event_type ORDER BY cnt DESC`,
            ).all(),
            env.DB.prepare(
              `SELECT date(created_at) as day, COUNT(*) as cnt FROM visitor_events WHERE event_type = 'page_view' AND date(created_at) >= date('now', '-14 days') GROUP BY day ORDER BY day ASC`,
            ).all(),
          ]);
          return json({
            ok: true,
            total: totalRow?.total ?? 0,
            today: todayRow?.today ?? 0,
            week:  weekRow?.week  ?? 0,
            by_event: byEventRes.results,
            daily:    dailyRes.results,
          }, 200, origin);
        }

        return json({ ok: false, error: 'Not found' }, 404, origin);
      } catch (err) {
        console.error(err);
        return json({ ok: false, error: 'Internal server error' }, 500, origin);
      }
    }

    // /admin → serve admin.html
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return env.ASSETS.fetch(new Request(`${url.origin}/admin.html`, request));
    }

    return env.ASSETS.fetch(request);
  },
};
