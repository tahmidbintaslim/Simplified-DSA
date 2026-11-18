'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { demos } from '../src/demos/index.js';
import { widgets } from '../src/widgets/index.js';
import { hydrateSteppers } from '../src/core/steppers.js';
import { revealOnScroll } from '../src/demos/motion.js';
import { loadCompleted, saveCompleted } from '../src/core/progress.js';
import { track } from './Analytics.js';
import Icon from './Icon.js';
import LanguageComparison from './LanguageComparison.js';

/**
 * One lesson. The article HTML is built (and escaped) on the server; here it
 * is set once, then the live parts are mounted into it: the demo, the
 * widgets, the scrubbable worked examples, quizzes and "On this page".
 * React never re-renders the article, so mounted demos keep their state.
 */
export default function LessonView({ lessonKey, html, headings, demoId, languageExamples, previous, next, total }) {
  const article = useRef(null);
  const [done, setDone] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const root = article.current;
    track('lesson_viewed', { lesson: lessonKey });
    // Mount once (React's dev double-run of effects would mount twice).
    if (root.dataset.mounted) return;
    root.dataset.mounted = '1';

    const slot = root.querySelector('[data-demo-slot]');
    if (slot && demos[demoId]) {
      const el = document.createElement('div');
      el.className = 'demo';
      demos[demoId].mount(el);
      slot.replaceWith(el);
      // One event per demo session is enough to see which demos get used.
      el.addEventListener('click', (e) => e.target.closest('button') && track('demo_used', { lesson: lessonKey, demo: demoId }), { once: true });
    }
    root.querySelectorAll('[data-widget]').forEach((placeholder) => {
      const mount = widgets[placeholder.dataset.widget];
      if (!mount) return placeholder.remove();
      const el = document.createElement('figure');
      el.className = `widget widget-${placeholder.dataset.widget}`;
      mount(el, JSON.parse(placeholder.dataset.config || '{}'));
      placeholder.replaceWith(el);
    });
    hydrateSteppers(root, new Map());
    revealOnScroll(root, new Set());

    // "On this page" follows the heading being read.
    let observer;
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (top) setCurrent(top.target.id);
        },
        { rootMargin: '0px 0px -70% 0px' },
      );
      root.querySelectorAll('h2[id]').forEach((h) => observer.observe(h));
    }

    return () => observer?.disconnect();
  }, [html, demoId, lessonKey]);

  useEffect(() => {
    const completed = loadCompleted();
    setDone(completed.has(lessonKey));
    setDoneCount(completed.size);
  }, [lessonKey]);

  const toggleComplete = () => {
    const completed = loadCompleted();
    if (completed.has(lessonKey)) completed.delete(lessonKey);
    else {
      completed.add(lessonKey);
      track('lesson_completed', { lesson: lessonKey });
    }
    saveCompleted(completed);
    setDone(completed.has(lessonKey));
    setDoneCount(completed.size);
    window.dispatchEvent(new Event('progress-change'));
  };

  // Quizzes and in-page links live inside the server HTML, so one delegated handler.
  const onClick = (event) => {
    const option = event.target.closest('[data-quiz-option]');
    if (option) return answerQuiz(option, lessonKey);
    const jump = event.target.closest('a[href^="#"]');
    if (jump) {
      const target = document.getElementById(jump.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.scrollIntoView({ block: 'start' });
      target.focus({ preventScroll: true });
    }
  };

  return (
    <div className="lesson-layout">
      <div className="lesson-column">
        <article className="lesson-content" ref={article} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
        {languageExamples?.length ? <LanguageComparison examples={languageExamples} /> : null}
        <footer className={`lesson-footer ${done ? 'is-done' : ''}`}>
          <p className="completion-note" role="status">
            {done ? (
              <>
                Lesson done. You have finished {doneCount} of {total} lessons.{' '}
                {next ? <>Up next: <strong>{next.title}</strong>. </> : 'That is the whole course so far. '}
                <Link href="/">See your course map</Link>
              </>
            ) : (
              'Tried the practice prompt? Mark the lesson complete to track your progress.'
            )}
          </p>
          <button id="complete-button" type="button" className={`demo-button ${done ? 'is-done' : 'is-primary'}`} onClick={toggleComplete} aria-pressed={done}>
            {done ? (<><Icon name="check" /> Completed</>) : 'Mark as complete'}
          </button>
          <nav className="lesson-steps" aria-label="Previous and next lesson">
            {previous ? (
              <Link className="lesson-step" href={previous.href}>
                <span><Icon name="arrowLeft" /> Previous</span><strong>{previous.title}</strong><small>{previous.summary}</small>
              </Link>
            ) : <span />}
            {next ? (
              <Link className="lesson-step" href={next.href}>
                <span>Next <Icon name="arrowRight" /></span><strong>{next.title}</strong><small>{next.summary}</small>
              </Link>
            ) : <span />}
          </nav>
        </footer>
      </div>
      <nav className="toc" aria-label="On this page">
        <p><Icon name="list" /> On this page</p>
        <ol>
          {headings.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`} aria-current={current === h.id ? 'true' : undefined} onClick={onClick}>{h.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/**
 * A wrong pick says "try again" with what that choice gets wrong; the answer
 * appears on a right pick, or after two wrong ones.
 */
function answerQuiz(option, lessonKey) {
  const quiz = option.closest('.quiz');
  if (quiz.dataset.solved) return;
  const correct = option.dataset.quizOption === 'true';
  const misses = Number(quiz.dataset.misses ?? 0) + (correct ? 0 : 1);
  quiz.dataset.misses = misses;
  option.classList.add(correct ? 'is-right' : 'is-wrong');
  option.setAttribute('aria-pressed', 'true');
  option.dataset.mark = correct ? 'Correct' : 'Not this one';
  track('quiz_answered', { lesson: lessonKey, correct, attempt: misses + (correct ? 1 : 0) });

  const reveal = correct || misses >= 2;
  if (reveal) {
    quiz.dataset.solved = 'true';
    quiz.querySelectorAll('[data-quiz-option]').forEach((b) => b.setAttribute('aria-disabled', 'true'));
    const right = quiz.querySelector('[data-quiz-option="true"]');
    right.classList.add('is-right');
    right.dataset.mark = 'Correct';
  }
  const why = quiz.querySelector('.quiz-why').textContent;
  const whyNot = correct ? '' : option.querySelector('.quiz-why-not')?.textContent ?? '';
  const notQuite = `Not quite.${whyNot ? ` ${whyNot}` : ''}`;
  quiz.querySelector('.quiz-feedback').textContent = correct
    ? `Correct. ${why}`
    : reveal
      ? `${notQuite} The answer is highlighted. ${why}`
      : `${notQuite} Have another think and try again.`;
}
