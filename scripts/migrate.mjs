// Migratsiyalarni direct (pooler'siz) ulanish orqali ishga tushiradi.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL_UNPOOLED topilmadi'); process.exit(1); }

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const done = new Set((await client.query('SELECT name FROM _migrations')).rows.map((r) => r.name));
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(file)) { console.log(`= ${file} (oldin qo'llangan)`); continue; }
    const sql = await readFile(path.join(dir, file), 'utf8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log(`+ ${file} qo'llandi`);
  }
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Migratsiya xatosi:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
