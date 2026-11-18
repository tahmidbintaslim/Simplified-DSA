import { curriculum } from '../src/content/curriculum.js';
import { bnLessons, bnSections } from '../src/content/bn/curriculum.js';

/**
 * The course in one language: the English curriculum with titles, summaries
 * and goals swapped for Bangla where written. Safe on server and client.
 */
const cache = new Map();
export function course(lang) {
  if (lang !== 'bn') return curriculum;
  if (!cache.has(lang)) {
    cache.set(
      lang,
      curriculum.map((section) => ({
        ...section,
        ...bnSections[section.id],
        lessons: section.lessons.map((lesson) => ({ ...lesson, ...bnLessons[lesson.id] })),
      })),
    );
  }
  return cache.get(lang);
}

export const lessonPath = (lang, sectionId, lessonId) => `/${lang}/${sectionId}/${lessonId}`;

/** Every lesson in course order, with its section. */
export const allLessons = (lang = 'en') => course(lang).flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));

export function findLesson(lang, sectionId, lessonId) {
  const entries = allLessons(lang);
  const index = entries.findIndex(({ section, lesson }) => section.id === sectionId && lesson.id === lessonId);
  if (index === -1) return null;
  return { ...entries[index], index, previous: entries[index - 1] ?? null, next: entries[index + 1] ?? null, total: entries.length };
}
