import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { dict, isLocale, LOCALES } from '../../../../../lib/i18n.js';
import { allLessons, findLesson, lessonPath, lessonQuizzes } from '../../../../../lib/lessons.js';
import QuizRunner from '../../../../../components/QuizRunner.js';

export const generateStaticParams = () =>
  LOCALES.flatMap((lang) => allLessons(lang).map(({ section, lesson }) => ({ lang, section: section.id, lesson: lesson.id })));

export async function generateMetadata({ params }) {
  const { lang, section, lesson } = await params;
  const found = isLocale(lang) && findLesson(lang, section, lesson);
  return found ? { title: `${dict(lang).quizzes.nav}: ${found.lesson.title} | Simplified DSA` } : {};
}

export default async function QuizPage({ params }) {
  const { lang, section: sectionId, lesson: lessonId } = await params;
  const found = isLocale(lang) && findLesson(lang, sectionId, lessonId);
  if (!found) notFound();
  const { quizzes, fallback } = lessonQuizzes(lang, sectionId, lessonId);
  if (!quizzes.length) notFound();
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/${lang}/quizzes/${sectionId}/${lessonId}`)}`);
  const t = dict(lang).quizzes;
  const href = lessonPath(lang, sectionId, lessonId);
  return (
    <main id="main" className="lesson-main hub" tabIndex={-1}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${lang}/quizzes`}>{t.back}</Link> <span aria-hidden="true">/</span> <span>{found.lesson.title}</span>
      </nav>
      <header className="hub-head">
        <h1>{found.lesson.title}</h1>
        <p className="lead">{t.questions(quizzes.length)}</p>
        {fallback ? <p className="lesson-fallback">{dict(lang).fallbackNotice}</p> : null}
      </header>
      <QuizRunner lang={lang} contentLang={fallback ? 'en' : lang} lessonKey={`${sectionId}/${lessonId}`} quizzes={quizzes} lessonHref={href} />
    </main>
  );
}
