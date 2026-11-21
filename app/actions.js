'use server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '../lib/db.js';
import { allLessons } from '../lib/course.js';
import { isLocale } from '../lib/i18n.js';
import { missions as MISSIONS } from '../src/demos/missions.js';

/**
 * Progress and quiz answers, saved per Clerk user. Every input is checked
 * here: these run on the server but are called from the browser.
 */
const LESSON_KEYS = new Set(allLessons().map(({ section, lesson }) => `${section.id}/${lesson.id}`));
const userOrNull = async () => (sql ? (await auth()).userId : null);

/** The learner's completed lessons, or null when there is no account or DB. */
export async function loadProgress() {
  const userId = await userOrNull();
  if (!userId) return null;
  const rows = await sql`select lesson from progress where user_id = ${userId}`;
  return rows.map((row) => row.lesson);
}

/** Merge lessons completed in this browser into the account (first sign-in on a device). */
export async function mergeProgress(lessons) {
  const userId = await userOrNull();
  if (!userId || !Array.isArray(lessons)) return;
  const valid = lessons.filter((key) => LESSON_KEYS.has(key));
  if (valid.length) await sql`insert into progress (user_id, lesson) select ${userId}, unnest(${valid}::text[]) on conflict do nothing`;
}

export async function setComplete(lesson, done) {
  const userId = await userOrNull();
  if (!userId || !LESSON_KEYS.has(lesson)) return;
  if (done) await sql`insert into progress (user_id, lesson) values (${userId}, ${lesson}) on conflict do nothing`;
  else await sql`delete from progress where user_id = ${userId} and lesson = ${lesson}`;
}

export async function recordQuiz(lesson, quiz, correct, attempt, lang) {
  const userId = await userOrNull();
  const ok = LESSON_KEYS.has(lesson) && Number.isInteger(quiz) && quiz >= 0 && quiz < 50 && typeof correct === 'boolean' && Number.isInteger(attempt) && attempt > 0 && attempt < 20 && isLocale(lang);
  if (!userId || !ok) return;
  await sql`insert into quiz_attempts (user_id, lesson, quiz, correct, attempt, lang) values (${userId}, ${lesson}, ${quiz}, ${correct}, ${attempt}, ${lang})`;
}

/** The learner's mission counts for one simulator ({ missionId: count }), or null. */
export async function loadMissions(demo) {
  const userId = await userOrNull();
  if (!userId || !MISSIONS[demo]) return null;
  const rows = await sql`select mission, count from mission_progress where user_id = ${userId} and demo = ${demo}`;
  return Object.fromEntries(rows.map((row) => [row.mission, row.count]));
}

/** Save counts that went up; a count never goes down or past the mission's goal. */
export async function saveMissions(demo, counts) {
  const userId = await userOrNull();
  const known = MISSIONS[demo];
  if (!userId || !known || !counts || typeof counts !== 'object') return;
  for (const m of known) {
    const count = Math.min(Number(counts[m.id]) || 0, m.times ?? 1);
    if (count > 0) {
      await sql`insert into mission_progress (user_id, demo, mission, count) values (${userId}, ${demo}, ${m.id}, ${count})
        on conflict (user_id, demo, mission) do update set count = greatest(mission_progress.count, excluded.count), updated_at = now()`;
    }
  }
}
