'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadCompleted } from '../src/core/progress.js';
import HeroFigure from './HeroFigure.js';
import Icon from './Icon.js';

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

const path = (entry) => `/${entry.section.id}/${entry.lesson.id}`;

/** What this is, where to start (or continue), and the whole course as a map. */
export default function Home({ sections, numbers }) {
  const [completed, setCompleted] = useState(() => new Set());
  useEffect(() => setCompleted(loadCompleted()), []);

  const all = sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
  const isDone = ({ section, lesson }) => completed.has(`${section.id}/${lesson.id}`);
  const doneCount = all.filter(isDone).length;
  const nextUp = all.find((entry) => !isDone(entry)) ?? all[0];
  const startLabel = doneCount ? `Continue: ${nextUp.lesson.title}` : `Start with ${nextUp.lesson.title}`;

  return (
    <div className="home">
      <div className="hero-band">
        <div className="hero-haze" aria-hidden="true" />
        <section className="hero" aria-labelledby="home-title">
          <div className="hero-text">
            <h1 id="home-title">See every step.<span>Learn DSA by tracing it.</span></h1>
            <p className="lead">Free lessons for complete beginners: plain words, a small example traced by hand, and a demo you drive yourself, one step at a time.</p>
            <p className="home-actions">
              <Link className="demo-button is-primary" href={path(nextUp)}>{startLabel} <Icon name="arrowRight" /></Link>
              <a className="demo-button" href="#course-map"><Icon name="list" /> Browse all lessons</a>
            </p>
            <ul className="hero-checks">
              <li><Icon name="check" /> {all.length} lessons, basics to patterns</li>
              <li><Icon name="check" /> A demo you drive in every lesson</li>
              <li><Icon name="check" /> Free, with a free account</li>
            </ul>
          </div>
          <HeroFigure />
        </section>
      </div>

      <section className="home-block home-numbers" aria-labelledby="numbers-title">
        <div className="home-block-head">
          <h2 id="numbers-title">Small enough to finish.</h2>
          <p className="home-block-lead">Every number here is counted from the lessons themselves.</p>
        </div>
        <dl className="numbers-panel">
          {numbers.map(([label, value, note]) => (
            <div key={label}><dt>{label}</dt><dd><strong>{value}</strong><span>{note}</span></dd></div>
          ))}
        </dl>
      </section>

      <section className="home-block" aria-labelledby="sections-title">
        <h2 id="sections-title">Three parts, one path</h2>
        <p className="home-block-lead">Start with the shapes data takes, then the steps that act on it, then the patterns interviews reuse.</p>
        <ol className="section-cards">
          {sections.map((section, i) => {
            const entries = section.lessons.map((lesson) => ({ section, lesson }));
            const done = entries.filter(isDone).length;
            const target = entries.find((entry) => !isDone(entry)) ?? entries[0];
            return (
              <li key={section.id}>
                <Link className="section-card" href={path(target)}>
                  <span className="section-card-art" aria-hidden="true"><MiniFigure {...SECTION_FIGURES[i % SECTION_FIGURES.length]} /></span>
                  <span className="section-card-tab">{section.lessons.length} lessons</span>
                  <strong>{section.title}</strong>
                  <span className="lesson-summary">{section.description}</span>
                  <span className="course-meta">{done ? `${done} of ${section.lessons.length} done` : `Starts with ${target.lesson.title}`}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="home-block" id="course-map" aria-labelledby="map-title" tabIndex={-1}>
        <div className="home-block-head">
          <h2 id="map-title">Course map</h2>
          <span className="home-progress">{doneCount} of {all.length} lessons done</span>
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
                        {isDone(entry) && (<><Icon name="check" /><span className="sr-only">Completed: </span></>)}
                      </span>
                      <strong>{lesson.title}</strong>
                      <span className="lesson-summary">{lesson.summary}</span>
                      <span className="course-meta">{[lesson.minutes && `${lesson.minutes} min`, lesson.level].filter(Boolean).join(' · ')}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </section>

      <section className="home-closing" aria-labelledby="closing-title">
        <h2 id="closing-title">Your first lesson takes about {nextUp.lesson.minutes ?? 12} minutes.</h2>
        <p>Read it, trace it, then drive the demo yourself. A free account keeps your place.</p>
        <Link className="demo-button is-primary" href={path(nextUp)}>{startLabel} <Icon name="arrowRight" /></Link>
      </section>
    </div>
  );
}
