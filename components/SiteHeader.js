import Link from 'next/link';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { sections, lessonPath } from '../lib/lessons.js';
import ThemeToggle from './ThemeToggle.js';

export default function SiteHeader() {
  const first = sections[0];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/">
          <img src="/icon.png" alt="" width="28" height="28" />
          <span>Simplified DSA</span>
        </Link>
        <nav className="topnav" aria-label="Site">
          <Link href="/">Course map</Link>
          <Link href={lessonPath(first.id, first.lessons[0].id)}>Lessons</Link>
        </nav>
        <div className="topbar-actions">
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button type="button" className="demo-button is-primary">Sign in</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
