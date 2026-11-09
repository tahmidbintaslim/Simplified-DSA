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
 * - "/:section/:lesson" opens that lesson.
 * - Anything else (unknown section or lesson, extra segments, bad escapes)
 *   is `notFound`. It keeps the URL as typed and points at the first
 *   lesson, so the sidebar still has something open next to the message.
 *
 * `path` is the clean URL for the result. App.js puts it in the address bar
 * when it differs from what the visitor typed.
 */
export function resolvePath(sections, pathname) {
  const segments = pathname.split('/').filter(Boolean).map(decodeSegment);
  const home = { sectionId: sections[0].id, lessonId: sections[0].lessons[0].id, path: '/' };

  const notFound = { ...home, path: pathname, notFound: true };

  if (segments.length === 0) return home;
  if (segments.length > 2) return notFound;

  const [sectionId, lessonId] = segments;
  const section = sections.find((item) => item.id === sectionId);
  if (!section) return notFound;
  if (lessonId === undefined) return { sectionId, lessonId: section.lessons[0].id, path: lessonPath(sectionId, section.lessons[0].id) };

  const lesson = section.lessons.find((item) => item.id === lessonId);
  if (!lesson) return notFound;
  return { sectionId, lessonId, path: lessonPath(sectionId, lessonId) };
}
