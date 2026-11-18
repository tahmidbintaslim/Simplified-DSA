import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link className="brand" href="/">
          <img src="/icon.png" alt="" width="22" height="22" />
          <span>Simplified DSA</span>
        </Link>
        <p>Free lessons that show every step. © {new Date().getFullYear()} Simplified DSA. All rights reserved.</p>
        <nav aria-label="Footer">
          <a href="/privacy.html">Privacy</a>
          <a href="https://dsa.tahmid.space/mcp">Claude connector</a>
        </nav>
      </div>
    </footer>
  );
}
