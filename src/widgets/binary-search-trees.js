import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';

/**
 * Arrival order. The one idea: a plain binary search tree never chooses its
 * own shape. The same seven values make a tree of height 3 or a line of
 * height 7, depending only on the order they arrive in, and the height is
 * what every search pays.
 */

const WORDS = {
  en: {
    goal: 'Seven values are waiting to join an empty tree. Tap them in the order you want them to arrive. Can you build the shortest tree? The tallest?',
    waiting: 'Values waiting to arrive',
    insert: (v) => `Insert ${v}`,
    reset: 'Start over',
    start: 'The first value you tap becomes the root. Everything after it is compared with the root first.',
    tree: (order, h) => (order.length ? `Tree after inserting ${order.join(', ')}. Height ${h}.` : 'Empty tree.'),
    order: (order) => `Arrival order: ${order.join(', ')}`,
    height: (h) => `Height: ${h}`,
    root: (v) => `${v} arrived first, so it is the root. It will be the first comparison of every search from now on.`,
    step: (v, path, level) =>
      `${v} was compared with ${path.join(', then ')} (${path.length} comparison${path.length === 1 ? '' : 's'}) and fell into the empty spot on level ${level}.`,
    best: (h) => `Height ${h}: the shortest tree seven values can make. No search needs more than ${h} comparisons, because each arrival split what was left in half.`,
    worst: (h, deep) => `Height ${h}: a straight line. Finding ${deep} takes ${h} comparisons, no better than scanning a list. Every value landed directly under the one before it, so no node got two children.`,
    middle: (h, deep) => `Height ${h}. Finding ${deep} takes ${h} comparisons. Same seven values, different order, different cost: start over and aim for height 3, then for height 7.`,
  },
  bn: {
    goal: 'সাতটি মান একটা খালি ট্রিতে ঢোকার অপেক্ষায় আছে। যে ক্রমে ঢোকাতে চাও, সেই ক্রমে এগুলোতে চাপো। সবচেয়ে খাটো ট্রিটা বানাতে পারবে? আর সবচেয়ে লম্বাটা?',
    waiting: 'ঢোকার অপেক্ষায় থাকা মান',
    insert: (v) => `${v} যোগ করো`,
    reset: 'আবার শুরু',
    start: 'প্রথমে যেটায় চাপবে, সেটাই হবে root। এরপরের প্রতিটি মানকে আগে root-এর সাথে তুলনা করা হবে।',
    tree: (order, h) => (order.length ? `${order.join(', ')} যোগ করার পরের ট্রি। উচ্চতা ${h}।` : 'খালি ট্রি।'),
    order: (order) => `আসার ক্রম: ${order.join(', ')}`,
    height: (h) => `উচ্চতা: ${h}`,
    root: (v) => `${v} সবার আগে এসেছে, তাই এটাই root। এখন থেকে প্রতিটি খোঁজার প্রথম তুলনা হবে এর সাথে।`,
    step: (v, path, level) => `${v}-কে তুলনা করা হলো ${path.join(', তারপর ')}-এর সাথে (${path.length}টি তুলনা), আর সে বসল লেভেল ${level}-এর খালি জায়গায়।`,
    best: (h) => `উচ্চতা ${h}: সাতটি মান দিয়ে এর চেয়ে খাটো ট্রি হয় না। কোনো খোঁজায় ${h}টির বেশি তুলনা লাগবে না, কারণ প্রতিটি মান এসে বাকিদের দুই ভাগে ভাগ করেছে।`,
    worst: (h, deep) => `উচ্চতা ${h}: একটা সরল রেখা। ${deep} খুঁজতে লাগে ${h}টি তুলনা, লিস্ট ধরে খোঁজার চেয়ে একটুও ভালো নয়। প্রতিটি মান বসেছে ঠিক আগেরটার নিচে, তাই কোনো নোড দুটি সন্তান পায়নি।`,
    middle: (h, deep) => `উচ্চতা ${h}। ${deep} খুঁজতে লাগে ${h}টি তুলনা। সেই একই সাতটি মান, শুধু ক্রম আলাদা, তাই খরচও আলাদা: আবার শুরু করে উচ্চতা 3 বানাও, তারপর উচ্চতা 7।`,
  },
};

const VALUES = [10, 20, 30, 40, 50, 60, 70];
const COL = 40;
const ROW = 38;
const LEFT = 36;
const TOP = 22;

function arrivalOrder(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  let nodes; // value -> { level, parent }, in arrival order
  let last; // { value, path } of the newest arrival

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal">${w.goal}</p>
      <div class="widget-actions"><button type="button" class="demo-button" data-act="reset">${w.reset}</button></div>
    </div>
    <div class="widget-actions arrival-order-chips" role="group" aria-label="${w.waiting}">
      ${VALUES.map((v) => `<button type="button" class="demo-button" data-value="${v}" aria-label="${w.insert(v)}">${v}</button>`).join('')}
    </div>
    <svg class="arrival-order-tree" role="img"></svg>
    <p class="arrival-order-stats"><span data-stat="order"></span><strong data-stat="height"></strong></p>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const svg = root.querySelector('svg');
  const message = root.querySelector('.widget-message');
  const stat = (name) => root.querySelector(`[data-stat="${name}"]`);

  const height = () => Math.max(0, ...[...nodes.values()].map((node) => node.level));
  const x = (value) => LEFT + VALUES.indexOf(value) * COL;
  const y = (level) => TOP + (level - 1) * ROW;

  const draw = () => {
    const order = [...nodes.keys()];
    const h = height();
    const rows = Math.max(3, h);
    svg.setAttribute('viewBox', `0 0 ${LEFT + (VALUES.length - 1) * COL + 24} ${TOP * 2 + (rows - 1) * ROW}`);
    svg.setAttribute('aria-label', w.tree(order, h));
    const onPath = (value) => last?.path.includes(value);
    // Level numbers down the side, so the height can be read off the picture.
    const guides = Array.from({ length: rows }, (_, i) => `<text class="arrival-order-level" x="8" y="${y(i + 1)}">${i + 1}</text>`).join('');
    const edges = order
      .filter((value) => nodes.get(value).parent != null)
      .map((value) => {
        const { level, parent } = nodes.get(value);
        const walked = value === last?.value || (onPath(value) && onPath(parent));
        return `<line class="arrival-order-edge ${walked ? 'is-path' : ''}" x1="${x(parent)}" y1="${y(level - 1)}" x2="${x(value)}" y2="${y(level)}" />`;
      })
      .join('');
    const circles = order
      .map((value) => {
        const state = value === last?.value ? 'is-new' : onPath(value) ? 'is-path' : '';
        return `<g class="arrival-order-node ${state}" data-node="${value}"><circle cx="${x(value)}" cy="${y(nodes.get(value).level)}" r="15" /><text x="${x(value)}" y="${y(nodes.get(value).level)}">${value}</text></g>`;
      })
      .join('');
    svg.innerHTML = guides + edges + circles;
    stat('order').textContent = order.length ? w.order(order) : '';
    stat('height').textContent = order.length ? w.height(h) : '';
    root.querySelectorAll('[data-value]').forEach((chip) => {
      // aria-disabled, not disabled: the chip keeps keyboard focus after it is used.
      chip.setAttribute('aria-disabled', String(nodes.has(Number(chip.dataset.value))));
    });
  };

  const reset = () => {
    nodes = new Map();
    last = null;
    message.textContent = w.start;
    draw();
  };

  const insert = (value) => {
    if (nodes.has(value)) return;
    // The same walk a search makes: one comparison per level, left if smaller.
    const path = [];
    let parent = null;
    for (const [other, node] of nodes) {
      // Arrival order is top-down, so a node is always visited after its parent.
      if (node.parent === parent && (parent == null || value < parent === other < parent)) {
        path.push(other);
        parent = other;
      }
    }
    nodes.set(value, { level: path.length + 1, parent });
    last = { value, path };
    draw();
    const h = height();
    const deepest = [...nodes].find(([, node]) => node.level === h)[0];
    if (nodes.size < VALUES.length) message.textContent = path.length ? w.step(value, path, path.length + 1) : w.root(value);
    else message.textContent = h === 3 ? w.best(h) : h === VALUES.length ? w.worst(h, deepest) : w.middle(h, deepest);
    const added = svg.querySelector(`[data-node="${value}"]`);
    if (!reduceMotion() && added) animate(added, { opacity: [0, 1], scale: [0.5, 1] }, SPRING);
  };

  root.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-value]');
    if (chip) return insert(Number(chip.dataset.value));
    if (event.target.closest('[data-act="reset"]')) reset();
  });

  reset();
}

export default { 'arrival-order': arrivalOrder };
