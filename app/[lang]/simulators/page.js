import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dict, isLocale, LOCALES } from '../../../lib/i18n.js';
import { simulators } from '../../../lib/simulators.js';
import CardArt from '../../../components/CardArt.js';
import { missions } from '../../../src/demos/missions.js';

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: `${dict(lang).simulators.title} | Simplified DSA` };
}

// Public, like the home page: the list invites people in; each simulator needs an account.
export default async function SimulatorsPage({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dict(lang).simulators;
  return (
    <main id="main" className="lesson-main hub" tabIndex={-1}>
      <header className="hub-head">
        <h1>{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>
      <ul className="hub-grid">
        {simulators(lang).map((sim) => (
          <li key={sim.id}>
            <Link className="hub-card" href={`/${lang}/simulators/${sim.id}`}>
              <CardArt topic={sim.lesson.id} tab={missions[sim.id] ? t.missionsTab(missions[sim.id].length) : null} />
              <span className="hub-tag">{sim.section.title} · {sim.lesson.title}</span>
              <strong>{sim.title}</strong>
              <span className="hub-text">{sim.intro}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
