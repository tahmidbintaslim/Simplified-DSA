import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

const play = (el, keyframes, options = SPRING) => !reduceMotion() && el && animate(el, keyframes, options);

/* ---------- Gap closer: why fast always lands on slow ---------- */

// The one idea: inside a loop the gap from fast to slow shrinks by exactly one
// node per step, so it has to pass through zero. Fast cannot jump over slow.

const WORDS = {
  en: {
    goal: 'Eight nodes in a loop, walked clockwise. Slow moves 1 node per step, fast moves 2. Click any node to put fast there, then step.',
    step: 'Step',
    gap: 'gap',
    ring: 'A loop of eight nodes. Click a node to put fast on it.',
    put: (name) => `Put fast on node ${name}`,
    history: 'Gap after each step:',
    start: (gap) => `Fast is ${gap} node${gap === 1 ? '' : 's'} behind slow, going clockwise. Guess how many steps it needs to catch up, then press Step.`,
    moved: (prev, gap) => `Slow moved 1, fast moved 2, so fast gained exactly 1. Gap: ${prev} → ${gap}.`,
    met: (steps) => `Gap 1 → 0. Slow stepped 1 node away and fast jumped 2, so they landed on the same node. A gap of ${steps} took exactly ${steps} step${steps === 1 ? '' : 's'}: fast gains one node at a time, so it cannot jump over slow.`,
    together: 'They are on the same node. Click another node to put fast somewhere new.',
    same: 'Slow is already on that node. Pick a different one.',
  },
  bn: {
    goal: 'আটটি নোড একটা লুপে, ঘড়ির কাঁটার দিকে হাঁটা হয়। slow প্রতি ধাপে 1 নোড এগোয়, fast এগোয় 2। যেকোনো নোডে ক্লিক করে fast-কে সেখানে বসাও, তারপর ধাপ চালাও।',
    step: 'এক ধাপ',
    gap: 'ফাঁক',
    ring: 'আটটি নোডের একটা লুপ। কোনো নোডে ক্লিক করলে fast সেখানে বসবে।',
    put: (name) => `fast-কে ${name} নোডে বসাও`,
    history: 'প্রতি ধাপের পর ফাঁক:',
    start: (gap) => `ঘড়ির কাঁটার দিকে গুনলে fast আছে slow-এর ${gap} নোড পেছনে। ধরতে কয় ধাপ লাগবে আন্দাজ করো, তারপর "এক ধাপ" চাপো।`,
    moved: (prev, gap) => `slow সরল 1, fast সরল 2, তাই fast এগিয়ে এল ঠিক 1 নোড। ফাঁক: ${prev} → ${gap}।`,
    met: (steps) => `ফাঁক 1 → 0। slow 1 নোড সরে গেল আর fast লাফাল 2 নোড, তাই দুজন একই নোডে এসে পড়ল। ${steps} নোডের ফাঁক মিটতে লাগল ঠিক ${steps} ধাপ: fast একবারে মাত্র এক নোড করে কাছে আসে, তাই slow-কে টপকে যেতে পারে না।`,
    together: 'দুজন এখন একই নোডে। fast-কে নতুন জায়গায় বসাতে অন্য একটা নোডে ক্লিক করো।',
    same: 'slow আগে থেকেই ওই নোডে আছে। অন্য একটা বেছে নাও।',
  },
};

function gapCloser(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  const names = [...'ABCDEFGH'];
  const size = names.length;
  let slow = 0;
  let fast = 3;
  let gaps = []; // the gap at the start, then after every step

  // How many nodes fast has to gain: the walk from fast forward to slow.
  const gap = () => (slow - fast + size) % size;
  const spot = (i) => {
    const angle = (i / size) * 2 * Math.PI - Math.PI / 2;
    return `left:${(50 + 40 * Math.cos(angle)).toFixed(2)}%;top:${(50 + 40 * Math.sin(angle)).toFixed(2)}%`;
  };

  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <div class="gap-closer-ring" role="group" aria-label="${w.ring}">
      <div class="gap-closer-centre" aria-hidden="true"><span class="gap-closer-turn">↻</span><strong></strong><span>${w.gap}</span></div>
      ${names.map((name, i) => `<button type="button" class="gap-closer-node" data-node="${i}" style="${spot(i)}" aria-label="${w.put(name)}"><span>${escapeHtml(name)}</span><small></small></button>`).join('')}
    </div>
    <div class="widget-actions">
      <button type="button" class="demo-button is-primary" data-act="step">${w.step}</button>
      <span class="gap-closer-history"><span>${w.history}</span> <output></output></span>
    </div>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const nodes = [...root.querySelectorAll('.gap-closer-node')];
  const number = root.querySelector('.gap-closer-centre strong');
  const history = root.querySelector('.gap-closer-history output');
  const message = root.querySelector('.widget-message');

  // Nodes are built once and only relabelled, so keyboard focus stays put.
  const draw = () => {
    nodes.forEach((node, i) => {
      const tags = [i === slow && 'slow', i === fast && 'fast'].filter(Boolean);
      node.className = `gap-closer-node ${tags.length === 2 ? 'is-met' : tags[0] ? `is-${tags[0]}` : ''}`;
      node.querySelector('small').textContent = tags.join(' + ');
    });
    number.textContent = gap();
    history.textContent = gaps.join(' → ');
  };

  root.addEventListener('click', (event) => {
    const node = event.target.closest('[data-node]');
    if (node) {
      const i = Number(node.dataset.node);
      if (i === slow) message.textContent = w.same;
      else {
        fast = i;
        gaps = [gap()];
        message.textContent = w.start(gap());
      }
      draw();
      return;
    }
    if (!event.target.closest('[data-act="step"]')) return;
    const prev = gap();
    if (prev === 0) {
      message.textContent = w.together;
      return;
    }
    slow = (slow + 1) % size;
    fast = (fast + 2) % size;
    gaps.push(gap());
    message.textContent = gap() === 0 ? w.met(gaps.length - 1) : w.moved(prev, gap());
    draw();
    play([nodes[slow], nodes[fast]], { scale: [1.18, 1] });
    play(number, { scale: [1.3, 1] });
  });

  gaps = [gap()];
  message.textContent = w.start(gap());
  draw();
}

export default { 'gap-closer': gapCloser };
