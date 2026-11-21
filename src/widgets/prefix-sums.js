import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';

const play = (el, keyframes, options = SPRING) => !reduceMotion() && el && animate(el, keyframes, options);

/* ---------- Range subtract: which two running totals, and why r + 1 ---------- */

// The one idea: a range sum is "everything up to the right wall" minus
// "everything before the left wall", and the right wall of a[r] is
// prefix[r + 1], not prefix[r].

const WORDS = {
  en: {
    goal: 'Click two values to choose a range. Each running total sits on the wall just before its value: it is the sum of everything to its left.',
    list: 'The list a',
    totals: 'Running totals, prefix',
    pick: (i, v) => `a[${i}] = ${v}`,
    bug: 'Break it: use prefix[r] instead of prefix[r + 1]',
    pickEnd: (l) => `The range starts at a[${l}]. Now click where it ends.`,
    ok: (l, r, sum) => `Everything up to a[${r}] is prefix[${r + 1}]. Everything before a[${l}] is prefix[${l}]. Take one from the other and only a[${l}..${r}] is left: ${sum}.`,
    fromStart: (r, sum) => `This range starts at the very beginning, so there is nothing to take away: prefix[0] is 0. That is the job of the extra 0 at the front. Sum of a[0..${r}]: ${sum}.`,
    wrong: (r, v) => `Off by one. prefix[${r}] stops at the wall before a[${r}], so a[${r}] = ${v} is missing from the answer. The wall after a[${r}] is prefix[${r + 1}].`,
  },
  bn: {
    goal: 'দুটি মানে ক্লিক করে একটা রেঞ্জ বেছে নাও। প্রতিটি চলতি যোগফল বসে আছে তার মানের ঠিক আগের দেয়ালে: সেটা তার বামের সবকিছুর যোগফল।',
    list: 'লিস্ট a',
    totals: 'চলতি যোগফল, prefix',
    pick: (i, v) => `a[${i}] = ${v}`,
    bug: 'ভেঙে দেখো: prefix[r + 1]-এর বদলে prefix[r] নাও',
    pickEnd: (l) => `রেঞ্জ শুরু a[${l}] থেকে। এবার ক্লিক করো কোথায় শেষ হবে।`,
    ok: (l, r, sum) => `a[${r}] পর্যন্ত সবকিছু হলো prefix[${r + 1}]। a[${l}]-এর আগের সবকিছু হলো prefix[${l}]। একটা থেকে আরেকটা বাদ দিলে থাকে শুধু a[${l}..${r}]: ${sum}।`,
    fromStart: (r, sum) => `এই রেঞ্জ একদম শুরু থেকে, তাই বাদ দেওয়ার কিছু নেই: prefix[0] হলো 0। সামনের বাড়তি 0-টার কাজ এটাই। a[0..${r}]-এর যোগফল: ${sum}।`,
    wrong: (r, v) => `এক ঘরের ভুল (off-by-one)। prefix[${r}] থামে a[${r}]-এর আগের দেয়ালে, তাই উত্তরে a[${r}] = ${v} বাদ পড়ে গেছে। a[${r}]-এর পরের দেয়াল হলো prefix[${r + 1}]।`,
  },
};

function rangeSubtract(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  const a = [3, -1, 4, 1, 5, 9];
  const prefix = [0];
  for (const value of a) prefix.push(prefix.at(-1) + value);
  let l = 2;
  let r = 4;
  let anchor = null; // the first click of a new range, waiting for the second

  // 14 columns: a[i] covers columns 2i+2..2i+3 and prefix[i] covers 2i+1..2i+2,
  // so every running total is centred on the wall before its value.
  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <p class="range-subtract-label">${w.list}</p>
    <div class="range-subtract-grid" role="group" aria-label="${w.list}">
      ${a.map((value, i) => `<button type="button" class="range-subtract-cell" data-index="${i}" style="grid-column:${2 * i + 2} / span 2" aria-label="${w.pick(i, value)}"><span>${value}</span><small>${i}</small></button>`).join('')}
    </div>
    <div class="range-subtract-grid range-subtract-bars" aria-hidden="true">
      <span class="range-subtract-bar is-keep"></span>
      <span class="range-subtract-bar is-take"></span>
    </div>
    <div class="range-subtract-grid" role="img" aria-label="${w.totals}: ${prefix.join(', ')}">
      ${prefix.map((value, i) => `<span class="range-subtract-total" data-total="${i}" style="grid-column:${2 * i + 1} / span 2"><span>${value}</span><small>${i}</small></span>`).join('')}
    </div>
    <p class="range-subtract-label">${w.totals}</p>
    <p class="range-subtract-formula"></p>
    <label class="range-subtract-switch"><input type="checkbox" /> ${w.bug}</label>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const cells = [...root.querySelectorAll('[data-index]')];
  const totals = [...root.querySelectorAll('[data-total]')];
  const keep = root.querySelector('.is-keep');
  const take = root.querySelector('.is-take');
  const formula = root.querySelector('.range-subtract-formula');
  const bug = root.querySelector('input');
  const message = root.querySelector('.widget-message');

  const draw = () => {
    const right = bug.checked ? r : r + 1; // the prefix entry used as the right wall
    const answer = prefix[right] - prefix[l];
    const missed = bug.checked && anchor === null;
    cells.forEach((cell, i) => {
      cell.className = `range-subtract-cell ${missed && i === r ? 'is-missed' : i >= l && i <= r ? 'is-in' : ''}`;
      cell.setAttribute('aria-pressed', String(i >= l && i <= r));
    });
    totals.forEach((total, i) => {
      total.className = `range-subtract-total ${anchor !== null ? '' : i === right && i === l ? 'is-keep is-take' : i === right ? 'is-keep' : i === l ? 'is-take' : ''}`;
    });
    // The bars cover a[0..right-1] and a[0..l-1]: what is kept, and what is taken away.
    keep.style.gridColumn = `2 / span ${2 * right}`;
    take.style.gridColumn = `2 / span ${2 * l}`;
    keep.hidden = anchor !== null || right === 0;
    take.hidden = anchor !== null || l === 0;
    formula.hidden = anchor !== null;
    formula.className = `range-subtract-formula ${missed ? 'is-bad' : ''}`;
    formula.innerHTML = `<span class="f-keep">prefix[${right}]</span> − <span class="f-take">prefix[${l}]</span> = <span class="f-keep">${prefix[right]}</span> − <span class="f-take">${prefix[l]}</span> = <strong>${answer}</strong>`;
    message.textContent = anchor !== null ? w.pickEnd(l) : missed ? w.wrong(r, a[r]) : l === 0 ? w.fromStart(r, answer) : w.ok(l, r, answer);
  };

  root.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-index]');
    if (!cell) return;
    const i = Number(cell.dataset.index);
    if (anchor === null) {
      anchor = i;
      l = i;
      r = i;
    } else {
      l = Math.min(anchor, i);
      r = Math.max(anchor, i);
      anchor = null;
    }
    draw();
    if (anchor === null) play(formula.querySelector('strong'), { scale: [1.3, 1] });
  });
  bug.addEventListener('change', draw);
  draw();
}

export default { 'range-subtract': rangeSubtract };
