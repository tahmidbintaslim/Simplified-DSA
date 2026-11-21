import { animate } from 'motion';
import { simpleHash } from '../demos/algorithms.js';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

// The one idea: load factor (keys ÷ buckets) is what makes chains long, and
// growing the bucket array, which re-places every key, makes them short again.

const WORDS = {
  en: {
    goal: 'Keep adding keys and watch the chains grow. Then double the buckets and watch them shrink.',
    add: 'Add a key',
    grow: 'Double the buckets',
    reset: 'Reset',
    buckets: 'Buckets',
    load: 'load factor',
    start: 'Three keys, four buckets, no collisions yet.',
    added: (key, b, chain) => `"${key}" landed in bucket ${b}. ${chain === 1 ? 'It has the bucket to itself.' : `That chain is now ${chain} keys long, so a lookup there checks up to ${chain} keys.`}`,
    over: ' The load factor is past 0.75: a real table would grow about now.',
    grown: (m, n, moved, before, after) => `Now ${m} buckets. All ${n} keys were placed again with sum % ${m}, and ${moved} of them changed bucket. The longest chain went from ${before} to ${after}.`,
    allIn: 'All 8 keys are in. Double the buckets to spread them out.',
    maxed: 'Every key has its own bucket: every lookup checks exactly 1 key. The price is the empty buckets, which are memory you paid for.',
  },
  bn: {
    goal: 'কী যোগ করতে থাকো আর দেখো chain কীভাবে লম্বা হয়। তারপর বাকেট দ্বিগুণ করো আর দেখো chain কীভাবে ছোট হয়ে যায়।',
    add: 'একটা কী যোগ করো',
    grow: 'বাকেট দ্বিগুণ করো',
    reset: 'আবার শুরু',
    buckets: 'বাকেট',
    load: 'load factor',
    start: 'তিনটি কী, চারটি বাকেট, এখনো কোনো collision নেই।',
    added: (key, b, chain) => `"${key}" পড়ল বাকেট ${b}-এ। ${chain === 1 ? 'বাকেটটায় সে একাই আছে।' : `ওই chain-এ এখন ${chain}টি কী, তাই সেখানে খুঁজতে গেলে ${chain}টি পর্যন্ত কী দেখতে হবে।`}`,
    over: ' Load factor 0.75 পার হয়ে গেছে: আসল টেবিল হলে এ সময়েই বড় হতো।',
    grown: (m, n, moved, before, after) => `এখন বাকেট ${m}টি। ${n}টি কী-ই sum % ${m} দিয়ে নতুন করে বসানো হলো, আর তার মধ্যে ${moved}টির বাকেট বদলে গেল। সবচেয়ে লম্বা chain ${before} থেকে হলো ${after}।`,
    allIn: '৮টি কী-ই ঢুকে গেছে। এদের ছড়িয়ে দিতে বাকেট দ্বিগুণ করো।',
    maxed: 'প্রতিটি কী এখন নিজের বাকেটে: প্রতিবার খুঁজতে ঠিক 1টি কী দেখলেই চলে। এর দাম হলো খালি বাকেটগুলো, যেগুলোর মেমরি তুমি খরচ করেছ।',
  },
};

// Chosen so 4 buckets crowd (a chain of 3), 8 loosen up and 16 give one key per bucket.
const KEYS = ['cat', 'dog', 'ant', 'fox', 'bee', 'owl', 'cow', 'pig'];
const MAX_BUCKETS = 16;

function loadFactor(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  let size; // number of buckets
  let used; // how many of KEYS are in the table

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal">${w.goal}</p>
      <div class="widget-actions">
        <button type="button" class="demo-button" data-act="add">${w.add}</button>
        <button type="button" class="demo-button" data-act="grow">${w.grow}</button>
        <button type="button" class="demo-button" data-act="reset">${w.reset}</button>
      </div>
    </div>
    <p class="load-factor-formula"></p>
    <div class="load-factor-buckets" role="group" aria-label="${w.buckets}"></div>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const formula = root.querySelector('.load-factor-formula');
  const view = root.querySelector('.load-factor-buckets');
  const message = root.querySelector('.widget-message');
  const addButton = root.querySelector('[data-act="add"]');
  const growButton = root.querySelector('[data-act="grow"]');

  const bucketOf = (key, m = size) => simpleHash(key, m).index;
  const chains = (m = size) => {
    const table = Array.from({ length: m }, () => []);
    for (const key of KEYS.slice(0, used)) table[bucketOf(key, m)].push(key);
    return table;
  };
  const longest = (m = size) => Math.max(...chains(m).map((chain) => chain.length));
  const ratio = () => (used / size).toFixed(2);

  // `marks` maps a key to 'is-hit' (just added) or 'is-moved' (changed bucket in a resize).
  const draw = (marks = {}) => {
    formula.innerHTML = `${w.load} = ${used} ÷ ${size} = <strong class="${used / size > 0.75 ? 'is-high' : ''}">${ratio()}</strong>`;
    view.innerHTML = chains()
      .map(
        (chain, i) => `<div class="load-factor-bucket"><span class="load-factor-index">${i}</span>${chain.map((key) => `<span class="load-factor-key ${marks[key] ?? ''}">${escapeHtml(key)}</span>`).join('')}</div>`,
      )
      .join('');
    addButton.disabled = used === KEYS.length;
    growButton.disabled = size === MAX_BUCKETS;
    if (!reduceMotion()) {
      const changed = [...view.querySelectorAll('.is-hit, .is-moved')];
      if (changed.length) animate(changed, { scale: [0.7, 1], opacity: [0, 1] }, SPRING);
    }
  };

  const reset = () => {
    size = 4;
    used = 3;
    message.textContent = w.start;
    draw();
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-act]');
    if (!button || button.disabled) return;
    const act = button.dataset.act;
    if (act === 'reset') return reset();
    if (act === 'add') {
      const key = KEYS[used];
      used += 1;
      const b = bucketOf(key);
      const text = w.added(key, b, chains()[b].length) + (used / size > 0.75 && size < MAX_BUCKETS ? w.over : '');
      message.textContent = used === KEYS.length ? `${text} ${w.allIn}` : text;
      draw({ [key]: 'is-hit' });
    }
    if (act === 'grow') {
      const before = longest();
      const old = size;
      size *= 2;
      const moved = KEYS.slice(0, used).filter((key) => bucketOf(key, old) !== bucketOf(key));
      const text = w.grown(size, used, moved.length, before, longest());
      message.textContent = size === MAX_BUCKETS && longest() === 1 ? `${text} ${w.maxed}` : text;
      draw(Object.fromEntries(moved.map((key) => [key, 'is-moved'])));
    }
    // A button that just disabled itself would drop keyboard focus; pass it on.
    if (button.disabled) (act === 'add' ? growButton : root.querySelector('[data-act="reset"]')).focus();
  });

  reset();
}

export default { 'load-factor': loadFactor };
