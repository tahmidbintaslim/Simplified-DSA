import { allLessons, lessonMarkdown, sections } from '../lib/lessons.js';
import Home from '../components/Home.js';

export const metadata = { alternates: { canonical: '/' } };

// The home page is public; every number on it is counted from the lessons.
export default function HomePage() {
  const all = allLessons();
  const lessons = all.map((entry) => entry.lesson);
  const numbers = [
    ['Lessons', all.length, 'From arrays to interview patterns.'],
    ['Demos you drive', lessons.filter((lesson) => lesson.demo).length, 'Step, play, or type your own input.'],
    ['Quiz questions', all.reduce((n, { section, lesson }) => n + (lessonMarkdown(section.id, lesson.id).match(/^```quiz$/gm)?.length ?? 0), 0), 'Predict first, then see why.'],
    ['Minutes in all', lessons.reduce((n, lesson) => n + (lesson.minutes ?? 0), 0), 'Short lessons, one idea each.'],
  ];
  const map = sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    lessons: section.lessons.map(({ id, title, summary, minutes, level }) => ({ id, title, summary, minutes: minutes ?? null, level: level ?? null })),
  }));
  return (
    <main id="main" className="lesson-main" tabIndex={-1}>
      <Home sections={map} numbers={numbers} />
    </main>
  );
}
