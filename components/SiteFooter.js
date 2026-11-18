import Link from 'next/link';
import { dict } from '../lib/i18n.js';

export default function SiteFooter({ lang }) {
  const t = dict(lang);
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link className="brand" href={`/${lang}`}>
          <img src="/icon.png" alt="" width="22" height="22" />
          <span>Simplified DSA</span>
        </Link>
        <p>{t.footer(new Date().getFullYear())}</p>
        <nav aria-label="Footer">
          <a href="/privacy.html">{t.privacy}</a>
          <a href="https://dsa.tahmid.space/mcp">{t.connector}</a>
        </nav>
      </div>
    </footer>
  );
}
