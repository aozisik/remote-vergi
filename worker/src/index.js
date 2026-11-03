// Remote Vergi — YMM tasdik fee crowdsourcing API.
// One Cloudflare Worker + D1 (SQLite). No framework, no ORM.
//
// Routes:
//   POST /quote        public  -> submit one anonymous quote
//   GET  /aggregates   public  -> medians/ranges/anonymous fee arrays per bracket
//   GET  /admin/list   admin   -> recent rows (moderation)
//   POST /admin/hide   admin   -> hide a row by id  { id }
//
// Privacy: raw rows never leave the DB. /aggregates returns only numbers
// (fee values are anonymous integers used for the client-side percentile).

// Yıllık ciro (hasılat) aralıkları. Keep in sync with src/scripts/ymm.ts.
const BRACKETS = ['0-1.5m', '1.5m-3m', '3m-6m', '6m-12m', '12m+'];
const YEARS = [2025, 2026, 2027];

const FEE_MIN = 1_000;
const FEE_MAX = 10_000_000;
const REVENUE_MAX = 1_000_000_000; // yıllık ciro üst sınırı (sanity)
const RATE_LIMIT = 8; // max submissions per IP per rolling hour

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      ...corsOrigin(request, env),
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      Vary: 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (request.method === 'POST' && url.pathname === '/quote') {
        return await submitQuote(request, env, cors);
      }
      if (request.method === 'GET' && url.pathname === '/aggregates') {
        return await getAggregates(env, cors);
      }
      if (url.pathname === '/admin/list' || url.pathname === '/admin/hide') {
        return await admin(request, env, url, cors);
      }
      return json({ error: 'not_found' }, 404, cors);
    } catch (err) {
      return json({ error: 'server_error', detail: String(err) }, 500, cors);
    }
  },
};

async function submitQuote(request, env, cors) {
  const body = await request.json().catch(() => ({}));

  // Honeypot: bots fill hidden fields.
  if (body.website) return json({ ok: true }, 200, cors);

  const fee = Math.round(Number(body.fee));
  const bracket = String(body.bracket || '');
  if (!BRACKETS.includes(bracket)) return json({ error: 'bad_bracket' }, 400, cors);
  if (!Number.isFinite(fee) || fee < FEE_MIN || fee > FEE_MAX) {
    return json({ error: 'bad_fee' }, 400, cors);
  }

  const year = YEARS.includes(Number(body.year)) ? Number(body.year) : null;
  const annualRev = Math.round(Number(body.annual_revenue));
  const annual_revenue =
    Number.isFinite(annualRev) && annualRev > 0 && annualRev <= REVENUE_MAX
      ? annualRev
      : null;

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ip_hash = await sha256(ip + '|remote-vergi');

  // Light rate limit: count this IP's submissions in the last hour.
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM quotes WHERE ip_hash = ? AND created_at > datetime('now','-1 hour')",
  )
    .bind(ip_hash)
    .first();
  if (recent && recent.n >= RATE_LIMIT) {
    return json({ error: 'rate_limited' }, 429, cors);
  }

  await env.DB.prepare(
    `INSERT INTO quotes (bracket, fee, annual_revenue, year, ip_hash)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(bracket, fee, annual_revenue, year, ip_hash)
    .run();

  return json({ ok: true }, 201, cors);
}

async function getAggregates(env, cors) {
  const { results } = await env.DB.prepare(
    "SELECT bracket, fee FROM quotes WHERE status = 'approved' ORDER BY bracket, fee",
  ).all();

  const byBracket = {};
  for (const key of BRACKETS) byBracket[key] = [];
  for (const row of results || []) {
    if (byBracket[row.bracket]) byBracket[row.bracket].push(row.fee);
  }

  const brackets = {};
  let total = 0;
  for (const key of BRACKETS) {
    const all = byBracket[key];
    total += all.length;
    const fees = trimOutliers(all); // IQR fence: defends median against gamed extremes
    brackets[key] =
      fees.length === 0
        ? { n: 0 }
        : {
            n: fees.length,
            min: fees[0],
            max: fees[fees.length - 1],
            median: percentile(fees, 50),
            p25: percentile(fees, 25),
            p75: percentile(fees, 75),
            fees, // anonymous sorted ints, for client-side "where do I stand?"
          };
  }

  return json(
    { brackets, total, updated_at: new Date().toISOString() },
    200,
    { ...cors, 'Cache-Control': 'public, max-age=300' },
  );
}

async function admin(request, env, url, cors) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: 'unauthorized' }, 401, cors);
  }
  if (request.method === 'GET' && url.pathname === '/admin/list') {
    const { results } = await env.DB.prepare(
      'SELECT id, bracket, fee, annual_revenue, year, status, created_at FROM quotes ORDER BY id DESC LIMIT 200',
    ).all();
    return json({ rows: results || [] }, 200, cors);
  }
  if (request.method === 'POST' && url.pathname === '/admin/hide') {
    const body = await request.json().catch(() => ({}));
    const id = Number(body.id);
    if (!Number.isInteger(id)) return json({ error: 'bad_id' }, 400, cors);
    await env.DB.prepare("UPDATE quotes SET status = 'hidden' WHERE id = ?").bind(id).run();
    return json({ ok: true }, 200, cors);
  }
  return json({ error: 'not_found' }, 404, cors);
}

// --- helpers ---

// Reflect the request Origin only if it's allowed: the configured production
// origin(s) in ALLOWED_ORIGIN (comma-separated) plus any localhost dev port.
function corsOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || 'https://remotevergi.com')
    .split(',')
    .map((s) => s.trim());
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (origin && (allowed.includes(origin) || isLocal)) {
    return { 'Access-Control-Allow-Origin': origin };
  }
  return { 'Access-Control-Allow-Origin': allowed[0] };
}

function trimOutliers(sorted) {
  if (sorted.length < 4) return sorted.slice();
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return sorted.filter((v) => v >= lo && v <= hi);
}

// Linear-interpolated percentile over an ascending array.
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}
