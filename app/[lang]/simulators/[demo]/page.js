import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { dict, isLocale, LOCALES } from '../../../../lib/i18n.js';
import { lessonPath } from '../../../../lib/course.js';
import { simulators } from '../../../../lib/simulators.js';
import SimulatorView from '../../../../components/SimulatorView.js';

export const generateStaticParams = () => LOCALES.flatMap((lang) => simulators(lang).map((sim) => ({ lang, demo: sim.id })));

const find = (lang, id) => (isLocale(lang) ? simulators(lang).find((sim) => sim.id === id) : null);

export async function generateMetadata({ params }) {
  const { lang, demo } = await params;
  const sim = find(lang, demo);
  return sim ? { title: `${sim.title} | Simplified DSA`, description: sim.intro } : {};
}

export default async function SimulatorPage({ params }) {
  const { lang, demo } = await params;
  const sim = find(lang, demo);
  if (!sim) notFound();
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/${lang}/simulators/${demo}`)}`);
  const t = dict(lang).simulators;
  return (
    <main id="main" className="lesson-main hub" tabIndex={-1}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${lang}/simulators`}>{t.back}</Link> <span aria-hidden="true">/</span> <span>{sim.title}</span>
      </nav>
      <header className="hub-head">
        <h1>{sim.title}</h1>
        <p className="lead">{sim.intro}</p>
        <p>
          <Link className="demo-button" href={lessonPath(lang, sim.section.id, sim.lesson.id)}>{t.lesson}: {sim.lesson.title}</Link>
        </p>
      </header>
      <SimulatorView lang={lang} demoId={demo} />
    </main>
  );
}
