import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

const play = (el, keyframes, options = SPRING) => !reduceMotion() && el && animate(el, keyframes, options);

/* ---------- Window stretch: a window that grows and shrinks ---------- */

// The one idea: in a grow-and-shrink window each value enters once and leaves
// at most once, so both edges together make at most 2n moves. That is why a
// loop inside a loop is still O(n).

const WORDS = {
  en: {
    goal: 'Find the longest stretch with no repeated letter. You drive both edges of the window.',
    grow: 'Take next letter',
    shrink: 'Drop left letter',
    reset: 'Reset',
    row: 'Letters. The window is the coloured stretch.',
    entered: 'Entered on the right',
    left: 'Left on the left',
    of: (a, n) => `${a} of ${n}`,
    start: 'The window is empty. Take the first letter.',
    grew: (letter, text, len) => `"${letter}" entered. The window "${text}" has no repeats: length ${len}.`,
    clash: (letter, text) => `"${letter}" entered, and now the window "${text}" holds two of them. Drop letters from the left until one "${letter}" is gone.`,
    stillClash: (dropped, letter, text) => `Dropped "${dropped}". There are still two "${letter}" in "${text}". Drop again.`,
    fixed: (dropped, text) => `Dropped "${dropped}". "${text}" is clean again. The left edge did not go back to the start: it only ever moves right.`,
    blockedGrow: (letter) => `Not yet: there are still two "${letter}" inside. Shrink from the left first.`,
    blockedShrink: 'The window has no repeats, so there is no reason to shrink it. Take the next letter.',
    done: (n, left, best, text) => `Done. ${n} letters entered and ${left} left: ${n + left} edge moves for ${n} letters, never more than 2 × ${n}. Longest clean stretch: "${text}", ${best} letters.`,
  },
  bn: {
    goal: 'কোনো অক্ষর দুবার নেই, এমন সবচেয়ে লম্বা অংশটা খোঁজো। উইন্ডোর দুই মাথাই তুমি চালাবে।',
    grow: 'পরের অক্ষর নাও',
    shrink: 'বামের অক্ষর বাদ দাও',
    reset: 'আবার শুরু',
    row: 'অক্ষরগুলো। রঙিন অংশটাই উইন্ডো।',
    entered: 'ডান দিক দিয়ে ঢুকেছে',
    left: 'বাম দিক দিয়ে বেরিয়েছে',
    of: (a, n) => `${n}টির মধ্যে ${a}টি`,
    start: 'উইন্ডো এখন খালি। প্রথম অক্ষরটা নাও।',
    grew: (letter, text, len) => `"${letter}" ঢুকল। "${text}" উইন্ডোতে কোনো অক্ষর দুবার নেই: দৈর্ঘ্য ${len}।`,
    clash: (letter, text) => `"${letter}" ঢুকল, আর এখন "${text}" উইন্ডোতে "${letter}" আছে দুটি। একটা "${letter}" না বেরোনো পর্যন্ত বাম দিক থেকে অক্ষর বাদ দাও।`,
    stillClash: (dropped, letter, text) => `"${dropped}" বাদ গেল। "${text}"-এ এখনো দুটি "${letter}"। আবার বাদ দাও।`,
    fixed: (dropped, text) => `"${dropped}" বাদ গেল। "${text}" আবার ঠিক আছে। খেয়াল করো, বাম মাথা শুরুতে ফিরে যায়নি: সে শুধু ডানেই সরে।`,
    blockedGrow: (letter) => `এখনই নয়: ভেতরে এখনো দুটি "${letter}"। আগে বাম দিক থেকে ছোট করো।`,
    blockedShrink: 'উইন্ডোতে কোনো অক্ষর দুবার নেই, তাই ছোট করার কারণ নেই। পরের অক্ষরটা নাও।',
    done: (n, left, best, text) => `শেষ। ${n}টি অক্ষর ঢুকেছে আর ${left}টি বেরিয়েছে: ${n}টি অক্ষরের জন্য দুই মাথা মিলে সরেছে ${n + left} বার, যা কখনো 2 × ${n}-এর বেশি হয় না। সবচেয়ে লম্বা ঠিকঠাক অংশ: "${text}", ${best}টি অক্ষর।`,
  },
};

function windowStretch(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  const letters = [...'abcbdeab'];
  const n = letters.length;
  let start = 0; // first index inside the window
  let end = 0; // one past the last index inside the window
  let best = { start: 0, len: 0 };

  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <div class="array-row window-stretch-row" role="img" aria-label="${w.row}">
      ${letters.map((letter, i) => `<div class="array-cell"><span class="array-value">${escapeHtml(letter)}</span><span class="array-index">${i}</span></div>`).join('')}
    </div>
    <div class="widget-actions">
      <button type="button" class="demo-button" data-act="shrink">← ${w.shrink}</button>
      <button type="button" class="demo-button is-primary" data-act="grow">${w.grow} →</button>
      <button type="button" class="demo-button" data-act="reset">${w.reset}</button>
    </div>
    <dl class="window-stretch-meters">
      ${['entered', 'left'].map((key) => `<div class="window-stretch-meter" data-meter="${key}"><dt>${w[key]}</dt><dd><span class="window-stretch-track"><span class="window-stretch-fill"></span></span><span class="window-stretch-count"></span></dd></div>`).join('')}
    </dl>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const cells = [...root.querySelectorAll('.array-cell')];
  const message = root.querySelector('.widget-message');
  const text = () => letters.slice(start, end).join('');
  // The letter that appears twice in the window, if any (always the newest one).
  const clash = () => (end > start && letters.slice(start, end - 1).includes(letters[end - 1]) ? letters[end - 1] : null);

  const draw = (entered = -1) => {
    const twice = clash();
    cells.forEach((cell, i) => {
      const inside = i >= start && i < end;
      cell.className = `array-cell ${i < start ? 'is-out' : !inside ? '' : letters[i] === twice ? 'is-clash' : i === entered ? 'is-hit' : 'is-moved'}`;
    });
    for (const [key, count] of [['entered', end], ['left', start]]) {
      const meter = root.querySelector(`[data-meter="${key}"]`);
      meter.querySelector('.window-stretch-fill').style.width = `${(count / n) * 100}%`;
      meter.querySelector('.window-stretch-count').textContent = w.of(count, n);
    }
  };

  const nudge = (act) => play(root.querySelector(`[data-act="${act}"]`), { x: [0, -5, 5, 0] }, { duration: 0.25 });

  const actions = {
    grow() {
      const twice = clash();
      if (twice) {
        message.textContent = w.blockedGrow(twice);
        return nudge('grow');
      }
      if (end === n) return;
      end += 1;
      const letter = letters[end - 1];
      if (clash()) message.textContent = w.clash(letter, text());
      else {
        if (end - start > best.len) best = { start, len: end - start };
        message.textContent = w.grew(letter, text(), end - start);
      }
      draw(end - 1);
      play(cells[end - 1], { scale: [1.15, 1] });
      finish();
    },
    shrink() {
      const twice = clash();
      if (!twice) {
        message.textContent = w.blockedShrink;
        return nudge('shrink');
      }
      const dropped = letters[start];
      start += 1;
      message.textContent = clash() ? w.stillClash(dropped, twice, text()) : w.fixed(dropped, text());
      draw();
      finish();
    },
    reset() {
      start = 0;
      end = 0;
      best = { start: 0, len: 0 };
      message.textContent = w.start;
      draw();
    },
  };

  // Every letter is in and the window is valid: add up what both edges did.
  const finish = () => {
    if (end === n && !clash()) message.textContent = w.done(n, start, best.len, letters.slice(best.start, best.start + best.len).join(''));
  };

  root.addEventListener('click', (event) => actions[event.target.closest('[data-act]')?.dataset.act]?.());
  actions.reset();
}

export default { 'window-stretch': windowStretch };
