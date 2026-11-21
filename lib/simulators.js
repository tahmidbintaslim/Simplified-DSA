import { course } from './course.js';
import { demos } from '../src/demos/index.js';

/** Every demo as a simulator, in course order, with the lesson it belongs to. */
export function simulators(lang) {
  return course(lang).flatMap((section) =>
    section.lessons
      .filter((lesson) => demos[lesson.demo])
      .map((lesson) => {
        const demo = demos[lesson.demo];
        const text = lang === 'bn' ? { ...demo, ...demo.bn } : demo;
        return { id: lesson.demo, title: text.title, intro: text.intro, section, lesson };
      }),
  );
}
