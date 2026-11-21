import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';

/**
 * Constant race. The one idea: a constant factor only decides WHERE a slower
 * growth shape overtakes a faster one, never WHETHER it does. That is why
 * Big O throws constants away and keeps the shape.
 */

const WORDS = {
  en: {
    goal: 'Two programs do the same job. <strong>A</strong> is clumsy but linear: it spends a fixed number of steps on each item. <strong>B</strong> is quick per step but quadratic: it pairs every item with every item. Drag <code>n</code> and see who does less work.',
    perItem: "A's steps per item",
    items: 'Items (n):',
    itemsText: (n) => `${n} items`,
    a: (c) => `A: ${c} × n`,
    b: 'B: n × n',
    steps: (s) => `${s} steps`,
    less: 'less work',
    before: (n, ratio, c) => `At n = ${n}, B does ${ratio}× less work than A. On small inputs the "worse" Big O can win. Keep dragging: the crossover is at n = ${c}.`,
    tie: (n, s) => `n = ${n}: a tie, ${s} steps each. This is the crossover. From here on, B only falls further behind.`,
    after: (n, ratio, c) => `At n = ${n}, A does ${ratio}× less work than B, and the gap keeps widening: double n and A's work doubles, but B's quadruples. The ${c} only decided where the two crossed, not who wins.`,
  },
  bn: {
    goal: 'দুটি প্রোগ্রাম একই কাজ করে। <strong>A</strong> একটু ঢিলে, কিন্তু linear: প্রতিটি মানের পেছনে সে নির্দিষ্ট কয়েকটা ধাপ খরচ করে। <strong>B</strong>-এর প্রতিটি ধাপ চটপটে, কিন্তু সে quadratic: প্রতিটি মানকে বাকি প্রতিটির সাথে জোড়া বাঁধে। <code>n</code> টেনে দেখো কার কাজ কম।',
    perItem: 'প্রতি মানে A-র ধাপ',
    items: 'মানের সংখ্যা (n):',
    itemsText: (n) => `${n}টি মান`,
    a: (c) => `A: ${c} × n`,
    b: 'B: n × n',
    steps: (s) => `${s} ধাপ`,
    less: 'কম কাজ',
    before: (n, ratio, c) => `n = ${n} হলে B-র কাজ A-র চেয়ে ${ratio} গুণ কম। ছোট ইনপুটে "খারাপ" Big O-ও জিততে পারে। টানতে থাকো: দুজনের দেখা হবে n = ${c}-এ।`,
    tie: (n, s) => `n = ${n}: সমান সমান, দুজনেরই ${s} ধাপ। এখানেই একজন আরেকজনকে পেরিয়ে যায়। এরপর থেকে B শুধু পিছিয়েই পড়বে।`,
    after: (n, ratio, c) => `n = ${n} হলে A-র কাজ B-র চেয়ে ${ratio} গুণ কম, আর ফারাকটা বাড়তেই থাকে: n দ্বিগুণ করলে A-র কাজ দ্বিগুণ হয়, কিন্তু B-র হয় চার গুণ। ${c} শুধু ঠিক করেছে দুজনের দেখা কোথায় হবে, কে জিতবে তা নয়।`,
  },
};

const SIZES = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 100000];
const CONSTANTS = [10, 100, 1000];
const fmt = (value) => value.toLocaleString('en-US', { maximumFractionDigits: 1 });

function constantRace(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  let c = 100;

  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <div class="widget-actions constant-race-pick" role="group" aria-label="${w.perItem}">
      <span class="constant-race-label">${w.perItem}</span>
      ${CONSTANTS.map((k) => `<button type="button" class="demo-button" data-constant="${k}" aria-pressed="${k === c}">${fmt(k)}</button>`).join('')}
    </div>
    <label class="widget-slider">${w.items} <output></output>
      <input type="range" min="0" max="${SIZES.length - 1}" value="${SIZES.indexOf(10)}" step="1" />
    </label>
    <div class="constant-race-rows">
      ${['a', 'b']
        .map(
          (id) => `<div class="constant-race-row" data-row="${id}">
            <span class="constant-race-name"></span>
            <span class="constant-race-track"><span class="constant-race-bar"></span></span>
            <span class="constant-race-count"></span>
            <span class="constant-race-badge">${w.less}</span>
          </div>`,
        )
        .join('')}
    </div>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const input = root.querySelector('input');
  const output = root.querySelector('output');
  const message = root.querySelector('.widget-message');
  const row = (id) => root.querySelector(`[data-row="${id}"]`);

  const draw = () => {
    const n = SIZES[Number(input.value)];
    const work = { a: c * n, b: n * n };
    const max = Math.max(work.a, work.b);
    output.textContent = fmt(n);
    input.setAttribute('aria-valuetext', w.itemsText(fmt(n)));
    for (const id of ['a', 'b']) {
      const el = row(id);
      const width = `${Math.max(1, (work[id] / max) * 100)}%`;
      const bar = el.querySelector('.constant-race-bar');
      el.querySelector('.constant-race-name').textContent = id === 'a' ? w.a(fmt(c)) : w.b;
      el.querySelector('.constant-race-count').textContent = w.steps(fmt(work[id]));
      el.classList.toggle('is-winner', work[id] < work[id === 'a' ? 'b' : 'a']);
      if (reduceMotion()) bar.style.width = width;
      else animate(bar, { width }, SPRING);
    }
    message.textContent = n < c ? w.before(fmt(n), fmt(c / n), fmt(c)) : n === c ? w.tie(fmt(n), fmt(work.a)) : w.after(fmt(n), fmt(n / c), fmt(c));
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-constant]');
    if (!button) return;
    c = Number(button.dataset.constant);
    root.querySelectorAll('[data-constant]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    draw();
  });
  input.addEventListener('input', draw);
  draw();
}

export default { 'constant-race': constantRace };
