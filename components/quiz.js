'use client';
import { track } from './Analytics.js';
import { recordQuiz } from '../app/actions.js';

/**
 * Answer one quiz (the lesson page and the quiz page share this). A wrong
 * pick says "try again" with what that choice gets wrong; the answer appears
 * on a right pick, or after two wrong ones. Each answer is saved.
 * Returns true once the quiz is settled (right, or the answer was shown).
 */
export function answerQuiz(option, lessonKey, words, lang) {
  const quiz = option.closest('.quiz');
  if (quiz.dataset.solved) return true;
  const correct = option.dataset.quizOption === 'true';
  const misses = Number(quiz.dataset.misses ?? 0) + (correct ? 0 : 1);
  quiz.dataset.misses = misses;
  option.classList.add(correct ? 'is-right' : 'is-wrong');
  option.setAttribute('aria-pressed', 'true');
  option.dataset.mark = correct ? words.markRight : words.markWrong;
  const attempt = misses + (correct ? 1 : 0);
  // The quiz's position in its lesson: the quiz page marks it, the lesson page counts it.
  const index = quiz.dataset.index !== undefined ? Number(quiz.dataset.index) : [...quiz.closest('.lesson-content').querySelectorAll('.quiz')].indexOf(quiz);
  track('quiz_answered', { lesson: lessonKey, quiz: index, correct, attempt, lang });
  recordQuiz(lessonKey, index, correct, attempt, lang).catch(() => {});

  const reveal = correct || misses >= 2;
  if (correct && misses === 0) quiz.dataset.firstTry = 'true';
  if (reveal) {
    quiz.dataset.solved = 'true';
    quiz.querySelectorAll('[data-quiz-option]').forEach((b) => b.setAttribute('aria-disabled', 'true'));
    const right = quiz.querySelector('[data-quiz-option="true"]');
    right.classList.add('is-right');
    right.dataset.mark = words.markRight;
  }
  const why = quiz.querySelector('.quiz-why').textContent;
  const whyNot = correct ? '' : option.querySelector('.quiz-why-not')?.textContent ?? '';
  const notQuite = `${words.notQuite}${whyNot ? ` ${whyNot}` : ''}`;
  quiz.querySelector('.quiz-feedback').textContent = correct
    ? `${words.correct} ${why}`
    : reveal
      ? `${notQuite} ${words.highlighted} ${why}`
      : `${notQuite} ${words.tryAgain}`;
  return reveal;
}
