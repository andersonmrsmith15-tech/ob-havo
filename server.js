import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views');
const DASHBOARD_USER = 'admin';
const DASHBOARD_PAROL = process.env.DASHBOARD_PAROL || '';
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL topilmadi. .env faylini tekshiring.');
  process.exit(1);
}
// Doimiy ishlaydigan Node server: node-postgres pool, pooled DATABASE_URL orqali.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30_000 });
pool.on('error', (err) => console.error('Pool xatosi:', err.message));

const CITIES = new Set([
  'Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona", 'Nukus', 'Qarshi',
  'Termiz', 'Jizzax', 'Navoiy', 'Guliston', 'Urganch', 'Xiva', "Qo'qon", 'Chirchiq',
]);
const ALERTS = new Set(['yomgir', 'qor', 'issiq', 'sovuq', 'shamol', 'havo_sifati']);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req, limit = 10_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('too_large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function validate(body) {
  const errors = {};
  const ism = String(body.ism ?? '').trim();
  const telefon = String(body.telefon ?? '').trim();
  const shahar = String(body.shahar ?? '').trim();
  const izoh = String(body.izoh ?? '').trim();
  const ogohlantirish = Array.isArray(body.ogohlantirish)
    ? [...new Set(body.ogohlantirish.map(String))].filter((a) => ALERTS.has(a))
    : [];

  if (ism.length < 2 || ism.length > 80) errors.ism = "Ism 2–80 belgidan iborat bo'lishi kerak";
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(telefon)) errors.telefon = "Telefon raqami noto'g'ri";
  if (!CITIES.has(shahar)) errors.shahar = 'Shaharni tanlang';
  if (izoh.length > 500) errors.izoh = 'Izoh 500 belgidan oshmasin';

  return { errors, data: { ism, telefon, shahar, izoh: izoh || null, ogohlantirish } };
}

async function handleObuna(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { ok: false, message: "So'rov formati noto'g'ri" });
  }
  const { errors, data } = validate(body);
  if (Object.keys(errors).length) {
    return sendJson(res, 422, { ok: false, message: "Ma'lumotlarni tekshiring", errors });
  }
  try {
    const { rows: [row] } = await pool.query(
      `INSERT INTO obunachilar (ism, telefon, shahar, ogohlantirish, izoh)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [data.ism, data.telefon, data.shahar, data.ogohlantirish, data.izoh],
    );
    return sendJson(res, 201, { ok: true, id: row.id, created_at: row.created_at });
  } catch (err) {
    console.error('DB xatosi:', err.message);
    return sendJson(res, 500, { ok: false, message: "Bazaga saqlashda xatolik. Keyinroq urinib ko'ring." });
  }
}

async function handleCount(res) {
  try {
    const { rows: [row] } = await pool.query('SELECT count(*)::int AS soni FROM obunachilar');
    return sendJson(res, 200, { ok: true, soni: row.soni });
  } catch (err) {
    console.error('DB xatosi:', err.message);
    return sendJson(res, 500, { ok: false });
  }
}


/* ---------- Dashboard (Basic Auth bilan himoyalangan) ---------- */
function isAuthorized(req) {
  if (!DASHBOARD_PAROL) return false;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const given = Buffer.from(Buffer.from(h.slice(6), 'base64').toString('utf8'));
  const expected = Buffer.from(`${DASHBOARD_USER}:${DASHBOARD_PAROL}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function requireAuth(req, res) {
  if (isAuthorized(req)) return true;
  if (!DASHBOARD_PAROL) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end("Dashboard o'chirilgan: .env faylida DASHBOARD_PAROL o'rnatilmagan.");
    return false;
  }
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="Ob-havo dashboard", charset="UTF-8"',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('Kirish uchun login va parol kerak');
  return false;
}

async function handleDashboardPage(req, res) {
  if (!requireAuth(req, res)) return;
  const html = await readFile(path.join(VIEWS_DIR, 'dashboard.html'));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

async function handleDashboardData(req, res) {
  if (!requireAuth(req, res)) return;
  const TZ = 'Asia/Tashkent';
  try {
    const [totals, byCity, byAlert, daily, rows] = await Promise.all([
      pool.query(
        `SELECT count(*)::int AS jami,
                count(*) FILTER (WHERE (created_at AT TIME ZONE $1)::date = (now() AT TIME ZONE $1)::date)::int AS bugun,
                count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS hafta
           FROM obunachilar`, [TZ]),
      pool.query(`SELECT shahar, count(*)::int AS soni FROM obunachilar GROUP BY shahar ORDER BY soni DESC, shahar`),
      pool.query(`SELECT a AS tur, count(*)::int AS soni FROM obunachilar, unnest(ogohlantirish) AS a GROUP BY a ORDER BY soni DESC`),
      pool.query(
        `SELECT to_char(d, 'YYYY-MM-DD') AS kun, count(o.id)::int AS soni
           FROM generate_series((now() AT TIME ZONE $1)::date - 13, (now() AT TIME ZONE $1)::date, interval '1 day') AS d
           LEFT JOIN obunachilar o ON (o.created_at AT TIME ZONE $1)::date = d::date
          GROUP BY d ORDER BY d`, [TZ]),
      pool.query(
        `SELECT id, ism, telefon, shahar, ogohlantirish, izoh,
                to_char(created_at AT TIME ZONE $1, 'YYYY-MM-DD HH24:MI') AS sana
           FROM obunachilar ORDER BY created_at DESC LIMIT 500`, [TZ]),
    ]);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({
      ok: true,
      ...totals.rows[0],
      shaharlar: byCity.rows,
      ogohlantirishlar: byAlert.rows,
      kunlik: daily.rows,
      yozuvlar: rows.rows,
    }));
  } catch (err) {
    console.error('DB xatosi:', err.message);
    sendJson(res, 500, { ok: false, message: "Ma'lumotlarni olishda xatolik" });
  }
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Topilmadi');
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  if (pathname === '/api/obuna' && req.method === 'POST') return handleObuna(req, res);
  if (pathname === '/api/obuna/soni' && req.method === 'GET') return handleCount(res);
  if (pathname === '/api/dashboard' && req.method === 'GET') return handleDashboardData(req, res);
  if ((pathname === '/open-meteo' || pathname === '/open-meteo/') && req.method === 'GET') {
    req.url = '/open-meteo.html';
    return serveStatic(req, res);
  }
  if ((pathname === '/dashboard' || pathname === '/dashboard/') && req.method === 'GET') return handleDashboardPage(req, res);
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
  res.writeHead(405);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Ob-havo ilovasi ishga tushdi: http://localhost:${PORT}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => pool.end().finally(() => process.exit(0))));
}
