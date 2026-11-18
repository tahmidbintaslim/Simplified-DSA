import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { allLessons, buildArticle, findLesson, lessonMarkdown, lessonPath } from '../../../../lib/lessons.js';
import { isLocale, LOCALES } from '../../../../lib/i18n.js';
import { resourcesFor } from '../../../../lib/db.js';
import { demos } from '../../../../src/demos/index.js';
import LessonView from '../../../../components/LessonView.js';
import Resources from '../../../../components/Resources.js';
import Sidebar from '../../../../components/Sidebar.js';

export const generateStaticParams = () =>
  LOCALES.flatMap((lang) => allLessons(lang).map(({ section, lesson }) => ({ lang, section: section.id, lesson: lesson.id })));

export async function generateMetadata({ params }) {
  const { lang, section, lesson } = await params;
  const found = isLocale(lang) && findLesson(lang, section, lesson);
  if (!found) return {};
  return {
    title: `${found.lesson.title} | Simplified DSA`,
    description: found.lesson.summary,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, lessonPath(l, section, lesson)])) },
  };
}

// Plain data for the client: titles and links only.
const card = (lang, entry) => entry && { href: lessonPath(lang, entry.section.id, entry.lesson.id), title: entry.lesson.title, summary: entry.lesson.summary };

export default async function LessonPage({ params }) {
  const { lang, section: sectionId, lesson: lessonId } = await params;
  const found = isLocale(lang) && findLesson(lang, sectionId, lessonId);
  if (!found) notFound();

  // Every lesson needs an account (the home page stays public).
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(lessonPath(lang, sectionId, lessonId))}`);

  const { section, lesson } = found;
  const demo = demos[lesson.demo] && { ...demos[lesson.demo], ...(lang === 'bn' ? demos[lesson.demo].bn : {}) };
  const { markdown, fallback } = lessonMarkdown(lang, sectionId, lessonId);
  const { html, headings } = buildArticle(markdown, { lang, section, lesson, demo, fallback });
  const resources = await resourcesFor(lessonId, lang);
  return (
    <div className="app-shell">
      <Sidebar lang={lang} activeSection={sectionId} activeLesson={lessonId} />
      <main id="main" className="lesson-main" tabIndex={-1}>
        <LessonView
          key={`${lang}/${sectionId}/${lessonId}`}
          lang={lang}
          contentLang={fallback ? 'en' : lang}
          lessonKey={`${sectionId}/${lessonId}`}
          html={html}
          headings={headings}
          demoId={lesson.demo ?? null}
          languageExamples={lesson.languageExamples ?? null}
          previous={card(lang, found.previous)}
          next={card(lang, found.next)}
          total={found.total}
        >
          {resources.length ? <Resources lang={lang} resources={resources} /> : null}
        </LessonView>
      </main>
    </div>
  );
}
