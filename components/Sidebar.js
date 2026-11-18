'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { course, lessonPath } from '../lib/course.js';
import { dict } from '../lib/i18n.js';
import { loadCompleted } from '../src/core/progress.js';
import Icon from './Icon.js';

/** Searchable, collapsible lesson tree. On phones it folds into a "Lessons" bar. */
export default function Sidebar({ lang, activeSection, activeLesson }) {
  const t = dict(lang);
  const sections = course(lang);
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState(() => new Set());
  const [wide, setWide] = useState(true);
  const search = useRef(null);

  useEffect(() => {
    setCompleted(loadCompleted());
    const sync = () => setCompleted(loadCompleted());
    window.addEventListener('progress-change', sync);
    const mq = matchMedia('(min-width: 761px)');
    setWide(mq.matches);
    const onMq = () => setWide(mq.matches);
    mq.addEventListener('change', onMq);
    // "/" or Ctrl/Cmd+K jumps to lesson search.
    const onKey = (event) => {
      const typing = event.target.closest?.('input, textarea, select, [contenteditable="true"]');
      if ((event.key === '/' && !typing) || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
        event.preventDefault();
        search.current?.closest('details')?.setAttribute('open', '');
        search.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('progress-change', sync);
      mq.removeEventListener('change', onMq);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const section = sections.find((s) => s.id === activeSection);
  const lesson = section?.lessons.find((l) => l.id === activeLesson);
  let shown = 0;

  return (
    <aside className="lesson-sidebar" aria-label={t.courseNav}>
      {/* Re-keyed per lesson so the phone drawer folds after a pick. */}
      <details className="nav-drawer" open={wide || undefined} key={`${wide}:${activeSection}/${activeLesson}`}>
        <summary>
          <span>{t.lessons}</span>
          <span className="nav-current">{lesson ? `${section.title} · ${lesson.title}` : t.chooseLesson}</span>
          <Icon name="chevronDown" />
        </summary>
        <label className="nav-search">
          <Icon name="search" />
          <span className="sr-only">{t.searchLessons}</span>
          <input ref={search} id="lesson-search" type="search" placeholder={t.searchLessons} autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <nav aria-label={t.lessons}>
          {sections.map((s) => {
            const matches = s.lessons.filter((l) => !q || `${l.title} ${l.summary}`.toLowerCase().includes(q));
            shown += matches.length;
            if (!matches.length) return null;
            const done = s.lessons.filter((l) => completed.has(`${s.id}/${l.id}`)).length;
            return (
              <details key={s.id + (q ? ':q' : '')} className="nav-section" open={Boolean(q) || s.id === activeSection || undefined}>
                <summary id={`section-link-${s.id}`} className={`section-link ${s.id === activeSection ? 'is-active' : ''}`}>
                  <span>{s.title}</span>
                  <span className="section-count">{done}/{s.lessons.length}</span>
                  <Icon name="chevronDown" />
                </summary>
                <div className="lesson-list">
                  {matches.map((l) => {
                    const active = s.id === activeSection && l.id === activeLesson;
                    const isDone = completed.has(`${s.id}/${l.id}`);
                    return (
                      <Link key={l.id} id={`lesson-link-${s.id}-${l.id}`} className={`lesson-link ${active ? 'is-active' : ''}`} href={lessonPath(lang, s.id, l.id)} aria-current={active ? 'page' : undefined}>
                        <span className={`lesson-status ${isDone ? 'is-done' : ''}`}>
                          {isDone && (<><Icon name="check" /><span className="sr-only">{t.completed}</span></>)}
                        </span>
                        <strong>{l.title}</strong>
                        <span className="lesson-summary">{l.summary}</span>
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </nav>
        {shown === 0 && <p className="nav-empty">{t.noMatch}</p>}
      </details>
    </aside>
  );
}
