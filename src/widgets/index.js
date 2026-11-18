import { animate, stagger } from 'motion';
import { binarySearchVariant } from '../demos/algorithms.js';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

/**
 * Small interactive widgets that sit inside a lesson's reading, one idea
 * each, in the style of Josh Comeau's explainers: a playable hook, a slider
 * that builds intuition, a bug you can switch on and watch fail. A lesson
 * places one with a ```widget block (see utils/markdown.js); App.attachWidgets
 * mounts it. Each widget owns its element and keeps its state across
 * re-renders of the same lesson.
 */

const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const play = (el, keyframes, options = SPRING) => !reduceMotion() && el && animate(el, keyframes, options);

/* ---------- Guess the card: binary search as a game, before any theory ---------- */

function guessGame(root, config) {
  const n = Math.min(32, Math.max(4, Number(config.cards) || 16));
  const best = Math.floor(Math.log2(n)) + 1; // the most checks binary search can need
  let values;
  let target;
  let flipped;
  let lo;
  let hi;
  let guesses;
  let autoplay = null;

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal"></p>
      <div class="widget-actions">
        <button type="button" class="demo-button" data-act="watch">Watch binary search play</button>
        <button type="button" class="demo-button" data-act="new">New cards</button>
      </div>
    </div>
    <div class="guess-row" role="group" aria-label="Face-down cards, sorted from smallest to largest"></div>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const row = root.querySelector('.guess-row');
  const goal = root.querySelector('.widget-goal');
  const message = root.querySelector('.widget-message');

  const draw = () => {
    row.innerHTML = values
      .map((value, i) => {
        const open = flipped.has(i);
        const out = !open && (i < lo || i > hi);
        const state = open ? (value === target ? 'is-found' : 'is-open') : out ? 'is-out' : '';
        return `<button type="button" class="guess-card ${state}" data-card="${i}" ${out || open ? 'disabled' : ''} aria-label="${open ? `Card ${i}: ${value}` : out ? `Card ${i}: ruled out` : `Card ${i}: face down`}">
          <span class="guess-face">${open ? value : '?'}</span><span class="array-index">${i}</span></button>`;
      })
      .join('');
  };

  const reset = () => {
    clearTimeout(autoplay);
    autoplay = null;
    const pool = new Set();
    while (pool.size < n) pool.add(randomInt(1, 99));
    values = [...pool].sort((a, b) => a - b);
    target = values[randomInt(0, n - 1)];
    flipped = new Set();
    lo = 0;
    hi = n - 1;
    guesses = 0;
    goal.innerHTML = `The ${n} cards are sorted, smallest on the left. Find <strong>${target}</strong> by turning over as few cards as you can.`;
    message.textContent = 'Pick any card to start.';
    draw();
  };

  const flip = (i) => {
    if (flipped.has(i) || i < lo || i > hi) return;
    flipped.add(i);
    guesses += 1;
    const value = values[i];
    const before = hi - lo + 1;
    if (value < target) lo = i + 1;
    if (value > target) hi = i - 1;
    draw();
    play(row.querySelector(`[data-card="${i}"]`), { rotateY: [90, 0], scale: [0.9, 1] });
    if (value === target) {
      message.textContent =
        guesses <= best
          ? `Found ${target} in ${guesses} guess${guesses === 1 ? '' : 'es'}. Always turning the middle card never needs more than ${best} for ${n} cards.`
          : `Found ${target} in ${guesses} guesses. Always turning the middle card never needs more than ${best}. Try "Watch binary search play".`;
      play([...row.querySelectorAll('.guess-card.is-out')], { opacity: [1, 0.35] }, { duration: 0.3 });
      return;
    }
    // Cards this one guess removed from play (itself included).
    const ruled = before - (hi - lo + 1);
    message.textContent = `${value} is ${value < target ? 'smaller' : 'bigger'} than ${target}, so it must be to the ${value < target ? 'right' : 'left'}. That one guess ruled out ${ruled} card${ruled === 1 ? '' : 's'}.`;
    play([...row.querySelectorAll('.guess-card.is-out')], { y: [0, 6, 0] }, { duration: 0.35, delay: stagger(0.02) });
  };

  // The smart way, played for you: always the middle of what is left.
  const watch = () => {
    reset();
    const tick = () => {
      if (!root.isConnected) return;
      const mid = Math.floor((lo + hi) / 2);
      flip(mid);
      if (values[mid] !== target) autoplay = setTimeout(tick, 1100);
    };
    autoplay = setTimeout(tick, 600);
  };

  root.addEventListener('click', (event) => {
    const card = event.target.closest('[data-card]');
    if (card) {
      clearTimeout(autoplay);
      return flip(Number(card.dataset.card));
    }
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (act === 'new') reset();
    if (act === 'watch') watch();
  });

  reset();
}

/* ---------- Halving: how a million shrinks to one ---------- */

function halving(root) {
  const sizes = [8, 16, 100, 1000, 10000, 100000, 1000000];
  root.innerHTML = `
    <label class="widget-slider">Values in the list: <output></output>
      <input type="range" min="0" max="${sizes.length - 1}" value="${sizes.length - 1}" step="1" />
    </label>
    <ol class="halving-rows"></ol>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const input = root.querySelector('input');
  const output = root.querySelector('output');
  const list = root.querySelector('.halving-rows');
  const message = root.querySelector('.widget-message');

  const draw = () => {
    const n = sizes[Number(input.value)];
    output.textContent = n.toLocaleString('en-US');
    input.setAttribute('aria-valuetext', `${n.toLocaleString('en-US')} values`);
    const rows = [];
    // Worst case: each check leaves the bigger half, minus the value checked.
    for (let left = n; left >= 1; left = Math.floor(left / 2)) rows.push(left);
    list.innerHTML = rows
      .map(
        (left, i) => `<li><span class="halving-label">${i === 0 ? 'Start' : `Check ${i}`}</span>
          <span class="halving-track"><span class="halving-bar" style="width: max(3px, ${(left / n) * 100}%)"></span></span>
          <span class="halving-count">${left.toLocaleString('en-US')} left</span></li>`,
      )
      .join('');
    message.textContent = `${n.toLocaleString('en-US')} values, at most ${rows.length} checks. A left-to-right scan could need all ${n.toLocaleString('en-US')}.`;
    play([...list.children], { opacity: [0, 1], x: [-10, 0] }, { ...SPRING, delay: stagger(0.035) });
  };

  input.addEventListener('input', draw);
  draw();
}

/* ---------- Bug lab: switch on a classic mistake and watch it fail ---------- */

function bugLab(root) {
  const values = [3, 9, 14, 21, 30];
  let target = 30;
  root.innerHTML = `
    <div class="bug-switches">
      <label class="bug-switch"><input type="checkbox" data-bug="strict" /> Loop while <code>lo &lt; hi</code></label>
      <label class="bug-switch"><input type="checkbox" data-bug="hiMid" /> Shrink with <code>hi = mid</code></label>
    </div>
    <pre class="bug-code"><code></code></pre>
    <div class="widget-actions" role="group" aria-label="Search for">
      <span class="bug-in">Search <code>[${values.join(', ')}]</code> for</span>
      ${[3, 14, 30, 10].map((t) => `<button type="button" class="demo-button" data-target="${t}">${t}</button>`).join('')}
    </div>
    <ol class="bug-trace"></ol>
    <p class="bug-result" aria-live="polite"></p>
  `;
  const code = root.querySelector('.bug-code code');
  const trace = root.querySelector('.bug-trace');
  const result = root.querySelector('.bug-result');
  const strict = root.querySelector('[data-bug="strict"]');
  const hiMid = root.querySelector('[data-bug="hiMid"]');

  const run = () => {
    const bugs = { strict: strict.checked, hiMid: hiMid.checked };
    // The code updates with the switches; the changed lines are marked.
    const line = (text, changed) => (changed ? `<mark>${escapeHtml(text)}</mark>` : escapeHtml(text));
    code.innerHTML = [
      'lo, hi = 0, len(a) - 1',
      line(`while lo ${bugs.strict ? '<' : '<='} hi:`, bugs.strict),
      '    mid = (lo + hi) // 2',
      '    if a[mid] == target: return mid',
      '    if a[mid] < target: lo = mid + 1',
      line(`    else: hi = ${bugs.hiMid ? 'mid' : 'mid - 1'}`, bugs.hiMid),
      'return "not found"',
    ].join('\n');

    const { steps, result: outcome, lo, hi } = binarySearchVariant(values, target, bugs);
    const shown = outcome === 'stuck' ? [...steps, steps.at(-1), steps.at(-1)] : steps;
    trace.innerHTML = shown
      .map(({ lo: l, hi: h, mid }, i) => {
        const v = values[mid];
        const go = v === target ? 'found it' : v < target ? 'go right' : 'go left';
        return `<li class="${i >= steps.length ? 'is-repeat' : ''}"><code>lo=${l} hi=${h} mid=${mid}</code> ${v} ${v === target ? '=' : v < target ? '<' : '>'} ${target}: ${go}</li>`;
      })
      .join('');
    const verdicts = {
      found: [`Found ${target}.`, 'is-ok'],
      'not-found': [`Correct: ${target} is not in the list.`, 'is-ok'],
      missed: [`Missed! ${target} is in the list, but the loop stopped (lo = ${lo}, hi = ${hi}) before checking it. With lo &lt; hi, the last candidate is never looked at.`, 'is-bad'],
      stuck: [`Stuck! lo and hi stopped changing, so this loop never ends. hi = mid keeps a value that was already too big.`, 'is-bad'],
    };
    const [text, tone] = verdicts[outcome];
    result.innerHTML = text;
    result.className = `bug-result ${tone}`;
    play([...trace.children], { opacity: [0, 1], x: [-8, 0] }, { ...SPRING, delay: stagger(0.12) });
    play(result, { opacity: [0, 1], y: [6, 0] }, { ...SPRING, delay: 0.12 * shown.length });
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-target]');
    if (!button) return;
    target = Number(button.dataset.target);
    root.querySelectorAll('[data-target]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    run();
  });
  root.addEventListener('change', run);
  root.querySelector('[data-target="30"]').setAttribute('aria-pressed', 'true');
  run();
}

export const widgets = {
  'guess-game': guessGame,
  halving,
  'bug-lab': bugLab,
};
