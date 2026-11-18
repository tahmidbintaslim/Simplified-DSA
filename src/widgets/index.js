import { animate, stagger } from 'motion';
import { binarySearchVariant } from '../demos/algorithms.js';
import { identityKeys, patchRow, reduceMotion, SPRING } from '../demos/motion.js';
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


/* ---------- Memory lane: why array[i] is one jump, not a search ---------- */

const MEMORY_WORDS = {
  en: {
    goal: 'Six values sit side by side in memory, starting at address 1000. Pick an index and watch the computer find it.',
    size: 'Each value takes',
    bytes: (b) => `${b} bytes`,
    index: 'Index',
    address: 'address',
    result: (i, addr) => `One multiplication and one addition land on address ${addr}. It never looked at the ${i} slot${i === 1 ? '' : 's'} before it, so reading is O(1) whether the array holds 6 values or 6 million.`,
    first: 'Index 0 is the start address itself. That is why counting starts at 0: the index is how many slots to skip.',
  },
  bn: {
    goal: 'ছয়টি মান মেমরিতে পাশাপাশি বসে আছে, ঠিকানা 1000 থেকে শুরু। একটা ইনডেক্স বেছে নাও আর দেখো কম্পিউটার কীভাবে সেটা খুঁজে পায়।',
    size: 'প্রতিটি মান নেয়',
    bytes: (b) => `${b} বাইট`,
    index: 'ইনডেক্স',
    address: 'ঠিকানা',
    result: (i, addr) => `একটা গুণ আর একটা যোগেই পৌঁছে গেল ঠিকানা ${addr}-এ। আগের ${i}টি ঘরের একটাও দেখতে হয়নি, তাই অ্যারেতে ৬টি মান থাকুক বা ৬০ লাখ, পড়া O(1)।`,
    first: 'ইনডেক্স 0 মানে শুরুর ঠিকানাটাই। এজন্যই গোনা শুরু হয় 0 থেকে: ইনডেক্স মানে কয়টি ঘর টপকাতে হবে।',
  },
};

function memoryLane(root, { lang = 'en' }) {
  const w = MEMORY_WORDS[lang] ?? MEMORY_WORDS.en;
  const values = [7, 12, 3, 25, 18, 9];
  const BASE = 1000;
  let size = 4;
  let index = 3;

  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <div class="widget-actions">
      <span class="memory-label">${w.size}</span>
      ${[4, 8].map((b) => `<button type="button" class="demo-button" data-size="${b}" aria-pressed="${b === size}">${w.bytes(b)}</button>`).join('')}
    </div>
    <div class="memory-lane">
      <span class="memory-jump" aria-hidden="true"></span>
      <div class="memory-row" role="group" aria-label="${w.index}"></div>
    </div>
    <p class="memory-formula" aria-live="polite"></p>
    <p class="widget-message"></p>
  `;
  const row = root.querySelector('.memory-row');
  const jump = root.querySelector('.memory-jump');
  const formula = root.querySelector('.memory-formula');
  const message = root.querySelector('.widget-message');

  const draw = ({ animate: moving = true } = {}) => {
    row.innerHTML = values
      .map(
        (value, i) => `<button type="button" class="memory-cell ${i === index ? 'is-hit' : ''}" data-index="${i}" aria-pressed="${i === index}" style="flex-grow:${size}">
          <span class="memory-value">${value}</span>
          <span class="memory-index">[${i}]</span>
          <span class="memory-address">${BASE + i * size}</span>
        </button>`,
      )
      .join('');
    const addr = BASE + index * size;
    formula.innerHTML = `${w.address} = <span class="f-base">${BASE}</span> + <span class="f-index">${index}</span> × <span class="f-size">${size}</span> = <strong>${addr}</strong>`;
    message.textContent = index === 0 ? w.first : w.result(index, addr);
    // The arrow flies straight to the cell: one jump, no walk.
    const cell = row.children[index];
    const target = { x: cell.offsetLeft + cell.offsetWidth / 2 - 6 };
    if (moving && !reduceMotion()) animate(jump, target, SPRING);
    else animate(jump, target, { duration: 0 });
    play(cell, { scale: [1.12, 1] });
  };

  root.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-index]');
    const sizeButton = event.target.closest('[data-size]');
    if (cell) index = Number(cell.dataset.index);
    if (sizeButton) {
      size = Number(sizeButton.dataset.size);
      root.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(b === sizeButton)));
    }
    if (cell || sizeButton) draw();
  });
  // Place the arrow once the row has a width (after the widget is attached).
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => draw({ animate: false })).observe(row);
  draw({ animate: false });
}

/* ---------- Shift cost: where you insert decides how much moves ---------- */

const SHIFT_WORDS = {
  en: {
    goal: 'Eight values, no gaps allowed. Click a gap between cells to insert 99 there.',
    gap: (k) => `Insert at index ${k}`,
    result: (k, moved) => `Inserting at index ${k} moved ${moved} value${moved === 1 ? '' : 's'}. ${moved === 0 ? 'The end is free: nothing is in the way.' : moved === 8 ? 'The front is the worst case: every value had to move.' : 'Everything after the gap had to step right.'} Click the row to try another spot.`,
    chart: 'Values moved for each insert position',
    reset: 'Reset',
    start: 'Try the front, then the end. The bars below fill in as you try positions.',
  },
  bn: {
    goal: 'আটটি মান, মাঝে কোনো ফাঁক রাখা যাবে না। দুই ঘরের মাঝের ফাঁকে ক্লিক করে সেখানে 99 বসাও।',
    gap: (k) => `ইনডেক্স ${k}-এ বসাও`,
    result: (k, moved) => `ইনডেক্স ${k}-এ বসাতে ${moved}টি মান সরাতে হলো। ${moved === 0 ? 'শেষ মাথা ফাঁকা: কেউ পথ আটকে নেই।' : moved === 8 ? 'সামনে বসানোই সবচেয়ে খারাপ: সব মান সরাতে হয়েছে।' : 'ফাঁকের পরের সবাইকে এক ঘর ডানে সরতে হয়েছে।'} আরেকটা জায়গা চেষ্টা করতে সারিতে ক্লিক করো।`,
    chart: 'কোন অবস্থানে বসালে কয়টি মান সরে',
    reset: 'আবার শুরু',
    start: 'প্রথমে সামনে, তারপর শেষে চেষ্টা করো। যত অবস্থান চেষ্টা করবে, নিচের বারগুলো ভরতে থাকবে।',
  },
};

function shiftCost(root, { lang = 'en' }) {
  const w = SHIFT_WORDS[lang] ?? SHIFT_WORDS.en;
  const START = [4, 8, 15, 16, 23, 42, 51, 60];
  const keys = identityKeys();
  const tried = new Set();
  let values = [...START];
  let inserted = -1;

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal">${w.goal}</p>
      <div class="widget-actions"><button type="button" class="demo-button" data-act="reset">${w.reset}</button></div>
    </div>
    <div class="shift-stage"><div class="array-row shift-row"></div></div>
    <p class="widget-message" aria-live="polite">${w.start}</p>
    <figure class="shift-chart" aria-label="${w.chart}">
      <div class="shift-bars"></div>
      <figcaption>${w.chart}</figcaption>
    </figure>
  `;
  const row = root.querySelector('.shift-row');
  const message = root.querySelector('.widget-message');
  const bars = root.querySelector('.shift-bars');

  const draw = () => {
    // Gap buttons come out first: patchRow keeps unkeyed children as anchors.
    row.querySelectorAll('.shift-gap').forEach((gap) => gap.remove());
    const ids = keys(values);
    // Cells keep their identity, so a shift is each value sliding one slot right.
    patchRow(
      row,
      values.map((value, i) => ({
        key: ids[i],
        className: `array-cell ${i === inserted ? 'is-hit' : inserted >= 0 && i > inserted ? 'is-moved' : ''}`,
        html: `<span class="array-value">${value}</span><span class="array-index">${i}</span>`,
      })),
      { enter: { y: -28 } },
    );
    // Gap buttons sit between cells (only before an insert, so the row stays readable).
    if (inserted < 0) {
      [...row.querySelectorAll('[data-key]')].forEach((cell, k) => cell.insertAdjacentHTML('beforebegin', `<button type="button" class="shift-gap" data-gap="${k}" aria-label="${w.gap(k)}"></button>`));
      row.insertAdjacentHTML('beforeend', `<button type="button" class="shift-gap" data-gap="${values.length}" aria-label="${w.gap(values.length)}"></button>`);
    }
    bars.innerHTML = Array.from({ length: START.length + 1 }, (_, k) => {
      const moved = START.length - k;
      return `<span class="shift-bar ${tried.has(k) ? 'is-tried' : ''} ${k === inserted ? 'is-now' : ''}" style="--h:${(moved / START.length) * 100}%"><span class="shift-bar-fill"></span><span class="shift-bar-label">${k}</span></span>`;
    }).join('');
  };

  root.addEventListener('click', (event) => {
    const gap = event.target.closest('[data-gap]');
    if (gap) {
      const k = Number(gap.dataset.gap);
      values = [...START];
      values.splice(k, 0, 99);
      inserted = k;
      tried.add(k);
      message.textContent = w.result(k, START.length - k);
      draw();
      play(bars.querySelector('.is-now .shift-bar-fill'), { scaleY: [0, 1] });
      return;
    }
    if (event.target.closest('[data-act="reset"]')) {
      values = [...START];
      inserted = -1;
      message.textContent = w.start;
      draw();
    }
  });
  // After each insert, the next click on the row starts a fresh try.
  row.addEventListener('click', (event) => {
    if (inserted >= 0 && !event.target.closest('[data-gap]')) {
      values = [...START];
      inserted = -1;
      draw();
    }
  });
  draw();
}

/* ---------- Characters and bytes: what "length" really counts ---------- */

const BYTES_WORDS = {
  en: {
    goal: 'Type any text. The same string, counted three ways.',
    label: 'Text',
    seen: 'What you see (characters)',
    points: 'Code points (what Python len() counts)',
    bytes: 'Bytes in UTF-8 (what is stored)',
    note: (g, c, b) =>
      g === c && c === b
        ? `Plain English letters: one character, one code point, one byte each. Easy mode.`
        : `${g} character${g === 1 ? '' : 's'} on screen, ${c} code point${c === 1 ? '' : 's'}, ${b} bytes in memory. Indexing a string by position can split a character in half, so slice text carefully.`,
  },
  bn: {
    goal: 'যেকোনো লেখা লেখো। একই স্ট্রিং, তিনভাবে গোনা।',
    label: 'লেখা',
    seen: 'যা চোখে দেখো (অক্ষর)',
    points: 'কোড পয়েন্ট (Python len() যা গোনে)',
    bytes: 'UTF-8-এ বাইট (যা আসলে জমা থাকে)',
    note: (g, c, b) =>
      g === c && c === b
        ? `সাধারণ ইংরেজি অক্ষর: প্রতিটি অক্ষর মানে একটা কোড পয়েন্ট, একটা বাইট। সহজ ব্যাপার।`
        : `পর্দায় ${g}টি অক্ষর, ${c}টি কোড পয়েন্ট, মেমরিতে ${b} বাইট। "বা" দেখতে একটা অক্ষর, কিন্তু ভেতরে ব-এর সাথে া কার জোড়া। তাই অবস্থান ধরে স্ট্রিং কাটলে অক্ষর ভেঙে যেতে পারে।`,
  },
};

function stringBytes(root, { lang = 'en' }) {
  const w = BYTES_WORDS[lang] ?? BYTES_WORDS.en;
  const presets = ['code', 'café', 'বাংলা', '👋🏽'];
  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <div class="widget-actions">
      <label class="bytes-input">${w.label} <input class="demo-input" type="text" maxlength="12" value="${lang === 'bn' ? 'বাংলা' : 'café'}" /></label>
      ${presets.map((p) => `<button type="button" class="demo-button" data-text="${p}">${p}</button>`).join('')}
    </div>
    <div class="bytes-rows"></div>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const input = root.querySelector('input');
  const rows = root.querySelector('.bytes-rows');
  const message = root.querySelector('.widget-message');
  const encoder = new TextEncoder();
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(lang, { granularity: 'grapheme' }) : null;

  const draw = () => {
    const text = input.value;
    const graphemes = segmenter ? [...segmenter.segment(text)].map((s) => s.segment) : Array.from(text);
    const points = Array.from(text);
    const bytes = [...encoder.encode(text)];
    const cells = (items, cls) => items.map((item) => `<span class="bytes-cell ${cls}">${escapeHtml(item)}</span>`).join('');
    const hex = (b) => b.toString(16).toUpperCase().padStart(2, '0');
    const name = (cp) => `U+${cp.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
    rows.innerHTML = `
      <div class="bytes-row"><p>${w.seen} <strong>${graphemes.length}</strong></p><div class="bytes-cells">${cells(graphemes, 'is-seen')}</div></div>
      <div class="bytes-row"><p>${w.points} <strong>${points.length}</strong></p><div class="bytes-cells">${points.map((p) => `<span class="bytes-cell is-point"><span>${escapeHtml(p)}</span><small>${name(p)}</small></span>`).join('')}</div></div>
      <div class="bytes-row"><p>${w.bytes} <strong>${bytes.length}</strong></p><div class="bytes-cells">${cells(bytes.map(hex), 'is-byte')}</div></div>`;
    message.textContent = w.note(graphemes.length, points.length, bytes.length);
    play([...rows.querySelectorAll('.bytes-cell')], { opacity: [0, 1], y: [6, 0] }, { ...SPRING, delay: stagger(0.015) });
  };

  root.addEventListener('click', (event) => {
    const preset = event.target.closest('[data-text]');
    if (!preset) return;
    input.value = preset.dataset.text;
    draw();
  });
  input.addEventListener('input', draw);
  draw();
}

export const widgets = {
  'guess-game': guessGame,
  halving,
  'bug-lab': bugLab,
  'memory-lane': memoryLane,
  'shift-cost': shiftCost,
  'string-bytes': stringBytes,
};
