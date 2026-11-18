'use client';
import { useEffect, useRef, useState } from 'react';
import { inView } from 'motion';
import { binarySearchFrames } from '../src/demos/algorithms.js';
import { patchRow, reduceMotion } from '../src/demos/motion.js';
import { MarkdownRenderer } from '../src/utils/markdown.js';
import Icon from './Icon.js';
import { dict } from '../lib/i18n.js';

const VALUES = [3, 9, 14, 21, 30, 42, 57];
const TARGET = 30;
const FRAMES = binarySearchFrames(VALUES, TARGET);
const renderer = new MarkdownRenderer();

/** One step of a real binary search, as a lesson figure (escaped by the renderer). */
// The hero's step captions in Bangla (the shared frames carry English ones).
const bnCaption = (frame) => {
  const value = VALUES[frame.found >= 0 ? frame.found : frame.mid];
  if (Number.isInteger(frame.found) && frame.found >= 0) return `মাঝের মান ${value}, যা ${TARGET}-এর সমান। ${frame.found} নম্বর ইনডেক্সে পাওয়া গেল।`;
  return value < TARGET
    ? `মাঝের মান ${value}, যা ${TARGET}-এর চেয়ে ছোট, তাই বাম অর্ধেক বাদ।`
    : `মাঝের মান ${value}, যা ${TARGET}-এর চেয়ে বড়, তাই ডান অর্ধেক বাদ।`;
};

function figureHtml(step, t, lang) {
  const frame = FRAMES[step];
  // found is null until found (-1 if missing); null >= 0 is true in JS.
  const isFound = Number.isInteger(frame.found) && frame.found >= 0;
  const mid = isFound ? frame.found : frame.mid;
  const outside = VALUES.map((_, i) => i).filter((i) => i < frame.lo || i > frame.hi);
  return {
    mid,
    html: renderer.render(
      [
        '```cells',
        `values: ${VALUES.join(' ')}`,
        `pointers: lo=${frame.lo} mid=${mid} hi=${frame.hi}`,
        isFound ? `found: ${frame.found}` : `highlight: ${mid}`,
        outside.length ? `dim: ${outside.join(' ')}` : '',
        `note: ${t.heroNote(step + 1, FRAMES.length, TARGET, lang === 'bn' ? bnCaption(frame) : frame.caption)}`,
        '```',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  };
}

/**
 * The home hero: the learner steps a binary search; the beam follows the
 * middle cell. The first time it is seen it plays itself once (not with
 * reduced motion); any click stops that.
 */
export default function HeroFigure({ lang }) {
  const t = dict(lang).home;
  const [step, setStep] = useState(0);
  const holder = useRef(null);
  const figure = useRef(null);
  const auto = useRef({ stopped: false, timer: 0 });
  const last = FRAMES.length - 1;
  const { mid, html } = figureHtml(step, t, lang);

  // Patch cells in place so they cross-fade instead of being rebuilt.
  useEffect(() => {
    const el = holder.current;
    const row = el.querySelector('.array-row');
    if (!row) {
      el.innerHTML = html;
      return;
    }
    const next = document.createElement('div');
    next.innerHTML = html;
    [...row.children].forEach((cell, i) => (cell.dataset.key ||= `h${i}`));
    patchRow(row, [...next.querySelectorAll('.array-row > .array-cell')].map((cell, i) => ({ key: `h${i}`, className: cell.className, html: cell.innerHTML })));
    el.querySelector('figcaption').innerHTML = next.querySelector('figcaption').innerHTML;
  }, [html]);

  useEffect(() => {
    const a = auto.current;
    if (reduceMotion() || typeof IntersectionObserver !== 'function') return;
    const stopView = inView(
      figure.current,
      () => {
        stopView();
        const tick = () => {
          if (a.stopped) return;
          setStep((s) => {
            if (s >= last) {
              a.stopped = true;
              return s;
            }
            a.timer = setTimeout(tick, 1600);
            return s + 1;
          });
        };
        a.timer = setTimeout(tick, 1200);
      },
      { amount: 0.6 },
    );
    return () => {
      a.stopped = true;
      clearTimeout(a.timer);
      stopView();
    };
  }, [last]);

  const go = (to) => {
    auto.current.stopped = true;
    clearTimeout(auto.current.timer);
    setStep(to);
    // Keep focus on a button that still works: Next until the end, then Start over.
    if (to === last) requestAnimationFrame(() => document.getElementById('hero-reset')?.focus());
    if (to === 0) requestAnimationFrame(() => document.getElementById('hero-next')?.focus());
  };

  return (
    <div className="hero-figure" ref={figure} style={{ '--mid-offset': mid - 3 }}>
      <span className="beam" aria-hidden="true" />
      <div ref={holder} />
      <p className="hero-steps">
        <button id="hero-next" type="button" className="demo-button is-primary" onClick={() => go(Math.min(last, step + 1))} disabled={step === last}>
          {t.nextStep} <Icon name="next" />
        </button>
        <button id="hero-reset" type="button" className="demo-button" onClick={() => go(0)} disabled={step === 0}>
          {t.startOver}
        </button>
      </p>
    </div>
  );
}
