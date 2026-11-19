import { Suspense } from 'react';
import Link from 'next/link';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { course, lessonPath } from '../lib/course.js';
import { dict } from '../lib/i18n.js';
import LangSwitch from './LangSwitch.js';
import ThemeToggle from './ThemeToggle.js';

export default function SiteHeader({ lang }) {
  const t = dict(lang);
  const first = course(lang)[0];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href={`/${lang}`}>
          <img src="/icon.png" alt="" width="28" height="28" />
          <span>Simplified DSA</span>
        </Link>
        <nav className="topnav" aria-label="Site">
          <Link href={`/${lang}`}>{t.courseMap}</Link>
          <Link href={lessonPath(lang, first.id, first.lessons[0].id)}>{t.lessons}</Link>
          <Link href={`/${lang}/simulators`}>{t.simulators.nav}</Link>
          <Link href={`/${lang}/quizzes`}>{t.quizzes.nav}</Link>
        </nav>
        <div className="topbar-actions">
          <LangSwitch lang={lang} />
          <ThemeToggle labels={[t.switchTheme(false), t.switchTheme(true)]} />
          {/* Only the account button waits for Clerk; the rest of the header renders at once. */}
          <Suspense fallback={<span className="auth-slot" aria-hidden="true" />}>
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button type="button" className="demo-button is-primary">{t.signIn}</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
