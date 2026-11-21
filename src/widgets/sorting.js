import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

// The one idea: when both halves are already sorted, the smallest value left
// is always one of the two fronts, so one comparison places one value.

const WORDS = {
  en: {
    goal: 'Two halves, each already sorted. Build one sorted row: click the front card that should go next.',
    left: 'Left half',
    right: 'Right half',
    out: 'Merged',
    empty: 'empty',
    fresh: 'New halves',
    front: (v) => `Take ${v}, the front card`,
    waiting: (v) => `${v}, not at the front yet`,
    count: (c, pairs) => `Comparisons: ${c}. Comparing every left card with every right card would take ${pairs}.`,
    start: 'Only the two gold fronts can be the smallest. Everything behind them is bigger.',
    took: (v, other) => `${v} is smaller than ${other}, so ${v} goes next. One comparison, one value placed.`,
    wrong: (v, other) => `${v} cannot go next: ${other} is waiting at the other front, and it is smaller.`,
    free: (v) => `The other half is empty, so ${v} walks over with no comparison.`,
    done: (n, c) => `${n} values merged with ${c} comparisons. It can never take more than ${n - 1}, because every comparison places one value.`,
  },
  bn: {
    goal: 'দুটি অর্ধেক, প্রতিটি আগে থেকেই সাজানো। এক সারিতে সাজাও: সামনের যে কার্ডটা এরপর বসা উচিত, সেটায় ক্লিক করো।',
    left: 'বাম অর্ধেক',
    right: 'ডান অর্ধেক',
    out: 'জোড়া লাগানো সারি',
    empty: 'খালি',
    fresh: 'নতুন দুই অর্ধেক',
    front: (v) => `সামনের কার্ড ${v} তোলো`,
    waiting: (v) => `${v}, এখনো সামনে আসেনি`,
    count: (c, pairs) => `তুলনা: ${c}টি। বামের প্রতিটি কার্ডকে ডানের প্রতিটির সাথে মেলালে লাগত ${pairs}টি।`,
    start: 'সবচেয়ে ছোট মানটা শুধু সোনালি দুই সামনের কার্ডের একটাই হতে পারে। পেছনের সবগুলো আরও বড়।',
    took: (v, other) => `${v} হলো ${other}-এর চেয়ে ছোট, তাই এরপর ${v} বসে। একটা তুলনা, একটা মান জায়গামতো।`,
    wrong: (v, other) => `${v} এখন বসতে পারে না: অন্য পাশের সামনে ${other} অপেক্ষা করছে, আর সেটা ছোট।`,
    free: (v) => `অন্য অর্ধেক খালি, তাই ${v} কোনো তুলনা ছাড়াই চলে আসে।`,
    done: (n, c) => `${n}টি মান জোড়া লাগল ${c}টি তুলনায়। ${n - 1}টির বেশি কখনোই লাগে না, কারণ প্রতিটি তুলনা একটা মানকে জায়গামতো বসায়।`,
  },
};

const HALF = 4;
const play = (el, keyframes, options = SPRING) => !reduceMotion() && el && animate(el, keyframes, options);

function mergeFronts(root, { lang = 'en' }) {
  const w = WORDS[lang] ?? WORDS.en;
  let halves;
  let out;
  let compares;

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal">${w.goal}</p>
      <div class="widget-actions"><button type="button" class="demo-button" data-act="fresh">${w.fresh}</button></div>
    </div>
    <div class="merge-fronts-halves">
      ${['left', 'right'].map((side) => `<div class="merge-fronts-half"><span class="merge-fronts-label">${w[side]}</span><div class="array-row merge-fronts-row" data-side="${side}" role="group" aria-label="${w[side]}"></div></div>`).join('')}
    </div>
    <div class="merge-fronts-half"><span class="merge-fronts-label">${w.out}</span><div class="array-row merge-fronts-out"></div></div>
    <p class="merge-fronts-count"></p>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const rows = { left: root.querySelector('[data-side="left"]'), right: root.querySelector('[data-side="right"]') };
  const outRow = root.querySelector('.merge-fronts-out');
  const count = root.querySelector('.merge-fronts-count');
  const message = root.querySelector('.widget-message');

  const draw = () => {
    for (const side of ['left', 'right']) {
      rows[side].innerHTML = halves[side].length
        ? halves[side]
            .map((value, i) =>
              i === 0
                ? `<button type="button" class="array-cell merge-fronts-card is-hit" data-take="${side}" aria-label="${escapeHtml(w.front(value))}"><span class="array-value">${value}</span></button>`
                : `<button type="button" class="array-cell merge-fronts-card" disabled aria-label="${escapeHtml(w.waiting(value))}"><span class="array-value">${value}</span></button>`,
            )
            .join('')
        : `<span class="merge-fronts-empty">${w.empty}</span>`;
    }
    outRow.innerHTML = Array.from({ length: HALF * 2 }, (_, i) =>
      i < out.length ? `<div class="array-cell is-moved"><span class="array-value">${out[i]}</span></div>` : '<div class="array-cell is-gap"><span class="array-value">&nbsp;</span></div>',
    ).join('');
    count.textContent = w.count(compares, HALF * HALF);
  };

  const deal = (values) => {
    halves = { left: values.slice(0, HALF).sort((a, b) => a - b), right: values.slice(HALF).sort((a, b) => a - b) };
    out = [];
    compares = 0;
    message.textContent = w.start;
    draw();
  };

  const shuffled = () => {
    // Eight different values, so there is never a tie to explain.
    const pool = Array.from({ length: 30 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, HALF * 2);
  };

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-act="fresh"]')) return deal(shuffled());
    const card = event.target.closest('[data-take]');
    if (!card) return;
    const side = card.dataset.take;
    const other = side === 'left' ? 'right' : 'left';
    const value = halves[side][0];
    const rival = halves[other][0];
    if (rival !== undefined && rival < value) {
      message.textContent = w.wrong(value, rival);
      play(card, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.35 });
      return;
    }
    const from = card.getBoundingClientRect();
    halves[side].shift();
    out.push(value);
    if (rival !== undefined) compares++;
    draw();
    message.textContent = out.length === HALF * 2 ? w.done(out.length, compares) : rival === undefined ? w.free(value) : w.took(value, rival);
    // The card flies from its half to its slot in the merged row.
    const placed = outRow.children[out.length - 1];
    const to = placed.getBoundingClientRect();
    play(placed, { x: [from.left - to.left, 0], y: [from.top - to.top, 0] });
    // Redrawing replaced the button that was pressed: keep the keyboard on a front card.
    (rows[side].querySelector('[data-take]') ?? rows[other].querySelector('[data-take]') ?? root.querySelector('[data-act="fresh"]')).focus({ preventScroll: true });
  });

  deal([3, 9, 14, 20, 5, 7, 16, 25]);
}

export default { 'merge-fronts': mergeFronts };
