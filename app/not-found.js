import Link from 'next/link';
import { headers } from 'next/headers';
import { dict, isLocale, DEFAULT_LOCALE } from '../lib/i18n.js';

export default async function NotFound() {
  const value = (await headers()).get('x-locale');
  const lang = isLocale(value) ? value : DEFAULT_LOCALE;
  const t = dict(lang).notFound;
  return (
    <main id="main" className="lesson-main">
      <article className="lesson-content">
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        <p className="home-actions">
          <Link className="demo-button is-primary" href={`/${lang}`}>{t.back}</Link>
        </p>
      </article>
    </main>
  );
}
