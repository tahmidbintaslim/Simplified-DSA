/**
 * Lesson URLs look like /data-structures/arrays-and-strings.
 *
 * These helpers are plain functions with no DOM access, so Node tests can run
 * them. App.js connects them to window.location and the History API.
 */

export const lessonPath = (sectionId, lessonId) =>
  `/${encodeURIComponent(sectionId)}/${encodeURIComponent(lessonId)}`;

const decodeSegment = (segment) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    // A malformed % escape cannot match any id, so keep it as typed.
    return segment;
  }
};

/**
 * Turn a pathname into a section and lesson that exist in the curriculum.
 *
 * - "/" opens the first lesson of the first section.
 * - "/:section" opens the first lesson of that section.
 * - "/:section/:lesson" opens that lesson, or the section's first lesson
 *   when the lesson id is unknown.
 * - Anything else falls back to "/", so the page is never empty.
 *
 * `path` is the clean URL for the result. App.js puts it in the address bar
 * when it differs from what the visitor typed.
 */
export function resolvePath(sections, pathname) {
  const segments = pathname.split('/').filter(Boolean).map(decodeSegment);
  const home = { sectionId: sections[0].id, lessonId: sections[0].lessons[0].id, path: '/' };

  if (segments.length === 0 || segments.length > 2) return home;

  const [sectionId, lessonId] = segments;
  const section = sections.find((item) => item.id === sectionId);
  if (!section) return home;

  const lesson = section.lessons.find((item) => item.id === lessonId) ?? section.lessons[0];
  return { sectionId: section.id, lessonId: lesson.id, path: lessonPath(section.id, lesson.id) };
}
