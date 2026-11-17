/**
 * Motion for the step demos: things that move on screen move, instead of
 * being redrawn in their new place.
 *
 * - patchRow keeps one element per key (a value, a slot) across steps, so a
 *   swapped value slides to its new position (FLIP), a state change cross-fades
 *   (CSS transitions on the reused element), and new cells grow in.
 * - glidePointers keeps one token per pointer name (lo, mid, hi, L, R, slow,
 *   fast…) under the row and glides it to the cell it points at.
 * - setRange draws one bracket around the live range (lo..hi, a window) that
 *   stretches and shrinks with the algorithm.
 *
 * Timing comes from a real spring (stiffness/damping), sampled into CSS
 * `linear()`. With prefers-reduced-motion everything still updates, only
 * without movement.
 */

const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Simulate a damped spring from 0 to 1 and sample it as a CSS linear() easing. */
export function springEasing({ stiffness = 210, damping = 24, mass = 1 } = {}) {
  const dt = 1 / 240;
  const samples = [];
  let x = 0;
  let v = 0;
  let t = 0;
  // Integrate until the spring has settled (or 1.5s, whichever comes first).
  while (t < 1.5) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    samples.push(x);
    if (Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.02) break;
  }
  const points = 36;
  const stops = Array.from({ length: points + 1 }, (_, i) => {
    const value = i === points ? 1 : samples[Math.round((i / points) * (samples.length - 1))];
    return value.toFixed(4);
  });
  return { easing: `linear(${stops.join(', ')})`, duration: Math.round(t * 1000) };
}

const supportsLinear = typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', 'linear(0, 1)');
const SPRING = supportsLinear ? springEasing() : { easing: 'cubic-bezier(0.22, 1, 0.36, 1)', duration: 420 };

// CSS transitions (pointer tokens, brackets, colours) share the same spring.
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--spring', SPRING.easing);
  document.documentElement.style.setProperty('--spring-ms', `${SPRING.duration}ms`);
}

/**
 * Update `row` so its keyed children match `items` ([{ key, className, html }]),
 * reusing elements by key. Children without data-key are left alone.
 */
export function patchRow(row, items, { tag = 'div' } = {}) {
  const existing = new Map();
  for (const el of row.children) if (el.dataset.key) existing.set(el.dataset.key, el);
  // The first fill (page load, a new lesson) appears in place; only changes move.
  const animate = !reduceMotion() && row.isConnected && existing.size > 0;
  // First: where everything is now (including any in-flight motion).
  const before = new Map();
  if (animate) existing.forEach((el, key) => before.set(key, el.getBoundingClientRect()));

  const nodes = items.map(({ key, className, html, style = '' }) => {
    let el = existing.get(key);
    if (el) existing.delete(key);
    else {
      el = document.createElement(tag);
      el.dataset.key = key;
    }
    if (el.className !== className) el.className = className;
    if ((el.getAttribute('style') ?? '') !== style) el.setAttribute('style', style);
    if (el.dataset.html !== html) {
      const changedValue = el.dataset.html !== undefined;
      el.innerHTML = html;
      el.dataset.html = html;
      if (changedValue && animate) el.dataset.changed = '1';
    }
    return el;
  });

  // Last: put them in order (moving an element keeps it, so FLIP can follow it).
  const anchor = [...row.children].find((child) => !child.dataset.key) ?? null;
  nodes.forEach((el) => row.insertBefore(el, anchor));
  existing.forEach((el) => el.remove());
  if (!animate) return;

  // Invert and play.
  for (const el of nodes) {
    const first = before.get(el.dataset.key);
    if (!first) {
      el.animate([{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], SPRING);
      continue;
    }
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (dx || dy) {
      el.getAnimations().forEach((a) => a.cancel());
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], SPRING);
    } else if (el.dataset.changed) {
      // Same place, new value: a small pop so the eye catches it.
      el.animate([{ transform: 'scale(1.14)' }, { transform: 'none' }], SPRING);
    }
    delete el.dataset.changed;
  }
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
    prevValues = values;
    prevKeys = keys;
    return keys;
  };
  keyer.reset = () => {
    prevValues = [];
    prevKeys = [];
  };
  return keyer;
}

// Centre of child i of `row`, relative to the row's offset parent.
const cellCentre = (row, i) => {
  const cell = row.querySelectorAll(':scope > [data-key]')[i];
  return cell ? cell.offsetLeft + cell.offsetWidth / 2 : null;
};

/**
 * Glide named pointer tokens under the cells they point at. `pointers` maps a
 * name to a cell index (or null/-1 to hide it). Names on the same cell stack.
 */
export function glidePointers(track, row, pointers) {
  const tokens = new Map([...track.children].map((el) => [el.dataset.name, el]));
  const stacked = new Map();
  for (const [name, index] of Object.entries(pointers)) {
    let el = tokens.get(name);
    if (!el) {
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
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--level', level);
  }
  tokens.forEach((el) => el.classList.add('is-hidden'));
}

/** Frame cells from..to with one bracket that stretches and shrinks; hide it when from > to. */
export function setRange(bracket, row, from, to) {
  const cells = row.querySelectorAll(':scope > [data-key]');
  const a = cells[from];
  const b = cells[to];
  const show = Boolean(a && b && from <= to);
  bracket.classList.toggle('is-hidden', !show);
  if (!show) return;
  bracket.style.setProperty('--left', `${a.offsetLeft - 4}px`);
  bracket.style.setProperty('--width', `${b.offsetLeft + b.offsetWidth - a.offsetLeft + 8}px`);
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
 * and the bracket once layout is known: right away, on the next frame (the
 * demo may not be attached yet) and whenever the row resizes. The first
 * placement happens without transitions, so tokens never fly in from the left.
 */
export function motionRow(container) {
  const row = container.querySelector('.array-row');
  const track = container.querySelector('.pointer-track');
  const bracket = container.querySelector('.range-bracket');
  let state = { pointers: {}, range: null };

  const place = () => {
    if (!row.offsetWidth) return;
    const first = !container.dataset.placed;
    if (first) container.classList.add('is-settling');
    glidePointers(track, row, state.pointers);
    if (state.range) setRange(bracket, row, state.range[0], state.range[1]);
    else bracket.classList.add('is-hidden');
    if (first) {
      container.dataset.placed = '1';
      requestAnimationFrame(() => requestAnimationFrame(() => container.classList.remove('is-settling')));
    }
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(place).observe(row);

  return {
    row,
    update(items, { pointers = {}, range = null } = {}) {
      patchRow(row, items);
      state = { pointers, range };
      place();
      requestAnimationFrame(place);
    },
  };
}
