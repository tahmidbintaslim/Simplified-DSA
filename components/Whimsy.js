'use client';
import { useEffect } from 'react';
import { animate } from 'motion';

/**
 * Small touches of feedback, each tied to something the learner did:
 * a card's light follows the pointer, counted numbers count up when they
 * scroll into view, and a right answer or a finished mission pops a few
 * sparks. All of it stays still under prefers-reduced-motion.
 */
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPARK_COLOURS = ['var(--accent)', 'var(--look-line)', 'var(--done)', '#f472b6', '#38bdf8'];

/** A short burst of sparks from the middle of `el`: the reward for getting something right. */
export function burst(el, count = 14) {
  if (!el || still()) return;
  const { left, top, width, height } = el.getBoundingClientRect();
  const layer = document.createElement('span');
  layer.className = 'spark-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.left = `${left + width / 2}px`;
  layer.style.top = `${top + height / 2}px`;
  document.body.append(layer);
  const done = [];
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('span');
    spark.className = i % 3 ? 'spark' : 'spark is-square';
    spark.style.background = SPARK_COLOURS[i % SPARK_COLOURS.length];
    layer.append(spark);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const reach = 46 + Math.random() * 52;
    // Out fast, then fall a little: a pop, not a firework.
    done.push(
      animate(
        spark,
        { x: [0, Math.cos(angle) * reach], y: [0, Math.sin(angle) * reach + 26], scale: [0.4, 1, 0], rotate: [0, 180 + Math.random() * 180], opacity: [1, 1, 0] },
        { duration: 0.7 + Math.random() * 0.25, ease: [0.16, 1, 0.3, 1] },
      ).finished,
    );
  }
  Promise.allSettled(done).then(() => layer.remove());
}

const CARDS = '.hub-card, .section-card, .course-lesson, .feature-row, .home-closing';

export default function Whimsy() {
  useEffect(() => {
    // The light inside a card sits under the pointer.
    const onMove = (event) => {
      const card = event.target.closest?.(CARDS);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      // The closing band's tiles lean away from the pointer.
      if (card.matches('.home-closing')) {
        card.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
        card.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
      }
    };
    document.addEventListener('pointermove', onMove, { passive: true });

    // Numbers count up once, when first seen.
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          seen.unobserve(entry.target);
          const el = entry.target;
          const end = Number(el.dataset.count);
          if (still() || !Number.isFinite(end)) continue;
          animate(0, end, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = String(Math.round(v))) });
        }
      },
      { threshold: 0.6 },
    );
    const watch = () => document.querySelectorAll('[data-count]:not([data-watched])').forEach((el) => {
      el.dataset.watched = 'true';
      seen.observe(el);
    });
    watch();
    // Pages swap under one layout, so look again after each navigation.
    const pages = new MutationObserver(watch);
    pages.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('pointermove', onMove);
      seen.disconnect();
      pages.disconnect();
    };
  }, []);
  return null;
}
