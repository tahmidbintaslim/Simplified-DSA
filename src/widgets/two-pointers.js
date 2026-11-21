import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

// The one idea: on a sorted list, one sum rules out a whole row or column of
// pairs at once, which is why n - 1 looks cover all n(n-1)/2 pairs.

const WORDS = {
  en: {
    goal: (t) => `Every pair of the sorted list is one square: its row is the L value, its column the R value. Find the pair that adds up to ${t}.`,
    target: 'Target',
    moveL: 'Move L right',
    moveR: 'Move R left',
    reset: 'Reset',
    grid: 'All pairs of the list, with their sums',
    count: (looks, out, all) => `Sums looked at: ${looks}. Pairs ruled out: ${out} of ${all}.`,
    start: (x, y, s, t) => `Start in the corner: ${x} + ${y} = ${s}. Is that too big or too small for ${t}? Choose the pointer to move.`,
    small: (x, y, s, n) => `${x} + ${y} = ${s} was too small, and ${y} is the biggest partner ${x} had left. So all ${n} pair${n === 1 ? '' : 's'} left in ${x}'s row ${n === 1 ? 'is' : 'are'} too small: crossed out with one look.`,
    big: (x, y, s, n) => `${x} + ${y} = ${s} was too big, and ${x} is the smallest partner ${y} had left. So all ${n} pair${n === 1 ? '' : 's'} left in ${y}'s column ${n === 1 ? 'is' : 'are'} too big: crossed out with one look.`,
    unsafeR: (x, y, s, t, risk) => `Not safe. ${x} + ${y} = ${s} is too small, but moving R would throw away ${y}'s column${risk ? `, and ${risk} there ${risk.includes(',') ? 'are' : 'is'} bigger than ${s}: one could be ${t}` : ''}. A too-small sum only rules out the row.`,
    unsafeL: (x, y, s, t, risk) => `Not safe. ${x} + ${y} = ${s} is too big, but moving L would throw away ${x}'s row${risk ? `, and ${risk} there ${risk.includes(',') ? 'are' : 'is'} smaller than ${s}: one could be ${t}` : ''}. A too-big sum only rules out the column.`,
    found: (x, y, t, looks, all) => `${x} + ${y} = ${t}. Found after looking at ${looks} sums. Brute force could have needed all ${all}.`,
    none: (t, looks, all) => `The pointers met: no pair adds up to ${t}. All ${all} pairs were ruled out by looking at only ${looks} sums.`,
  },
  bn: {
    goal: (t) => `সাজানো লিস্টের প্রতিটি জোড়া একটা করে ঘর: সারি হলো L-এর মান, কলাম হলো R-এর মান। এমন জোড়া খোঁজো যার যোগফল ${t}।`,
    target: 'লক্ষ্য',
    moveL: 'L-কে ডানে সরাও',
    moveR: 'R-কে বামে সরাও',
    reset: 'আবার শুরু',
    grid: 'লিস্টের সব জোড়া আর তাদের যোগফল',
    count: (looks, out, all) => `যোগফল দেখা হয়েছে: ${looks}টি। বাদ পড়েছে: ${all}টির মধ্যে ${out}টি জোড়া।`,
    start: (x, y, s, t) => `কোনা থেকে শুরু: ${x} + ${y} = ${s}। ${t}-এর তুলনায় এটা বেশি বড়, না বেশি ছোট? কোন পয়েন্টার সরাবে বেছে নাও।`,
    small: (x, y, s, n) => `${x} + ${y} = ${s} ছিল বেশি ছোট, আর ${x}-এর বাকি সঙ্গীদের মধ্যে ${y}-ই সবচেয়ে বড়। তাই ${x}-এর সারির বাকি ${n}টি জোড়াই বেশি ছোট: এক দেখাতেই সব বাদ।`,
    big: (x, y, s, n) => `${x} + ${y} = ${s} ছিল বেশি বড়, আর ${y}-এর বাকি সঙ্গীদের মধ্যে ${x}-ই সবচেয়ে ছোট। তাই ${y}-এর কলামের বাকি ${n}টি জোড়াই বেশি বড়: এক দেখাতেই সব বাদ।`,
    unsafeR: (x, y, s, t, risk) => `নিরাপদ নয়। ${x} + ${y} = ${s} বেশি ছোট, কিন্তু R সরালে ${y}-এর পুরো কলাম ফেলে দেওয়া হয়${risk ? `, অথচ সেখানে ${risk} আছে, যা ${s}-এর চেয়ে বড়: এর কোনোটা ${t} হতেই পারে` : ''}। যোগফল ছোট হলে শুধু সারিটাই বাদ দেওয়া যায়।`,
    unsafeL: (x, y, s, t, risk) => `নিরাপদ নয়। ${x} + ${y} = ${s} বেশি বড়, কিন্তু L সরালে ${x}-এর পুরো সারি ফেলে দেওয়া হয়${risk ? `, অথচ সেখানে ${risk} আছে, যা ${s}-এর চেয়ে ছোট: এর কোনোটা ${t} হতেই পারে` : ''}। যোগফল বড় হলে শুধু কলামটাই বাদ দেওয়া যায়।`,
    found: (x, y, t, looks, all) => `${x} + ${y} = ${t}। ${looks}টি যোগফল দেখেই পাওয়া গেল। ব্রুট ফোর্সে ${all}টিই লাগতে পারত।`,
    none: (t, looks, all) => `পয়েন্টার দুটি মিলে গেল: কোনো জোড়ার যোগফল ${t} নয়। মাত্র ${looks}টি যোগফল দেখেই ${all}টি জোড়ার সবগুলো বাদ পড়ল।`,
  },
};

const VALUES = [1, 3, 4, 6, 8, 11];
const TARGETS = [10, 13];
const N = VALUES.length;
const ALL = (N * (N - 1)) / 2;

function pairGrid(root, { lang = 'en' }) {
  const w = WORDS[lang] ?? WORDS.en;
  let target = TARGETS[0];
  let L;
  let R;
  let out; // "i,j" keys of pairs ruled out
  let looks;

  root.innerHTML = `
    <p class="widget-goal"></p>
    <div class="widget-actions">
      <span class="pair-grid-label">${w.target}</span>
      ${TARGETS.map((t) => `<button type="button" class="demo-button" data-target="${t}" aria-pressed="${t === target}">${t}</button>`).join('')}
    </div>
    <div class="pair-grid-board" role="img" aria-label="${escapeHtml(w.grid)}"></div>
    <div class="widget-actions">
      <button type="button" class="demo-button" data-move="L">${w.moveL} →</button>
      <button type="button" class="demo-button" data-move="R">← ${w.moveR}</button>
      <button type="button" class="demo-button" data-move="reset">${w.reset}</button>
    </div>
    <p class="pair-grid-count"></p>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const goal = root.querySelector('.widget-goal');
  const board = root.querySelector('.pair-grid-board');
  const count = root.querySelector('.pair-grid-count');
  const message = root.querySelector('.widget-message');
  const moves = root.querySelectorAll('[data-move="L"], [data-move="R"]');

  const sum = (i, j) => VALUES[i] + VALUES[j];
  const over = () => L >= R || sum(L, R) === target;

  const draw = () => {
    const live = L < R;
    const head = (v, on, tag) => `<span class="pair-grid-head ${on ? 'is-on' : ''}">${on ? `<b>${tag}</b>` : ''}${v}</span>`;
    board.innerHTML =
      // The smallest value is never R and the biggest never L, so that column and row are left out.
      `<span class="pair-grid-corner">L \\ R</span>${VALUES.map((v, j) => (j ? head(v, live && j === R, 'R') : '')).join('')}` +
      VALUES.slice(0, -1).map(
        (v, i) =>
          head(v, live && i === L, 'L') +
          VALUES.map((_, j) => {
            if (!j) return '';
            if (j <= i) return '<span class="pair-grid-cell is-none"></span>';
            const here = live && i === L && j === R;
            const state = here ? (sum(i, j) === target ? 'is-found' : 'is-hit') : out.has(`${i},${j}`) ? 'is-out' : '';
            return `<span class="pair-grid-cell ${state}" data-cell="${i},${j}">${sum(i, j)}</span>`;
          }).join(''),
      ).join('');
    count.textContent = w.count(looks, out.size, ALL);
    moves.forEach((button) => (button.disabled = over()));
  };

  const reset = () => {
    L = 0;
    R = N - 1;
    out = new Set();
    looks = 1;
    goal.textContent = w.goal(target);
    message.textContent = w.start(VALUES[L], VALUES[R], sum(L, R), target);
    draw();
  };

  const flash = (cells) => {
    const els = cells.map(([i, j]) => board.querySelector(`[data-cell="${i},${j}"]`)).filter(Boolean);
    els.forEach((el) => el.classList.add('is-risk'));
    if (els.length && !reduceMotion()) animate(els, { scale: [1.18, 1] }, SPRING);
  };

  root.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-target]');
    if (pick) {
      target = Number(pick.dataset.target);
      root.querySelectorAll('[data-target]').forEach((b) => b.setAttribute('aria-pressed', String(b === pick)));
      return reset();
    }
    const move = event.target.closest('[data-move]')?.dataset.move;
    if (!move) return;
    if (move === 'reset') return reset();
    if (over()) return;
    const x = VALUES[L];
    const y = VALUES[R];
    const s = x + y;
    const safe = s < target ? 'L' : 'R';
    if (move !== safe) {
      // The pairs this move would throw away without proof.
      const risk = [];
      if (move === 'R') for (let i = L + 1; i < R; i++) risk.push([i, R]);
      else for (let j = L + 1; j < R; j++) risk.push([L, j]);
      draw();
      flash(risk);
      const names = risk.map(([i, j]) => `${VALUES[i]} + ${VALUES[j]} = ${sum(i, j)}`).join(', ');
      message.textContent = (move === 'R' ? w.unsafeR : w.unsafeL)(x, y, s, target, names);
      return;
    }
    const before = out.size;
    if (move === 'L') {
      for (let j = L + 1; j <= R; j++) out.add(`${L},${j}`);
      L++;
    } else {
      for (let i = L; i < R; i++) out.add(`${i},${R}`);
      R--;
    }
    const crossed = out.size - before;
    if (L < R) looks++;
    draw();
    if (L >= R) message.textContent = w.none(target, looks, ALL);
    else if (sum(L, R) === target) message.textContent = w.found(VALUES[L], VALUES[R], target, looks, ALL);
    else message.textContent = (move === 'L' ? w.small : w.big)(x, y, s, crossed);
    if (!reduceMotion()) {
      const now = board.querySelector('.is-hit, .is-found');
      if (now) animate(now, { scale: [1.2, 1] }, SPRING);
    }
    if (over()) root.querySelector('[data-move="reset"]').focus({ preventScroll: true });
  });

  reset();
}

export default { 'pair-grid': pairGrid };
