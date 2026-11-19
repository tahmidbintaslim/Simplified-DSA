'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { dict } from '../lib/i18n.js';
import { answerQuiz } from './quiz.js';
import { track } from './Analytics.js';

/**
 * A lesson's quizzes, one at a time. The question HTML comes from the server
 * (escaped by the Markdown renderer). Score = answers right on the first try.
 */
export default function QuizRunner({ lang, contentLang, lessonKey, quizzes, lessonHref }) {
  const t = dict(lang).quizzes;
  const words = dict(contentLang).quiz;
  const [step, setStep] = useState(0);
  const [settled, setSettled] = useState(false);
  const [right, setRight] = useState(0);
  const [round, setRound] = useState(0);
  const box = useRef(null);
  const done = step >= quizzes.length;

  const onClick = (event) => {
    const option = event.target.closest('[data-quiz-option]');
    if (!option || settled) return;
    if (answerQuiz(option, lessonKey, words, contentLang)) {
      setSettled(true);
      if (option.closest('.quiz').dataset.firstTry) setRight((r) => r + 1);
    }
  };
  const next = () => {
    setStep((s) => s + 1);
    setSettled(false);
    if (step + 1 >= quizzes.length) track('quiz_set_done', { lesson: lessonKey, right: right, total: quizzes.length });
    requestAnimationFrame(() => box.current?.querySelector('button, a')?.focus());
  };
  const again = () => {
    setStep(0);
    setRight(0);
    setSettled(false);
    setRound((r) => r + 1);
  };

  return (
    <section className="quiz-runner" ref={box} aria-live="polite">
      <div className="quiz-progress" aria-hidden="true">
        <span style={{ width: `${(Math.min(step + (settled ? 1 : 0), quizzes.length) / quizzes.length) * 100}%` }} />
      </div>
      {done ? (
        <div className="quiz-score">
          <p className="quiz-score-number">{t.score(right, quizzes.length)}</p>
          <p>{right === quizzes.length ? t.perfect : t.review}</p>
          <p className="home-actions">
            <button type="button" className="demo-button" onClick={again}>{t.again}</button>
            <Link className="demo-button is-primary" href={lessonHref}>{t.lesson}</Link>
          </p>
        </div>
      ) : (
        <>
          <p className="quiz-step">{t.of(step + 1, quizzes.length)}</p>
          {/* A new key per question and round gives each a fresh, unanswered copy. */}
          <div
            key={`${round}:${step}`}
            className="lesson-content"
            lang={contentLang}
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: quizzes[step].replace('<div class="quiz">', `<div class="quiz" data-index="${step}">`) }}
          />
          <p className="home-actions">
            <button type="button" className="demo-button is-primary" onClick={next} disabled={!settled}>
              {step + 1 === quizzes.length ? t.finish : t.next}
            </button>
          </p>
        </>
      )}
    </section>
  );
}
