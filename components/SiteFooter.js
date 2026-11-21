import Link from 'next/link';
import { course, lessonPath } from '../lib/course.js';
import { dict } from '../lib/i18n.js';

export default function SiteFooter({ lang }) {
  const t = dict(lang);
  const first = course(lang)[0];
  const [learn, site, language] = t.footerHeads;
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link className="brand" href={`/${lang}`}>
            <img src="/icon.png" alt="" width="22" height="22" />
            <span>Simplified DSA</span>
          </Link>
          <p>{t.footerTag}</p>
        </div>
        <nav aria-label={learn}>
          <h2>{learn}</h2>
          <Link href={lessonPath(lang, first.id, first.lessons[0].id)}>{t.lessons}</Link>
          <Link href={`/${lang}/simulators`}>{t.simulators.nav}</Link>
          <Link href={`/${lang}/quizzes`}>{t.quizzes.nav}</Link>
        </nav>
        <nav aria-label={site}>
          <h2>{site}</h2>
          <a href="/privacy.html">{t.privacy}</a>
          <a href="https://dsa.tahmid.space/mcp">{t.connector}</a>
        </nav>
        <nav aria-label={language}>
          <h2>{language}</h2>
          {/* Plain links: a language change reloads the page so the whole layout switches. */}
          <a href="/en" hrefLang="en" lang="en">English</a>
          <a href="/bn" hrefLang="bn" lang="bn">বাংলা</a>
        </nav>
      </div>
      <p className="footer-legal">{t.footer(new Date().getFullYear())}</p>
      <p className="footer-wordmark" aria-hidden="true">Simplified DSA</p>
    </footer>
  );
}
