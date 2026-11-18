import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { allLessons, buildArticle, findLesson, lessonMarkdown, lessonPath } from '../../../lib/lessons.js';
import { demos } from '../../../src/demos/index.js';
import LessonView from '../../../components/LessonView.js';
import Sidebar from '../../../components/Sidebar.js';

export const generateStaticParams = () => allLessons().map(({ section, lesson }) => ({ section: section.id, lesson: lesson.id }));

export async function generateMetadata({ params }) {
  const { section, lesson } = await params;
  const found = findLesson(section, lesson);
  return found ? { title: `${found.lesson.title} | Simplified DSA`, description: found.lesson.summary } : {};
}

// Plain data for the client: titles and links only.
const card = (entry) => entry && { href: lessonPath(entry.section.id, entry.lesson.id), title: entry.lesson.title, summary: entry.lesson.summary };

export default async function LessonPage({ params }) {
  const { section: sectionId, lesson: lessonId } = await params;
  const found = findLesson(sectionId, lessonId);
  if (!found) notFound();

  // Every lesson needs an account (the home page stays public).
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(lessonPath(sectionId, lessonId))}`);

  const { section, lesson } = found;
  const demo = demos[lesson.demo];
  const { html, headings } = buildArticle(lessonMarkdown(sectionId, lessonId), { section, lesson, demo });
  return (
    <div className="app-shell">
      <Sidebar activeSection={sectionId} activeLesson={lessonId} />
      <main id="main" className="lesson-main" tabIndex={-1}>
        <LessonView
          key={`${sectionId}/${lessonId}`}
          lessonKey={`${sectionId}/${lessonId}`}
          html={html}
          headings={headings}
          demoId={lesson.demo ?? null}
          languageExamples={lesson.languageExamples ?? null}
          previous={card(found.previous)}
          next={card(found.next)}
          total={found.total}
        />
      </main>
    </div>
  );
}
