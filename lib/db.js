import { neon } from '@neondatabase/serverless';

/**
 * Neon Postgres over HTTP. Without DATABASE_URL (a fresh checkout, CI) `sql`
 * is null and every caller falls back: no resources panel, progress stays in
 * the browser.
 */
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

/** Resources for one lesson, plus the course-wide ones, learner's language first. */
export async function resourcesFor(lessonId, lang) {
  if (!sql) return [];
  try {
    return await sql`
      select url, title, author, lang, kind, track, free, note_en, note_bn
      from resources
      where ${lessonId} = any(topics)
      order by (lang = ${lang}) desc, track, kind, title`;
  } catch (error) {
    console.error('resourcesFor failed', error);
    return [];
  }
}
