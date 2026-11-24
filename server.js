import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL topilmadi. .env faylini tekshiring.');
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

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
    const [row] = await sql`
      INSERT INTO obunachilar (ism, telefon, shahar, ogohlantirish, izoh)
      VALUES (${data.ism}, ${data.telefon}, ${data.shahar}, ${data.ogohlantirish}, ${data.izoh})
      RETURNING id, created_at`;
    return sendJson(res, 201, { ok: true, id: row.id, created_at: row.created_at });
  } catch (err) {
    console.error('DB xatosi:', err.message);
    return sendJson(res, 500, { ok: false, message: "Bazaga saqlashda xatolik. Keyinroq urinib ko'ring." });
  }
}

async function handleCount(res) {
  try {
    const [row] = await sql`SELECT count(*)::int AS soni FROM obunachilar`;
    return sendJson(res, 200, { ok: true, soni: row.soni });
  } catch (err) {
    console.error('DB xatosi:', err.message);
    return sendJson(res, 500, { ok: false });
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
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
  res.writeHead(405);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Ob-havo ilovasi ishga tushdi: http://localhost:${PORT}`);
});
