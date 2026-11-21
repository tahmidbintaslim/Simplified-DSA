import { course, lessonPath } from './course.js';
import { simulators } from './simulators.js';

/**
 * What the site search can find, as plain data for the client. `text` is
 * lower-case and holds both languages, so either spelling finds an item.
 */
export function searchItems(lang) {
  const english = new Map(course('en').flatMap((s) => s.lessons.map((l) => [l.id, `${l.title} ${l.summary}`])));
  const lessons = course(lang).flatMap((section) =>
    section.lessons.map((lesson) => ({ section, lesson, text: `${lesson.title} ${lesson.summary} ${english.get(lesson.id)}`.toLowerCase() })),
  );
  return [
    ...lessons.map(({ section, lesson, text }) => ({ kind: 'lesson', href: lessonPath(lang, section.id, lesson.id), title: lesson.title, sub: section.title, text })),
    ...simulators(lang).map((sim) => ({ kind: 'simulator', href: `/${lang}/simulators/${sim.id}`, title: sim.title, sub: sim.lesson.title, text: `${sim.title} ${sim.intro} ${english.get(sim.lesson.id)}`.toLowerCase() })),
    ...lessons.map(({ section, lesson, text }) => ({ kind: 'quiz', href: `/${lang}/quizzes/${section.id}/${lesson.id}`, title: lesson.title, sub: section.title, text: `quiz কুইজ ${text}` })),
  ];
}
