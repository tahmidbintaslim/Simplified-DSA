'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadCompleted } from '../src/core/progress.js';
import HeroFigure from './HeroFigure.js';
import Icon from './Icon.js';
import { dict } from '../lib/i18n.js';

// Section cards show one real step in the step vocabulary, not decoration.
const SECTION_FIGURES = [
  { values: [7, 3, 9, 1, 5], states: { 2: 'is-hit' }, labels: { 2: 'a[2]' }, caption: 'Read a[2]: one jump, no scan.' },
  { values: [1, 3, 9, 7, 5], states: { 0: 'is-moved', 1: 'is-moved', 2: 'is-hit', 3: 'is-hit' }, labels: { 2: 'i', 3: 'i+1' }, caption: 'Compare 9 and 7, then swap.' },
  { values: [1, 3, 4, 6, 8, 11], states: { 0: 'is-out', 1: 'is-hit', 4: 'is-hit', 5: 'is-out' }, labels: { 1: 'L', 4: 'R' }, caption: '3 + 8 = 11, too big: move R.' },
];

function MiniFigure({ values, states, labels, caption }) {
  return (
    <span className="mini-figure">
      <span className="array-row">
        {values.map((value, i) => (
          <span key={i} className={`array-cell ${states[i] ?? ''}`}>
            <span className="array-value">{value}</span>
            <span className="cell-pointer">{labels[i] ?? ' '}</span>
          </span>
        ))}
      </span>
      <span className="mini-caption">{caption}</span>
    </span>
  );
}



/** What this is, where to start (or continue), and the whole course as a map. */
export default function Home({ lang, sections, numbers, children }) {
  const t = dict(lang).home;
  const path = (entry) => `/${lang}/${entry.section.id}/${entry.lesson.id}`;
  const [completed, setCompleted] = useState(() => new Set());
  useEffect(() => setCompleted(loadCompleted()), []);

  const all = sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
  const isDone = ({ section, lesson }) => completed.has(`${section.id}/${lesson.id}`);
  const doneCount = all.filter(isDone).length;
  const nextUp = all.find((entry) => !isDone(entry)) ?? all[0];
  const startLabel = doneCount ? t.continue(nextUp.lesson.title) : t.start(nextUp.lesson.title);

  return (
    <div className="home">
      <div className="hero-band">
        <div className="hero-haze" aria-hidden="true" />
        <section className="hero" aria-labelledby="home-title">
          <div className="hero-text">
            <h1 id="home-title">{t.title}<span>{t.titleAccent}</span></h1>
            <p className="lead">{t.lead}</p>
            <p className="home-actions">
              <Link className="demo-button is-primary" href={path(nextUp)}>{startLabel} <Icon name="arrowRight" /></Link>
              <a className="demo-button" href="#course-map"><Icon name="list" /> {t.browse}</a>
            </p>
            <ul className="hero-checks">
              {t.checks(all.length).map((check) => (
                <li key={check}><Icon name="check" /> {check}</li>
              ))}
            </ul>
          </div>
          <HeroFigure lang={lang} />
        </section>
      </div>

      <section className="home-block home-numbers" aria-labelledby="numbers-title">
        <div className="home-block-head">
          <h2 id="numbers-title">{t.numbersTitle}</h2>
          <p className="home-block-lead">{t.numbersLead}</p>
        </div>
        <dl className="numbers-panel">
          {numbers.map(([label, value, note]) => (
            <div key={label}><dt>{label}</dt><dd><strong>{value}</strong><span>{note}</span></dd></div>
          ))}
        </dl>
      </section>

      <section className="home-block" aria-labelledby="sections-title">
        <h2 id="sections-title">{t.partsTitle}</h2>
        <p className="home-block-lead">{t.partsLead}</p>
        <ol className="section-cards">
          {sections.map((section, i) => {
            const entries = section.lessons.map((lesson) => ({ section, lesson }));
            const done = entries.filter(isDone).length;
            const target = entries.find((entry) => !isDone(entry)) ?? entries[0];
            return (
              <li key={section.id}>
                <Link className="section-card" href={path(target)}>
                  <span className="section-card-art" aria-hidden="true"><MiniFigure {...SECTION_FIGURES[i % SECTION_FIGURES.length]} /></span>
                  <span className="section-card-tab">{t.lessonsCount(section.lessons.length)}</span>
                  <strong>{section.title}</strong>
                  <span className="lesson-summary">{section.description}</span>
                  <span className="course-meta">{done ? t.doneOf(done, section.lessons.length) : t.startsWith(target.lesson.title)}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="home-block" id="course-map" aria-labelledby="map-title" tabIndex={-1}>
        <div className="home-block-head">
          <h2 id="map-title">{t.mapTitle}</h2>
          <span className="home-progress">{t.progress(doneCount, all.length)}</span>
        </div>
        {sections.map((section) => (
          <section key={section.id} className="course-section" aria-labelledby={`course-${section.id}`}>
            <h3 id={`course-${section.id}`}>{section.title}</h3>
            <ol className="course-list">
              {section.lessons.map((lesson) => {
                const entry = { section, lesson };
                return (
                  <li key={lesson.id}>
                    <Link className="course-lesson" href={path(entry)}>
                      <span className={`lesson-status ${isDone(entry) ? 'is-done' : ''}`}>
                        {isDone(entry) && (<><Icon name="check" /><span className="sr-only">{dict(lang).completed}</span></>)}
                      </span>
                      <strong>{lesson.title}</strong>
                      <span className="lesson-summary">{lesson.summary}</span>
                      <span className="course-meta">{[lesson.minutes && t.min(lesson.minutes), lesson.level].filter(Boolean).join(' · ')}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </section>

      {children ? <section className="home-block">{children}</section> : null}

      <section className="home-closing" aria-labelledby="closing-title">
        <h2 id="closing-title">{t.closingTitle(nextUp.lesson.minutes ?? 12)}</h2>
        <p>{t.closingLead}</p>
        <Link className="demo-button is-primary" href={path(nextUp)}>{startLabel} <Icon name="arrowRight" /></Link>
      </section>
    </div>
  );
}
