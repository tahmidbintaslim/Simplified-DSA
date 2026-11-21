import { notFound } from 'next/navigation';
import { allLessons, course, lessonMarkdown } from '../../lib/lessons.js';
import { dict, isLocale, LOCALES } from '../../lib/i18n.js';
import { resourcesFor } from '../../lib/db.js';
import Home from '../../components/Home.js';
import Resources from '../../components/Resources.js';
import { missions } from '../../src/demos/missions.js';
import { simulators } from '../../lib/simulators.js';

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { alternates: { canonical: `/${lang}`, languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) } };
}

// The home page is public; every number on it is counted from the lessons.
export default async function HomePage({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dict(lang).home;
  const all = allLessons(lang);
  const lessons = all.map((entry) => entry.lesson);
  const counts = [
    all.length,
    lessons.filter((lesson) => lesson.demo).length,
    all.reduce((n, { section, lesson }) => n + (lessonMarkdown('en', section.id, lesson.id).markdown.match(/^```quiz$/gm)?.length ?? 0), 0),
    lessons.reduce((n, lesson) => n + (lesson.minutes ?? 0), 0),
  ];
  const numbers = counts.map((value, i) => [t.numbers[i], value, t.numberNotes[i]]);
  const map = course(lang).map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    lessons: section.lessons.map(({ id, title, summary, minutes, level }) => ({ id, title, summary, minutes: minutes ?? null, level: level ?? null })),
  }));
  const library = await resourcesFor('general', lang);
  return (
    <main id="main" className="lesson-main" tabIndex={-1}>
      <Home lang={lang} sections={map} numbers={numbers} sims={simulators(lang).slice(0, 6).map(({ id, title, intro, lesson }) => ({ id, title, intro, lesson: lesson.title, topic: lesson.id, missions: missions[id]?.length ?? 0 }))}>
        {library.length ? <Resources lang={lang} resources={library} id="library" /> : null}
      </Home>
    </main>
  );
}
