/**
 * Database tasks. Reads DATABASE_URL (from .env.local when present).
 *   pnpm db:migrate   create tables (db/schema.sql; safe to re-run)
 *   pnpm db:seed      upsert the resource library (db/resources.js)
 */
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';
import { resources } from '../db/resources.js';

try {
  process.loadEnvFile('.env.local');
} catch {
  // No .env.local: use the environment as is (CI, Vercel).
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.');
const sql = neon(process.env.DATABASE_URL);

const task = process.argv[2];
if (task === 'migrate') {
  // Split on statement ends; the schema has no semicolons inside statements.
  const statements = readFileSync('db/schema.sql', 'utf8')
    .replace(/--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  console.log(`Applied ${statements.length} statements.`);
} else if (task === 'seed') {
  for (const r of resources) {
    await sql.query(
      `insert into resources (url, title, author, lang, kind, track, free, topics, note_en, note_bn)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (url) do update set title = $2, author = $3, lang = $4, kind = $5, track = $6,
         free = $7, topics = $8, note_en = $9, note_bn = $10`,
      [r.url, r.title, r.author, r.lang, r.kind, r.track, r.free ?? true, r.topics, r.note_en, r.note_bn],
    );
  }
  console.log(`Upserted ${resources.length} resources.`);
} else {
  console.error('Usage: node scripts/db.js migrate|seed');
  process.exit(1);
}
