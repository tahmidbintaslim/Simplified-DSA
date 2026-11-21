import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

// The one idea: inserting takes two pointer changes, and their ORDER matters.
// Point the new node at the rest of the list first; cut the old link first and
// the rest of the list is lost, because nothing remembers where it is.

const WORDS = {
  en: {
    goal: 'Put <strong>5</strong> between 7 and 3. Two pointers have to change. You choose which line runs first.',
    reset: 'Reset',
    lines: 'The two lines of code',
    fromHead: 'Walk from head',
    waiting: 'New node, not in the list yet',
    lost: 'Lost: nothing points here',
    loop: (v) => `back to ${v}, forever`,
    start: 'Run one line, look at the picture, then run the other.',
    hookFirst: '5 now points at 3. Nothing is lost: the list is still 7 → 3 → 9, and 5 is holding on to the rest of it. Now run the other line.',
    hookThenCut: 'Done: 7 → 5 → 3 → 9. Two pointers changed and no value moved. This order is safe because 5 grabbed the rest of the list before 7 let go of it.',
    cutFirst: '7 now points at 5, but that was the only pointer to 3. Nothing remembers where 3 and 9 are, so they are lost. Run the other line and see what it does now.',
    cutThenHook: '7.next is already 5, so this line made 5 point at itself. A walk from head now goes round and round, and 3 and 9 are gone for good. Reset and try the other order.',
  },
  bn: {
    goal: '7 আর 3-এর মাঝখানে <strong>5</strong> বসাও। দুটি পয়েন্টার বদলাতে হবে। কোন লাইনটা আগে চলবে, তুমিই ঠিক করো।',
    reset: 'আবার শুরু',
    lines: 'কোডের দুটি লাইন',
    fromHead: 'head থেকে হাঁটলে',
    waiting: 'নতুন নোড, এখনো লিস্টে ঢোকেনি',
    lost: 'হারিয়ে গেছে: কেউ এদের দিকে দেখাচ্ছে না',
    loop: (v) => `আবার ${v}, অনন্তকাল`,
    start: 'একটা লাইন চালাও, ছবিটা দেখো, তারপর অন্যটা চালাও।',
    hookFirst: '5 এখন 3-এর দিকে দেখাচ্ছে। কিছুই হারায়নি: লিস্ট এখনো 7 → 3 → 9, আর বাকি অংশটা 5 ধরে রেখেছে। এবার অন্য লাইনটা চালাও।',
    hookThenCut: 'হয়ে গেছে: 7 → 5 → 3 → 9। দুটি পয়েন্টার বদলেছে, কোনো মান সরেনি। এই ক্রম নিরাপদ, কারণ 7 হাত ছাড়ার আগেই 5 বাকি লিস্টটা ধরে ফেলেছিল।',
    cutFirst: '7 এখন 5-এর দিকে দেখাচ্ছে, কিন্তু 3-এর দিকে ওটাই ছিল একমাত্র পয়েন্টার। 3 আর 9 কোথায় আছে কেউ আর জানে না, তাই ওরা হারিয়ে গেছে। এবার অন্য লাইনটা চালিয়ে দেখো কী হয়।',
    cutThenHook: '7.next আগেই 5 হয়ে গেছে, তাই এই লাইনে 5 নিজের দিকেই দেখাতে শুরু করল। head থেকে হাঁটলে এখন শুধু ঘুরতেই থাকবে, আর 3 ও 9 চিরতরে হারিয়ে গেল। আবার শুরু করে উল্টো ক্রমে চেষ্টা করো।',
  },
};

function pointerOrder(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  let next; // value → the value its node points at (null = end of list)
  let ran; // the lines run so far, in order: 'hook' and/or 'cut'

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal">${w.goal}</p>
      <div class="widget-actions"><button type="button" class="demo-button" data-act="reset">${w.reset}</button></div>
    </div>
    <div class="widget-actions pointer-order-lines" role="group" aria-label="${w.lines}">
      <button type="button" class="demo-button" data-line="hook"><code>new.next = seven.next</code></button>
      <button type="button" class="demo-button" data-line="cut"><code>seven.next = new</code></button>
    </div>
    <div class="pointer-order-stage"></div>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const stage = root.querySelector('.pointer-order-stage');
  const message = root.querySelector('.widget-message');

  // Follow next pointers from `start`; stop at null or the first repeat (a loop).
  const walk = (start) => {
    const seen = [];
    let at = start;
    while (at !== null && !seen.includes(at)) {
      seen.push(at);
      at = next[at];
    }
    return { seen, loopTo: at };
  };

  const chain = ({ seen, loopTo }, tone, label = '') =>
    `${label}${seen.map((v) => `<span class="pointer-order-node ${v === 5 ? 'is-new' : tone}">${escapeHtml(String(v))}</span>`).join('<span class="pointer-order-arrow" aria-hidden="true">→</span>')}<span class="pointer-order-arrow" aria-hidden="true">→</span><span class="pointer-order-end">${loopTo === null ? 'null' : `↻ ${w.loop(loopTo)}`}</span>`;

  const draw = () => {
    const main = walk(7);
    const reached = new Set(main.seen);
    const rows = [`<div class="pointer-order-row"><p>${w.fromHead}</p><div class="pointer-order-chain">${chain(main, '', '<span class="pointer-order-head">head</span><span class="pointer-order-arrow" aria-hidden="true">→</span>')}</div></div>`];
    if (!reached.has(5)) {
      const waiting = walk(5);
      waiting.seen.forEach((v) => reached.add(v));
      rows.push(`<div class="pointer-order-row"><p>${w.waiting}</p><div class="pointer-order-chain">${chain(waiting, '')}</div></div>`);
    }
    if (!reached.has(3)) rows.push(`<div class="pointer-order-row is-lost"><p>${w.lost}</p><div class="pointer-order-chain">${chain(walk(3), 'is-lost')}</div></div>`);
    stage.innerHTML = rows.join('');
    root.querySelectorAll('[data-line]').forEach((b) => (b.disabled = ran.includes(b.dataset.line)));
    if (!reduceMotion()) animate([...stage.querySelectorAll('.pointer-order-node, .pointer-order-end')], { opacity: [0.3, 1], y: [5, 0] }, SPRING);
  };

  const reset = () => {
    next = { 7: 3, 3: 9, 9: null, 5: null };
    ran = [];
    message.textContent = w.start;
    draw();
  };

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-act="reset"]')) return reset();
    const line = event.target.closest('[data-line]')?.dataset.line;
    if (!line || ran.includes(line)) return;
    // Exactly what the code says: the right-hand side is read at the moment the line runs.
    if (line === 'hook') next[5] = next[7];
    else next[7] = 5;
    ran.push(line);
    message.textContent = ran.length === 1 ? (line === 'hook' ? w.hookFirst : w.cutFirst) : line === 'cut' ? w.hookThenCut : w.cutThenHook;
    draw();
    // Both lines are now disabled, so hand keyboard focus to Reset.
    if (ran.length === 2) root.querySelector('[data-act="reset"]').focus();
  });

  reset();
}

export default { 'pointer-order': pointerOrder };
