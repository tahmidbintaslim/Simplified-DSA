import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dict, isLocale, LOCALES } from '../../../lib/i18n.js';
import { course, lessonQuizzes } from '../../../lib/lessons.js';

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: `${dict(lang).quizzes.title} | Simplified DSA` };
}

// Public list; each quiz needs an account.
export default async function QuizzesPage({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dict(lang).quizzes;
  return (
    <main id="main" className="lesson-main hub" tabIndex={-1}>
      <header className="hub-head">
        <h1>{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>
      {course(lang).map((section) => (
        <section key={section.id} className="hub-section" aria-labelledby={`q-${section.id}`}>
          <h2 id={`q-${section.id}`}>{section.title}</h2>
          <ul className="hub-grid">
            {section.lessons.map((lesson) => {
              const n = lessonQuizzes(lang, section.id, lesson.id).quizzes.length;
              return n ? (
                <li key={lesson.id}>
                  <Link className="hub-card" href={`/${lang}/quizzes/${section.id}/${lesson.id}`}>
                    <strong>{lesson.title}</strong>
                    <span className="hub-text">{lesson.summary}</span>
                    <span className="hub-meta">{t.questions(n)}</span>
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
