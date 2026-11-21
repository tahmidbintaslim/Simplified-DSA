'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.js';
import { burst } from './Whimsy.js';
import { dict } from '../lib/i18n.js';

/**
 * The hero is a toy that teaches one idea: sorting is fixing pairs that are
 * out of order. Seven blocks can be dragged (or moved with the arrow keys)
 * into order while the caption counts the pairs still wrong; "Sort it for
 * me" runs bubble sort and shows it needs exactly one swap per such pair.
 * The blocks watch the pointer, because a toy should look back at you.
 */
const START = [4, 7, 2, 6, 1, 5, 3];
const HUES = [172, 204, 232, 262, 292, 330, 22];

const inversions = (order) => order.reduce((n, a, i) => n + order.slice(i + 1).filter((b) => b < a).length, 0);
const move = (order, from, to) => {
  const next = [...order];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

export default function HeroPlayground({ lang }) {
  const t = dict(lang).home.hero;
  const [order, setOrder] = useState(START);
  const [moves, setMoves] = useState(0);
  const [held, setHeld] = useState(null); // { value, dx }
  const [auto, setAuto] = useState(null); // { swaps, pair, done }
  const stage = useRef(null);
  const drag = useRef(null);
  const timer = useRef(null);
  const wasSorted = useRef(false);

  const wrong = inversions(order);
  const sorted = wrong === 0;

  // Sorted by hand or by the algorithm: the row celebrates once.
  useEffect(() => {
    if (sorted && !wasSorted.current && !held) burst(stage.current, 26);
    if (!held) wasSorted.current = sorted;
  }, [sorted, held]);

  // The blocks look toward the pointer.
  useEffect(() => {
    const onMove = (event) => {
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - (r.left + r.width / 2)) / (r.width / 1.2)));
      const y = Math.max(-1, Math.min(1, (event.clientY - (r.top + r.height / 2)) / (r.height / 1.2)));
      el.style.setProperty('--look-x', x.toFixed(2));
      el.style.setProperty('--look-y', y.toFixed(2));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      clearTimeout(timer.current);
    };
  }, []);

  const stopAuto = () => {
    clearTimeout(timer.current);
    setAuto(null);
  };

  const onPointerDown = (event, value) => {
    if (event.button) return;
    stopAuto();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { value, startX: event.clientX, slot: event.currentTarget.offsetWidth, from: order.indexOf(value), changed: false };
    setHeld({ value, dx: 0 });
  };

  const onPointerMove = (event) => {
    const d = drag.current;
    if (!d) return;
    let dx = event.clientX - d.startX;
    // Past half a slot, the block takes the neighbour's place and the neighbour slides back.
    setOrder((now) => {
      let index = now.indexOf(d.value);
      let next = now;
      while (dx > d.slot / 2 && index < next.length - 1) {
        next = move(next, index, index + 1);
        index += 1;
        dx -= d.slot;
        d.startX += d.slot;
      }
      while (dx < -d.slot / 2 && index > 0) {
        next = move(next, index, index - 1);
        index -= 1;
        dx += d.slot;
        d.startX -= d.slot;
      }
      d.changed = index !== d.from;
      return next;
    });
    setHeld({ value: d.value, dx: event.clientX - d.startX });
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (d.changed) setMoves((m) => m + 1);
    setHeld(null);
  };

  const onKeyDown = (event, value) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    const index = order.indexOf(value);
    const to = index + step;
    if (to < 0 || to >= order.length) return;
    event.preventDefault();
    stopAuto();
    setOrder(move(order, index, to));
    setMoves((m) => m + 1);
  };

  const shuffle = () => {
    stopAuto();
    let next = order;
    while (inversions(next) < 6) next = [...next].sort(() => Math.random() - 0.5);
    setOrder(next);
    setMoves(0);
  };

  // Bubble sort, one comparison per tick, so each swap can be seen.
  const solve = () => {
    stopAuto();
    setMoves(0);
    let row = order;
    let swaps = 0;
    let i = 0;
    let end = row.length - 1;
    const tick = () => {
      if (inversions(row) === 0) return setAuto({ swaps, pair: null, done: true });
      if (i >= end) {
        i = 0;
        end -= 1;
      }
      const pair = [row[i], row[i + 1]];
      if (pair[0] > pair[1]) {
        row = move(row, i, i + 1);
        swaps += 1;
        setOrder(row);
      }
      setAuto({ swaps, pair, done: false });
      i += 1;
      timer.current = setTimeout(tick, 300);
    };
    tick();
  };

  const caption = auto
    ? auto.done ? t.autoDone(auto.swaps) : t.auto(auto.swaps)
    : sorted ? (moves ? t.sorted(moves) : t.sortedIdle)
    : `${moves ? `${t.moves(moves)} ` : `${t.goal} `}${t.pairs(wrong)}`;

  return (
    <div className="playground">
      <div className="playground-tools" role="toolbar" aria-label={t.stage}>
        <button type="button" className="playground-tool" onClick={shuffle}><Icon name="shuffle" /> <span>{t.shuffle}</span></button>
        <button type="button" className="playground-tool is-wand" onClick={solve} disabled={sorted && !auto}><Icon name="wand" /> <span>{t.solve}</span></button>
      </div>
      <div ref={stage} className={`playground-stage ${sorted ? 'is-sorted' : ''}`} role="group" aria-label={t.stage}>
        {START.slice().sort().map((value) => {
          const index = order.indexOf(value);
          const isHeld = held?.value === value;
          return (
            <button
              key={value}
              type="button"
              className={`block ${isHeld ? 'is-held' : ''} ${auto?.pair?.includes(value) ? 'is-compared' : ''}`}
              style={{ '--i': index, '--v': value, '--hue': HUES[value - 1], '--dx': isHeld ? `${held.dx}px` : '0px' }}
              aria-label={t.block(value, index + 1, order.length)}
              onPointerDown={(event) => onPointerDown(event, value)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(event) => onKeyDown(event, value)}
            >
              <span className="block-body">
                <span className="block-face" aria-hidden="true"><i /><i /></span>
                <span className="block-value">{value}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="playground-caption" aria-live="polite">{caption}</p>
    </div>
  );
}
