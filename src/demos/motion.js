import { animate, inView, stagger } from 'motion';

/**
 * Motion for the step demos, built on Motion (motion.dev, formerly Framer
 * Motion): things that move on screen move, instead of being redrawn in
 * their new place.
 *
 * - patchRow keeps one element per key (a value, a slot, a node) across
 *   steps, so a swapped value slides to its new position (FLIP), a changed
 *   value pops, new things enter and removed things leave with a motion you
 *   choose (a pop flies up, a dequeue leaves to the left).
 * - glidePointers keeps one token per pointer name (lo, mid, hi, L, R, slow,
 *   fast…) and glides it to the cell it points at.
 * - setRange draws one bracket around the live range (lo..hi, a window) that
 *   stretches and shrinks with the algorithm.
 * - ripple plays a step-by-step walk (a list walk, a tree path) in order.
 *
 * Springs (not fixed durations) drive all movement, so an animation that is
 * interrupted by the next step keeps its velocity and never jumps. Colours
 * and opacity cross-fade in CSS: springs are for position. With
 * prefers-reduced-motion, every update still happens, without movement.
 */

export const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// One spring for the whole site: settles in about 0.45s with a little bounce.
export const SPRING = { type: 'spring', visualDuration: 0.45, bounce: 0.2 };
const INSTANT = { duration: 0 };

const move = (el, keyframes, options = SPRING) => animate(el, keyframes, reduceMotion() ? INSTANT : options);

/**
 * Update `row` so its keyed children match `items`
 * ([{ key, className, html, style?, attrs?, pop? }]), reusing elements by key.
 * Children without data-key (labels, a trailing "null") are left in place.
 *
 * `enter` / `exit` are Motion keyframes for things that appear or leave,
 * e.g. { y: -30 } for a value dropping onto a stack.
 */
export function patchRow(row, items, { tag = 'div', enter = { scale: 0.6 }, exit = { scale: 0.6 } } = {}) {
  const existing = new Map();
  for (const el of row.children) if (el.dataset.key) existing.set(el.dataset.key, el);
  // The first fill (page load, a new lesson) appears in place; only changes move.
  const animated = !reduceMotion() && row.isConnected && existing.size > 0;
  // First: where everything is now (mid-flight positions included).
  const before = new Map();
  if (animated) existing.forEach((el, key) => before.set(key, el.getBoundingClientRect()));

  const popped = new Set();
  const nodes = items.map(({ key, className, html, style = '', attrs = {}, pop = false }) => {
    let el = existing.get(key);
    if (el) existing.delete(key);
    else {
      el = document.createElement(tag);
      el.dataset.key = key;
    }
    for (const [name, value] of Object.entries(attrs)) if (el.getAttribute(name) !== String(value)) el.setAttribute(name, value);
    if (el.className !== className) el.className = className;
    if (el.dataset.style !== style) {
      // Our own inline style (a bar height); Motion's transform is kept.
      const transform = el.style.transform;
      el.setAttribute('style', style);
      if (transform) el.style.transform = transform;
      el.dataset.style = style;
    }
    if (el.dataset.html !== html) {
      if (el.dataset.html !== undefined) popped.add(el);
      el.innerHTML = html;
      el.dataset.html = html;
    }
    if (pop) popped.add(el);
    return el;
  });

  // Leaving: a copy flies off from where it was, so the layout can close at once.
  if (animated) existing.forEach((el, key) => leave(el, before.get(key), exit));
  existing.forEach((el) => el.remove());

  // Last: put them in order (moving an element keeps it, so FLIP can follow it).
  const anchor = [...row.children].find((child) => !child.dataset.key) ?? null;
  nodes.forEach((el) => {
    if (el.nextSibling !== anchor || el.parentNode !== row) row.insertBefore(el, anchor);
  });
  if (!animated) return;

  // Invert and play on a spring.
  for (const el of nodes) {
    const first = before.get(el.dataset.key);
    if (!first) {
      animate(el, { opacity: [0, 1], ...from(enter) }, SPRING);
      continue;
    }
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) animate(el, { x: [dx, 0], y: [dy, 0] }, SPRING);
    else if (popped.has(el)) animate(el, { scale: [1.16, 1] }, SPRING);
  }
}

// { y: -30 } → { y: [-30, 0] }: from that offset back to rest.
const from = (keyframes) =>
  Object.fromEntries(Object.entries(keyframes).map(([name, value]) => [name, [value, name === 'scale' ? 1 : 0]]));

// Animate a fixed-position copy of a removed element away, then drop it.
function leave(el, rect, exit) {
  if (!rect) return;
  const ghost = el.cloneNode(true);
  ghost.removeAttribute('data-key');
  ghost.removeAttribute('id');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.classList.add('motion-ghost');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    pointerEvents: 'none',
    zIndex: '30',
    transform: 'none',
  });
  document.body.append(ghost);
  animate(ghost, { opacity: 0, ...exit }, { ...SPRING, visualDuration: 0.35 }).then(() => ghost.remove());
}

/** Send an element that is about to be redrawn away with `exit` keyframes. */
export function flyAway(el, exit = { scale: 0.6 }) {
  if (reduceMotion() || !el?.isConnected) return;
  leave(el, el.getBoundingClientRect(), exit);
}

/** Play a walk: pulse `elements` one after another, in order. */
export function ripple(elements, { gap = 0.14, scale = 1.16 } = {}) {
  if (reduceMotion() || !elements.length) return;
  animate(elements, { scale: [1, scale, 1] }, { duration: 0.42, delay: stagger(gap), ease: 'easeOut' });
}

/** Fly an element in from another element's position (e.g. a key from the input box). */
export function flyFrom(el, source) {
  if (reduceMotion() || !el || !source) return;
  const a = source.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  animate(el, { x: [a.left - b.left, 0], y: [a.top - b.top, 0], scale: [0.8, 1] }, { ...SPRING, visualDuration: 0.6 });
}

/**
 * Keys that follow values, not positions: the same 7 keeps its key when it
 * moves, so a swap reads as two values trading places. Repeated values are
 * matched left to right.
 */
export function identityKeys() {
  let prevValues = [];
  let prevKeys = [];
  let next = 0;
  const keyer = (values) => {
    const used = new Set();
    const keys = values.map((value) => {
      const i = prevValues.findIndex((v, j) => v === value && !used.has(j));
      if (i === -1) return `v${next++}`;
      used.add(i);
      return prevKeys[i];
    });
    // A copy: callers may mutate their array in place (unshift, splice).
    prevValues = [...values];
    prevKeys = keys;
    return keys;
  };
  keyer.reset = () => {
    prevValues = [];
    prevKeys = [];
  };
  return keyer;
}

// Centre of keyed child i of `row`, relative to the row's offset parent.
const cellCentre = (row, i) => {
  const cell = row.querySelectorAll(':scope > [data-key]')[i];
  return cell ? cell.offsetLeft + cell.offsetWidth / 2 : null;
};

/**
 * Glide named pointer tokens under the cells they point at. `pointers` maps a
 * name to a cell index (or null/-1 to hide it). Names on the same cell stack.
 */
export function glidePointers(track, row, pointers, { instant = false } = {}) {
  const tokens = new Map([...track.children].map((el) => [el.dataset.name, el]));
  const stacked = new Map();
  for (const [name, index] of Object.entries(pointers)) {
    let el = tokens.get(name);
    const fresh = !el;
    if (fresh) {
      el = document.createElement('span');
      el.className = 'pointer-token';
      el.dataset.name = name;
      el.textContent = name;
      track.append(el);
    }
    tokens.delete(name);
    const x = index === null || index < 0 ? null : cellCentre(row, index);
    el.classList.toggle('is-hidden', x === null);
    if (x === null) continue;
    const level = stacked.get(index) ?? 0;
    stacked.set(index, level + 1);
    el.dataset.x = String(x);
    const target = { x: x - el.offsetWidth / 2, y: level * 15 };
    if (instant || fresh) animate(el, target, INSTANT);
    else move(el, target);
  }
  tokens.forEach((el) => el.classList.add('is-hidden'));
}

/** Frame cells from..to with one bracket that stretches and shrinks; hide it when from > to. */
export function setRange(bracket, row, from, to, { instant = false } = {}) {
  const cells = row.querySelectorAll(':scope > [data-key]');
  const a = cells[from];
  const b = cells[to];
  const show = Boolean(a && b && from <= to);
  const wasHidden = bracket.classList.contains('is-hidden');
  bracket.classList.toggle('is-hidden', !show);
  if (!show) return;
  const target = { x: a.offsetLeft - 4, width: b.offsetLeft + b.offsetWidth - a.offsetLeft + 8 };
  if (instant || wasHidden) animate(bracket, target, INSTANT);
  else move(bracket, target);
}

/** The HTML for one array cell's content. */
export const cellHtml = (value, index) =>
  `<span class="array-value">${value}</span>${index === undefined ? '' : `<span class="array-index">${index}</span>`}`;

/** The markup for one motion row: a range bracket, the cells, a pointer track. */
export const motionRowHtml = (rowClass = '') => `
  <div class="motion-row">
    <span class="range-bracket is-hidden" aria-hidden="true"></span>
    <div class="array-row ${rowClass}"></div>
    <div class="pointer-track" aria-hidden="true"></div>
  </div>`;

/** A demo stage holding one motion row. */
export const motionStageHtml = (rowClass = '') => `<div class="demo-stage">${motionRowHtml(rowClass)}</div>`;

/**
 * Drive one motion stage. update() patches the cells, then places pointers
 * and the bracket once layout is known: right away, and whenever the row
 * resizes (which also covers the demo being attached to the page). Placement
 * on attach or resize is instant, so tokens never fly in from the left.
 */
export function motionRow(container) {
  const row = container.querySelector('.array-row');
  const track = container.querySelector('.pointer-track');
  const bracket = container.querySelector('.range-bracket');
  let state = { pointers: {}, range: null };

  const place = ({ instant = false } = {}) => {
    if (!row.offsetWidth) return;
    const first = !container.dataset.placed;
    container.dataset.placed = '1';
    const now = instant || first;
    glidePointers(track, row, state.pointers, { instant: now });
    if (state.range) setRange(bracket, row, state.range[0], state.range[1], { instant: now });
    else bracket.classList.add('is-hidden');
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => place({ instant: true })).observe(row);

  return {
    row,
    update(items, { pointers = {}, range = null } = {}) {
      patchRow(row, items);
      state = { pointers, range };
      place();
    },
  };
}

/**
 * Figures in the reading reveal themselves: the first time a figure scrolls
 * into view, its cells cascade in. `seen` (a Set) remembers revealed figures
 * across re-renders of the same lesson, so nothing replays on a tab click.
 */
export function revealOnScroll(root, seen) {
  if (reduceMotion() || typeof IntersectionObserver !== 'function') return;
  root.querySelectorAll('.cells-figure:not(.cells-step)').forEach((figure, i) => {
    if (seen.has(i)) return;
    const cells = [...figure.querySelectorAll('.array-row > *')];
    const extras = [...figure.querySelectorAll('figcaption, .pointer-track, .cell-pointer')];
    cells.forEach((cell) => (cell.style.opacity = '0'));
    extras.forEach((el) => (el.style.opacity = '0'));
    const stop = inView(
      figure,
      () => {
        seen.add(i);
        stop();
        animate(cells, { opacity: [0, 1], y: [14, 0] }, { ...SPRING, delay: stagger(0.045) });
        animate(extras, { opacity: [0, 1] }, { duration: 0.35, delay: 0.12 + cells.length * 0.045 });
      },
      { amount: 0.35 },
    );
  });
}
