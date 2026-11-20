import { escapeHtml } from '../utils/markdown.js';
import {
  arrayCode,
  arrayDeleteFrames,
  arrayInsertFrames,
  binarySearchCode,
  binarySearchFrames,
  bruteForcePairChecks,
  bruteForceWindowAdds,
  bstInOrder,
  bstInsert,
  bstLayout,
  bstSearchPath,
  fastSlowCode,
  fastSlowFrames,
  growthRates,
  gridTraversalFrames,
  pairSumCode,
  pairSumFrames,
  prefixSumCode,
  prefixSumFrames,
  simpleHash,
  sortingAlgorithms,
  traversalCode,
  windowSumCode,
  windowSumFrames,
} from './algorithms.js';
import { animate } from 'motion';
import { cellHtml, flyAway, flyFrom, identityKeys, motionRow, motionRowHtml, motionStageHtml, patchRow, reduceMotion, ripple, SPRING } from './motion.js';
import { createPlayer } from './player.js';

/**
 * Interactive demos, one per lesson.
 *
 * A lesson names its demo in curriculum.js (`demo: 'array-ops'`). App.js calls
 * `mount(element)` once per lesson visit, and the demo owns that element from
 * then on: it builds its controls once and redraws only its picture, so
 * keyboard focus stays on the button the learner pressed.
 */

const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const randomValues = (count, min = 1, max = 99) => Array.from({ length: count }, () => randomInt(min, max));

// Read an integer from an input; returns null for empty or non-numeric text.
const readInt = (input) => {
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) ? value : null;
};

const formatNumber = (value) => value.toLocaleString('en-US');

// Words several demos share.
const COMMON = {
  en: {
    colourKey: 'Colour key',
    kept: 'The demo still shows the previous values.',
    badList: (fewest, most, min, max) => `Type ${fewest} to ${most} whole numbers between ${min} and ${max}, separated by spaces or commas.`,
  },
  bn: {
    colourKey: 'রঙের মানে',
    kept: 'ডেমোতে আগের মানগুলোই দেখানো হচ্ছে।',
    badList: (fewest, most, min, max) => `${min} থেকে ${max}-এর মধ্যে ${fewest} থেকে ${most}টি পূর্ণসংখ্যা লেখো, স্পেস বা কমা দিয়ে আলাদা করে।`,
  },
};

// A colour key under a picture, so "grey means ruled out" sits next to the grey cells.
const legend = (items, lang = 'en') =>
  `<ul class="demo-legend" aria-label="${(COMMON[lang] ?? COMMON.en).colourKey}">${items
    .map(([swatch, label]) => `<li><span class="swatch swatch-${swatch}" aria-hidden="true"></span>${label}</li>`)
    .join('')}</ul>`;

// Tell simulator missions what the learner just did (src/demos/missions.js).
const emit = (root, detail) => root.dispatchEvent(new CustomEvent('demo-op', { bubbles: true, detail }));

// Status lines double as error messages; errors are styled and announced.
const setStatus = (el, text, { error = false, keptPrevious = error, kept = 'The demo still shows the previous values.' } = {}) => {
  el.textContent = keptPrevious ? `${text} ${kept}` : text;
  el.classList.toggle('is-error', error);
};


// "5, 2 9" → [5, 2, 9]: whole numbers in range, at most `max` of them; null when empty or invalid.
const readList = (input, { min = 1, max = 99, count = 20 } = {}) => {
  const values = input.value.split(/[\s,]+/).filter(Boolean).map(Number);
  const valid = values.length > 0 && values.length <= count && values.every((v) => Number.isInteger(v) && v >= min && v <= max);
  return valid ? values : null;
};

/* ---------- Arrays: insert and delete shift values ---------- */

const ARRAY_UI = {
  en: {
    value: 'Value', index: 'Index', read: 'Read [i]', insert: 'Insert at i', del: 'Delete at i', append: 'Append',
    keyHit: 'the value you asked for', keyMoved: 'shifted to make room or close the gap', keyGap: 'empty slot',
    full: (max) => `The demo holds at most ${max} values. Delete one first.`,
    badIndex: (last) => `Index must be a whole number from 0 to ${last}.`,
    readCaption: (i, v) => `array[${i}] is ${v}. One address calculation, no scan: O(1).`,
    appended: (v, i) => `Appended ${v} at index ${i}. Nothing moved: O(1).`,
    moved: (m) => `${m} value${m === 1 ? '' : 's'} moved. Step through to watch each one.`,
    start: 'Pick an operation. Watch how many values have to move.',
    hint: 'Read and Append move nothing. Insert and Delete shift every value after i.',
    kept: 'The demo still shows the previous values.',
  },
  bn: {
    value: 'মান', index: 'ইনডেক্স', read: '[i] পড়ো', insert: 'i-তে যোগ করো', del: 'i থেকে মোছো', append: 'শেষে যোগ করো',
    keyHit: 'যে মানটি চেয়েছ', keyMoved: 'জায়গা করতে বা ফাঁক বন্ধ করতে সরেছে', keyGap: 'খালি ঘর',
    full: (max) => `ডেমোতে সর্বোচ্চ ${max}টি মান রাখা যায়। আগে একটা মোছো।`,
    badIndex: (last) => `ইনডেক্স হতে হবে 0 থেকে ${last}-এর মধ্যে একটি পূর্ণসংখ্যা।`,
    readCaption: (i, v) => `array[${i}] হলো ${v}। একটা ঠিকানার হিসাব, কোনো খোঁজাখুঁজি নেই: O(1)।`,
    appended: (v, i) => `ইনডেক্স ${i}-এ ${v} যোগ হলো। কিছুই সরেনি: O(1)।`,
    moved: (m) => `${m}টি মান সরেছে। প্রতিটি ধাপে ধাপে দেখো।`,
    start: 'একটা কাজ বেছে নাও। দেখো কয়টি মান সরাতে হয়।',
    hint: 'পড়া আর শেষে যোগ করায় কিছু সরে না। যোগ আর মোছায় i-এর পরের সব মান সরে।',
    kept: 'ডেমোতে আগের মানগুলোই দেখানো হচ্ছে।',
  },
};

function mountArray(root, { lang = 'en' } = {}) {
  const w = ARRAY_UI[lang] ?? ARRAY_UI.en;
  let values = [4, 8, 15, 16, 42];
  const MAX = 10;

  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.value} <input class="demo-input" type="number" value="23" data-field="value" /></label>
      <label>${w.index} <input class="demo-input" type="number" value="2" min="0" data-field="index" /></label>
      <button type="button" class="demo-button" data-op="read">${w.read}</button>
      <button type="button" class="demo-button" data-op="insert">${w.insert}</button>
      <button type="button" class="demo-button" data-op="delete">${w.del}</button>
      <button type="button" class="demo-button" data-op="append">${w.append}</button>
    </div>
    ${motionStageHtml()}
    ${legend([['hit', w.keyHit], ['moved', w.keyMoved], ['gap', w.keyGap]], lang)}
    <p class="bs-compare arr-status" aria-live="polite"></p>
  `;

  const stage = motionRow(root.querySelector('.motion-row'));
  // Keys follow values, so a shift is the same value sliding one slot over.
  const keys = identityKeys();
  const status = root.querySelector('.arr-status');
  const valueInput = root.querySelector('[data-field="value"]');
  const indexInput = root.querySelector('[data-field="index"]');

  const player = createPlayer(root, ({ values: shown, hit, moved, vars }) => {
    const ids = keys(shown);
    stage.update(
      shown.map((value, i) => ({
        key: ids[i],
        className: `array-cell ${value === null ? 'is-gap' : i === hit ? 'is-hit' : moved.includes(i) ? 'is-moved' : ''}`,
        html: cellHtml(value ?? '', i),
      })),
      { pointers: { i: hit >= 0 ? hit : null, j: vars?.j ?? null } },
    );
  }, { lang });

  // One-step operations still go through the player, so every demo reads the same way.
  const single = (caption, hit, line = 0) => [{ values: [...values], hit, moved: [], line, vars: { n: values.length }, caption }];

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    const value = readInt(valueInput) ?? 0;
    const index = readInt(indexInput);
    const last = values.length - (op === 'insert' ? 0 : 1);

    if ((op === 'insert' || op === 'append') && values.length >= MAX) {
      return setStatus(status, w.full(MAX), { error: true, kept: w.kept });
    }
    if (op !== 'append' && (index === null || index < 0 || index > last)) {
      return setStatus(status, w.badIndex(last), { error: true, kept: w.kept });
    }

    let frames;
    if (op === 'read') {
      frames = single(w.readCaption(index, values[index]), index);
    } else if (op === 'append') {
      values.push(value);
      frames = single(w.appended(value, values.length - 1), values.length - 1);
    } else if (op === 'insert') {
      frames = arrayInsertFrames(values, index, value, lang);
      values.splice(index, 0, value);
    } else {
      frames = arrayDeleteFrames(values, index, lang);
      values.splice(index, 1);
    }
    const moved = frames.at(-1).moved.length;
    emit(root, { op, index: op === 'append' ? values.length - 1 : index, moved, n: values.length });
    setStatus(status, w.moved(moved));
    player.load(frames, arrayCode[op]);
  });

  player.load(single(w.start, -1), arrayCode.read);
  setStatus(status, w.hint);
}

/* ---------- Linked lists: walk the pointers ---------- */

const LIST_UI = {
  en: {
    value: 'Value', head: 'Insert at head', tail: 'Insert at tail', find: 'Find', remove: 'Remove',
    start: 'Each node holds a value and a pointer to the next node.',
    full: (max) => `The demo holds at most ${max} nodes. Remove one first.`,
    headDone: (v) => `New node ${v} points at the old head. Only one pointer changed: O(1). Nothing shifted.`,
    tailDone: (walked, v) => `Walked ${walked} node${walked === 1 ? '' : 's'} to find the end, then linked ${v}: O(n). (Keeping a tail pointer makes this O(1).)`,
    missing: (n, v) => `Walked all ${n} nodes: ${v} is not in the list. Search is O(n), there is no index to jump to.`,
    found: (v, i) => `Found ${v} after walking ${i + 1} node${i ? 's' : ''}. A list cannot jump to position ${i}: O(n).`,
    removed: (v) => `Walked to ${v}, then pointed the previous node past it. Unlinking is O(1); finding it was O(n).`,
  },
  bn: {
    value: 'মান', head: 'head-এ যোগ করো', tail: 'tail-এ যোগ করো', find: 'খোঁজো', remove: 'সরাও',
    start: 'প্রতিটি নোডে থাকে একটা মান আর পরের নোডের দিকে একটা পয়েন্টার।',
    full: (max) => `ডেমোতে সর্বোচ্চ ${max}টি নোড রাখা যায়। আগে একটা সরাও।`,
    headDone: (v) => `নতুন নোড ${v} পুরোনো head-এর দিকে পয়েন্ট করছে। বদলেছে শুধু একটা পয়েন্টার: O(1)। কিছুই সরেনি।`,
    tailDone: (walked, v) => `শেষ মাথা খুঁজতে ${walked}টি নোড হাঁটতে হলো, তারপর ${v} জুড়ে দেওয়া হলো: O(n)। (একটা tail পয়েন্টার রাখলে এটাও O(1) হয়।)`,
    missing: (n, v) => `${n}টি নোডই হেঁটে দেখা হলো: ${v} লিস্টে নেই। খোঁজা O(n), লাফ দেওয়ার মতো কোনো ইনডেক্স নেই।`,
    found: (v, i) => `${i + 1}টি নোড হেঁটে ${v} পাওয়া গেল। লিস্ট সরাসরি ${i} নম্বর জায়গায় লাফ দিতে পারে না: O(n)।`,
    removed: (v) => `${v} পর্যন্ত হেঁটে গিয়ে আগের নোডকে ওকে টপকে পরের নোডের দিকে পয়েন্ট করানো হলো। খুলে ফেলা O(1); খুঁজে পাওয়াটাই ছিল O(n)।`,
  },
};

function mountLinkedList(root, { lang = 'en' } = {}) {
  const w = LIST_UI[lang] ?? LIST_UI.en;
  let values = [7, 3, 9];
  const MAX = 8;

  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.value} <input class="demo-input" type="number" value="5" data-field="value" /></label>
      <button type="button" class="demo-button" data-op="head">${w.head}</button>
      <button type="button" class="demo-button" data-op="tail">${w.tail}</button>
      <button type="button" class="demo-button" data-op="find">${w.find}</button>
      <button type="button" class="demo-button" data-op="remove">${w.remove}</button>
    </div>
    <div class="demo-stage"><div class="list-row"></div></div>
    <p class="demo-caption" aria-live="polite">${w.start}</p>
  `;

  const row = root.querySelector('.list-row');
  row.innerHTML = '<span class="list-null">null</span>';
  const caption = root.querySelector('.demo-caption');
  const input = root.querySelector('[data-field="value"]');
  const keys = identityKeys();

  // `walked` is how many nodes were visited; `hit` is the index the operation
  // landed on. A node and its outgoing arrow move as one unit, so inserting at
  // the head slides the whole list right, and the walk plays node by node.
  const draw = ({ walked = 0, hit = -1, enter = { x: -40 } } = {}) => {
    const ids = keys(values);
    patchRow(
      row,
      values.map((value, i) => ({
        key: ids[i],
        className: `list-unit ${i === hit ? 'is-hit' : i < walked ? 'is-walked' : ''}`,
        html: `
          <div class="list-node">
            ${i === 0 ? '<span class="list-label">head</span>' : ''}
            <span class="list-value">${value}</span>
            <span class="list-next" aria-hidden="true">next</span>
          </div>
          <span class="list-arrow" aria-hidden="true">→</span>`,
      })),
      { enter, exit: { y: 34 } },
    );
    ripple([...row.querySelectorAll('.list-unit')].slice(0, Math.max(walked, hit + 1)).map((unit) => unit.firstElementChild));
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    const value = readInt(input) ?? 0;
    const full = values.length >= MAX && (op === 'head' || op === 'tail');
    if (full) return (caption.textContent = w.full(MAX));
    const n = values.length;

    if (op === 'head') {
      values.unshift(value);
      draw({ hit: 0 });
      caption.textContent = w.headDone(value);
      emit(root, { op, walked: 0, n });
    } else if (op === 'tail') {
      const walked = values.length;
      values.push(value);
      draw({ walked, hit: values.length - 1, enter: { x: 40 } });
      caption.textContent = w.tailDone(walked, value);
      emit(root, { op, walked, n });
    } else {
      const index = values.indexOf(value);
      emit(root, { op, found: index !== -1, index, n });
      if (index === -1) {
        draw({ walked: values.length });
        caption.textContent = w.missing(values.length, value);
        return;
      }
      if (op === 'find') {
        draw({ walked: index, hit: index });
        caption.textContent = w.found(value, index);
      } else {
        values.splice(index, 1);
        draw({ walked: index });
        caption.textContent = w.removed(value);
      }
    }
  });

  draw();
}

/* ---------- Stacks and queues: which end comes out ---------- */

const STACK_UI = {
  en: {
    stack: 'Stack (LIFO)', queue: 'Queue (FIFO)', push: 'Push', pop: 'Pop', enqueue: 'Enqueue', dequeue: 'Dequeue',
    start: 'Add the same values to both. Then take one out of each and compare.',
    empty: 'empty', top: 'top', front: 'front', back: 'back',
    full: (max) => `The demo holds at most ${max} values.`,
    stackEmpty: 'The stack is empty. Nothing to remove.',
    queueEmpty: 'The queue is empty. Nothing to remove.',
    pushed: (v) => `Pushed ${v} on top of the stack. O(1).`,
    enqueued: (v) => `Enqueued ${v} at the back of the queue. O(1).`,
    popped: (v) => `Popped ${v}: the newest value leaves first (last in, first out).`,
    dequeued: (v) => `Dequeued ${v}: the oldest value leaves first (first in, first out).`,
  },
  bn: {
    stack: 'স্ট্যাক (LIFO)', queue: 'কিউ (FIFO)', push: 'Push', pop: 'Pop', enqueue: 'Enqueue', dequeue: 'Dequeue',
    start: 'দুটোতেই একই মানগুলো যোগ করো। তারপর প্রতিটি থেকে একটা করে বের করে তুলনা করো।',
    empty: 'খালি', top: 'top', front: 'সামনে', back: 'পেছনে',
    full: (max) => `ডেমোতে সর্বোচ্চ ${max}টি মান রাখা যায়।`,
    stackEmpty: 'স্ট্যাক খালি। বের করার মতো কিছু নেই।',
    queueEmpty: 'কিউ খালি। বের করার মতো কিছু নেই।',
    pushed: (v) => `${v} স্ট্যাকের ওপরে push করা হলো। O(1)।`,
    enqueued: (v) => `${v} কিউয়ের পেছনে গিয়ে দাঁড়াল। O(1)।`,
    popped: (v) => `${v} pop হলো: সবার শেষে যে ঢুকেছে, সে-ই আগে বের হয় (last in, first out)।`,
    dequeued: (v) => `${v} dequeue হলো: সবার আগে যে ঢুকেছে, সে-ই আগে বের হয় (first in, first out)।`,
  },
};

function mountStackQueue(root, { lang = 'en' } = {}) {
  const w = STACK_UI[lang] ?? STACK_UI.en;
  const stack = [3, 8];
  const queue = [3, 8];
  let next = 12;
  let lastPushed = null; // the value pushed most recently, until it is popped
  const MAX = 8;

  root.innerHTML = `
    <div class="demo-columns">
      <div class="demo-column">
        <h3>${w.stack}</h3>
        <div class="demo-controls">
          <button type="button" class="demo-button" data-op="push">${w.push}</button>
          <button type="button" class="demo-button" data-op="pop">${w.pop}</button>
        </div>
        <div class="demo-stage"><div class="stack-view"></div></div>
      </div>
      <div class="demo-column">
        <h3>${w.queue}</h3>
        <div class="demo-controls">
          <button type="button" class="demo-button" data-op="enqueue">${w.enqueue}</button>
          <button type="button" class="demo-button" data-op="dequeue">${w.dequeue}</button>
        </div>
        <div class="demo-stage"><div class="queue-view"></div></div>
      </div>
    </div>
    <p class="demo-caption" aria-live="polite">${w.start}</p>
  `;

  const stackView = root.querySelector('.stack-view');
  const queueView = root.querySelector('.queue-view');
  const caption = root.querySelector('.demo-caption');

  // Values keep their element: a push drops onto the top, a pop flies off it;
  // an enqueue slides in at the back, a dequeue leaves at the front and the
  // rest of the line moves up.
  const empty = (view, isEmpty) => {
    const note = view.querySelector('.demo-empty');
    if (isEmpty && !note) view.insertAdjacentHTML('beforeend', `<p class="demo-empty">${w.empty}</p>`);
    if (!isEmpty) note?.remove();
  };
  const draw = (hit = {}) => {
    // Draw the stack top-first so the top sits at the top of the picture.
    patchRow(
      stackView,
      stack
        .map((value, i) => ({ key: `s${value}`, className: `stack-item ${hit.stack === i ? 'is-hit' : ''}`, html: `${value}${i === stack.length - 1 ? `<small>${w.top}</small>` : ''}` }))
        .reverse(),
      { enter: { y: -40 }, exit: { y: -56 } },
    );
    patchRow(
      queueView,
      queue.map((value, i) => ({
        key: `q${value}`,
        className: `queue-item ${hit.queue === i ? 'is-hit' : ''}`,
        html: `${value}${i === 0 ? `<small>${w.front}</small>` : ''}${i === queue.length - 1 ? `<small>${w.back}</small>` : ''}`,
      })),
      { enter: { x: 44 }, exit: { x: -56 } },
    );
    empty(stackView, !stack.length);
    empty(queueView, !queue.length);
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    if (op === 'push' || op === 'enqueue') {
      const list = op === 'push' ? stack : queue;
      if (list.length >= MAX) return (caption.textContent = w.full(MAX));
      const value = next++;
      list.push(value);
      if (op === 'push') lastPushed = value;
      draw(op === 'push' ? { stack: stack.length - 1 } : { queue: queue.length - 1 });
      caption.textContent = op === 'push' ? w.pushed(value) : w.enqueued(value);
      emit(root, { op, value, left: list.length });
      return;
    }
    const list = op === 'pop' ? stack : queue;
    if (!list.length) {
      emit(root, { op, empty: true, left: 0 });
      return (caption.textContent = op === 'pop' ? w.stackEmpty : w.queueEmpty);
    }
    const value = op === 'pop' ? stack.pop() : queue.shift();
    draw();
    caption.textContent = op === 'pop' ? w.popped(value) : w.dequeued(value);
    emit(root, { op, value, empty: false, left: list.length, justPushed: op === 'pop' && value === lastPushed });
    if (op === 'pop') lastPushed = null;
  });

  draw();
}

/* ---------- Hash tables: key → hash → bucket ---------- */

const HASH_UI = {
  en: {
    key: 'Key', insert: 'Insert', find: 'Look up', remove: 'Remove',
    start: 'Try "act": it has the same letters as "cat", so the same hash. That is a collision.',
    typeKey: 'Type a key first.',
    bucket: (i) => `bucket ${i}`,
    load: (count, b) => `Load factor: ${count} keys / ${b} buckets = ${(count / b).toFixed(2)}`,
    dup: (k, i) => `${k} is already in bucket ${i}. Keys are unique.`,
    full: (i) => `Bucket ${i} is full in this demo. Real tables grow and rehash when the load factor gets high.`,
    collision: (i, others, k) => `Collision: bucket ${i} already holds ${others} key${others > 1 ? 's' : ''}. ${k} joins the chain.`,
    straight: (k, i) => `${k} goes straight into empty bucket ${i}. O(1) on average.`,
    notFound: (i, k) => `Bucket ${i} does not hold ${k}, so it is not in the table. Only one bucket was checked.`,
    found: (i, k, checks) => `Jumped to bucket ${i} and found ${k} after checking ${checks} key${checks > 1 ? 's' : ''} in its chain.`,
    notIn: (k, i) => `${k} is not in bucket ${i}. Nothing to remove.`,
    removed: (k, i) => `Removed ${k} from bucket ${i}.`,
  },
  bn: {
    key: 'কী', insert: 'যোগ করো', find: 'খোঁজো', remove: 'সরাও',
    start: '"act" লিখে দেখো: এতে "cat"-এর অক্ষরগুলোই আছে, তাই হ্যাশও এক। একেই বলে কলিশন।',
    typeKey: 'আগে একটা কী লেখো।',
    bucket: (i) => `বাকেট ${i}`,
    load: (count, b) => `লোড ফ্যাক্টর: ${count}টি কী / ${b}টি বাকেট = ${(count / b).toFixed(2)}`,
    dup: (k, i) => `${k} আগে থেকেই বাকেট ${i}-এ আছে। প্রতিটি কী আলাদা হয়।`,
    full: (i) => `এই ডেমোতে বাকেট ${i} ভরে গেছে। আসল টেবিলে লোড ফ্যাক্টর বেশি হলে টেবিল বড় করে আবার হ্যাশ (rehash) করা হয়।`,
    collision: (i, others, k) => `কলিশন: বাকেট ${i}-এ আগে থেকেই ${others}টি কী আছে। ${k} সেই চেইনে যোগ হলো।`,
    straight: (k, i) => `${k} সোজা গিয়ে খালি বাকেট ${i}-এ বসল। গড়ে O(1)।`,
    notFound: (i, k) => `বাকেট ${i}-এ ${k} নেই, তাই টেবিলেও নেই। দেখতে হলো শুধু একটা বাকেট।`,
    found: (i, k, checks) => `সোজা বাকেট ${i}-এ লাফিয়ে গিয়ে চেইনের ${checks}টি কী দেখে ${k} পাওয়া গেল।`,
    notIn: (k, i) => `${k} বাকেট ${i}-এ নেই। সরানোর মতো কিছু নেই।`,
    removed: (k, i) => `বাকেট ${i} থেকে ${k} সরানো হলো।`,
  },
};

function mountHashTable(root, { lang = 'en' } = {}) {
  const w = HASH_UI[lang] ?? HASH_UI.en;
  const BUCKETS = 7;
  const buckets = Array.from({ length: BUCKETS }, () => []);
  for (const key of ['cat', 'dog', 'owl']) buckets[simpleHash(key, BUCKETS).index].push(key);
  const keyCount = () => buckets.reduce((total, chain) => total + chain.length, 0);

  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.key} <input class="demo-input demo-input-wide" type="text" value="act" maxlength="12" data-field="key" /></label>
      <button type="button" class="demo-button" data-op="insert">${w.insert}</button>
      <button type="button" class="demo-button" data-op="find">${w.find}</button>
      <button type="button" class="demo-button" data-op="remove">${w.remove}</button>
    </div>
    <pre class="hash-math" aria-hidden="true"></pre>
    <div class="demo-stage"><div class="hash-buckets"></div></div>
    <p class="demo-caption" aria-live="polite">${w.start}</p>
  `;

  const view = root.querySelector('.hash-buckets');
  const math = root.querySelector('.hash-math');
  const caption = root.querySelector('.demo-caption');
  const input = root.querySelector('[data-field="key"]');

  const draw = (hitBucket = -1, hitKey = null) => {
    view.innerHTML =
      buckets
        .map(
          (chain, i) => `
          <div class="hash-bucket ${i === hitBucket ? 'is-hit' : ''}">
            <span class="hash-index">${i}</span>
            <div class="hash-chain">
              ${chain.map((key) => `<span class="hash-key ${key === hitKey ? 'is-hit' : ''}">${escapeHtml(key)}</span>`).join('') || '<span class="demo-empty">·</span>'}
            </div>
          </div>`,
        )
        .join('') + `<p class="hash-load">${w.load(keyCount(), BUCKETS)}</p>`;
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    const key = input.value.trim();
    if (!key) return (caption.textContent = w.typeKey);

    const { codes, sum, index } = simpleHash(key, BUCKETS);
    math.textContent = `${[...key].map((ch, i) => `${ch}(${codes[i]})`).join(' + ')} = ${sum}\n${sum} % ${BUCKETS} = ${index}  →  ${w.bucket(index)}`;
    const chain = buckets[index];
    const position = chain.indexOf(key);
    const safeKey = `"${key}"`;

    if (op === 'insert') {
      if (position !== -1) {
        caption.textContent = w.dup(safeKey, index);
      } else if (chain.length >= 4) {
        caption.textContent = w.full(index);
      } else {
        chain.push(key);
        caption.textContent = chain.length > 1 ? w.collision(index, chain.length - 1, safeKey) : w.straight(safeKey, index);
      }
    } else if (op === 'find') {
      caption.textContent = position === -1 ? w.notFound(index, safeKey) : w.found(index, safeKey, position + 1);
    } else if (position === -1) {
      caption.textContent = w.notIn(safeKey, index);
    } else {
      // The key leaves its chain before the redraw closes the gap.
      flyAway(view.querySelectorAll('.hash-bucket')[index]?.querySelectorAll('.hash-key')[position], { y: 30 });
      chain.splice(position, 1);
      caption.textContent = w.removed(safeKey, index);
    }
    const isNew = op === 'insert' && position === -1 && chain.at(-1) === key;
    emit(root, { op, found: position !== -1, added: isNew, collision: isNew && chain.length > 1, load: keyCount() / BUCKETS });
    draw(index, op === 'remove' ? null : key);
    const bucket = view.querySelectorAll('.hash-bucket')[index];
    // The arithmetic picks the bucket: the key flies there from where it was typed.
    if (isNew) flyFrom(bucket.querySelector('.hash-key:last-child'), input);
    else if (op === 'find') ripple([...bucket.querySelectorAll('.hash-key')].slice(0, position === -1 ? undefined : position + 1));
    ripple([bucket.querySelector('.hash-index')], { scale: 1.3 });
  });

  draw();
}

/* ---------- Binary search trees: left is smaller, right is larger ---------- */

const BST_UI = {
  en: {
    value: 'Value', insert: 'Insert', search: 'Search', random: 'Random tree', sorted: 'Insert sorted 1-7', aria: 'Binary search tree',
    start: 'Every value smaller than a node lives on its left, every larger value on its right.',
    inorder: (list, h) => `In-order walk (left, node, right): ${list || 'empty'}. Height: ${h}.`,
    randomDone: 'A random insert order usually gives a bushy tree with a small height.',
    sortedDone: 'Sorted inserts make every node go right. The tree became a linked list: search is now O(n).',
    badValue: 'Use a whole number from 0 to 999.',
    already: (v) => `${v} is already in the tree.`,
    full: 'The demo holds at most 15 nodes. Try "Random tree".',
    inserted: (c, path, v) => `Compared with ${c} node${c === 1 ? '' : 's'} (${path || 'empty tree'}), then attached ${v} as a leaf.`,
    found: (v, c, path) => `Found ${v} after ${c} comparison${c === 1 ? '' : 's'}: ${path}.`,
    missing: (path, v) => `Followed ${path || 'nothing'} and fell off the tree: ${v} is not here.`,
  },
  bn: {
    value: 'মান', insert: 'যোগ করো', search: 'খোঁজো', random: 'এলোমেলো ট্রি', sorted: '1-7 সাজিয়ে যোগ করো', aria: 'বাইনারি সার্চ ট্রি',
    start: 'প্রতিটি নোডের চেয়ে ছোট সব মান থাকে তার বামে, আর বড় সব মান তার ডানে।',
    inorder: (list, h) => `ইন-অর্ডার হাঁটা (বাম, নোড, ডান): ${list || 'খালি'}। উচ্চতা: ${h}।`,
    randomDone: 'এলোমেলো ক্রমে যোগ করলে সাধারণত ছড়ানো, কম উচ্চতার একটা ট্রি হয়।',
    sortedDone: 'সাজানো ক্রমে যোগ করায় প্রতিটি নোড ডানে গেল। ট্রিটা হয়ে গেল একটা লিংকড লিস্ট: খোঁজা এখন O(n)।',
    badValue: '0 থেকে 999-এর মধ্যে একটা পূর্ণসংখ্যা দাও।',
    already: (v) => `${v} আগে থেকেই ট্রিতে আছে।`,
    full: 'ডেমোতে সর্বোচ্চ 15টি নোড রাখা যায়। "এলোমেলো ট্রি" চেষ্টা করো।',
    inserted: (c, path, v) => `${c}টি নোডের সাথে তুলনা করে (${path || 'খালি ট্রি'}) ${v}-কে পাতা (leaf) হিসেবে জুড়ে দেওয়া হলো।`,
    found: (v, c, path) => `${c}টি তুলনার পর ${v} পাওয়া গেল: ${path}।`,
    missing: (path, v) => `${path || 'কিছুই না'} ধরে এগোতে এগোতে পথ ফুরিয়ে গেল: ${v} এই ট্রিতে নেই।`,
  },
};

function mountBst(root, { lang = 'en' } = {}) {
  const w = BST_UI[lang] ?? BST_UI.en;
  let tree = null;
  const reset = (values) => {
    tree = null;
    for (const value of values) tree = bstInsert(tree, value);
  };
  reset([50, 30, 70, 20, 40, 60, 80]);
  // Size and height, for missions: a tree as tall as it has nodes is a list.
  const shape = () => {
    const { nodes } = bstLayout(tree);
    return { size: nodes.length, height: nodes.length ? Math.max(...nodes.map((node) => node.y)) + 1 : 0 };
  };

  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.value} <input class="demo-input" type="number" value="45" min="0" max="999" data-field="value" /></label>
      <button type="button" class="demo-button" data-op="insert">${w.insert}</button>
      <button type="button" class="demo-button" data-op="search">${w.search}</button>
      <button type="button" class="demo-button" data-op="random">${w.random}</button>
      <button type="button" class="demo-button" data-op="sorted">${w.sorted}</button>
    </div>
    <div class="demo-stage"><svg class="bst-svg" role="img" aria-label="${w.aria}"></svg></div>
    <p class="bst-inorder"></p>
    <p class="demo-caption" aria-live="polite">${w.start}</p>
  `;

  const svg = root.querySelector('.bst-svg');
  const inorder = root.querySelector('.bst-inorder');
  const caption = root.querySelector('.demo-caption');
  const input = root.querySelector('[data-field="value"]');

  svg.innerHTML = '<g class="bst-edges"></g><g class="bst-nodes"></g>';
  const edgeLayer = svg.querySelector('.bst-edges');
  const nodeLayer = svg.querySelector('.bst-nodes');
  const SVG = 'http://www.w3.org/2000/svg';

  // Nodes and edges keep their elements across draws: when an insert reshapes
  // the tree, every node glides to its new place and the edges follow; a new
  // node grows in; the search path then lights up one comparison at a time.
  const draw = (path = [], hit = null) => {
    const { nodes, edges } = bstLayout(tree);
    const gapX = 46;
    const gapY = 62;
    const depth = Math.max(0, ...nodes.map((node) => node.y));
    const width = Math.max(1, nodes.length) * gapX + 20;
    const height = (depth + 1) * gapY + 10;
    const at = Object.fromEntries(nodes.map((node) => [node.value, { x: node.x * gapX + 33, y: node.y * gapY + 30 }]));
    const instant = { duration: 0 };
    const spring = reduceMotion() ? instant : SPRING;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = `${width}px`;

    const oldEdges = new Map([...edgeLayer.children].map((line) => [line.dataset.key, line]));
    for (const [a, b] of edges) {
      const key = `${a}-${b}`;
      let line = oldEdges.get(key);
      const target = { x1: at[a].x, y1: at[a].y, x2: at[b].x, y2: at[b].y };
      if (line) {
        oldEdges.delete(key);
        animate(line, target, spring);
      } else {
        line = document.createElementNS(SVG, 'line');
        line.dataset.key = key;
        for (const [name, value] of Object.entries(target)) line.setAttribute(name, value);
        edgeLayer.append(line);
        if (!reduceMotion()) animate(line, { opacity: [0, 1] }, { duration: 0.3, delay: 0.15 });
      }
      line.setAttribute('class', `bst-edge ${path.includes(a) && path.includes(b) ? 'is-path' : ''}`);
    }
    oldEdges.forEach((line) => line.remove());

    const oldNodes = new Map([...nodeLayer.children].map((g) => [g.dataset.key, g]));
    for (const node of nodes) {
      const key = String(node.value);
      let g = oldNodes.get(key);
      const { x, y } = at[node.value];
      if (g) {
        oldNodes.delete(key);
        animate(g, { x, y }, spring);
      } else {
        g = document.createElementNS(SVG, 'g');
        g.dataset.key = key;
        g.innerHTML = `<circle r="18" /><text>${node.value}</text>`;
        nodeLayer.append(g);
        animate(g, { x, y }, instant);
        if (!reduceMotion() && oldNodes.size + nodeLayer.children.length > 1) animate(g, { scale: [0, 1] }, SPRING);
      }
      g.setAttribute('class', `bst-node ${node.value === hit ? 'is-hit' : path.includes(node.value) ? 'is-path' : ''}`);
    }
    oldNodes.forEach((g) => g.remove());

    // The comparisons, in the order they happened.
    ripple(
      path.map((value) => nodeLayer.querySelector(`[data-key="${value}"] circle`)).filter(Boolean),
      { gap: 0.2, scale: 1.25 },
    );
    inorder.textContent = w.inorder(bstInOrder(tree).join(', '), nodes.length ? depth + 1 : 0);
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;

    if (op === 'random' || op === 'sorted') {
      reset(op === 'random' ? randomValues(9, 1, 99) : [1, 2, 3, 4, 5, 6, 7]);
      draw();
      caption.textContent = op === 'random' ? w.randomDone : w.sortedDone;
      emit(root, { op, ...shape() });
      return;
    }

    const value = readInt(input);
    if (value === null || value < 0 || value > 999) return (caption.textContent = w.badValue);
    const { path, found } = bstSearchPath(tree, value);
    const comparisons = path.length;

    if (op === 'insert') {
      if (found) {
        draw(path, value);
        caption.textContent = w.already(value);
        emit(root, { op, added: false, ...shape() });
        return;
      }
      if (bstInOrder(tree).length >= 15) return (caption.textContent = w.full);
      tree = bstInsert(tree, value);
      draw([...path, value], value);
      caption.textContent = w.inserted(comparisons, path.join(' → '), value);
      emit(root, { op, added: true, comparisons, ...shape() });
    } else {
      draw(path, found ? value : null);
      caption.textContent = found ? w.found(value, comparisons, path.join(' → ')) : w.missing(path.join(' → '), value);
      emit(root, { op, found, comparisons, ...shape() });
    }
  });

  draw();
}

/* ---------- Big O: how work grows with n ---------- */

const GROWTH_UI = {
  en: {
    size: 'Input size n =',
    start: 'Drag the slider. Bars are drawn to the same scale, so the slow shapes take over fast.',
    steps: (v, time) => `${v} steps · ${time}`,
  },
  bn: {
    size: 'ইনপুটের মাপ n =',
    start: 'স্লাইডার টানো। সব বার একই মাপে আঁকা, তাই ধীর ধরনগুলো খুব তাড়াতাড়ি বাকিদের ছাড়িয়ে যায়।',
    steps: (v, time) => `${v} ধাপ · ${time}`,
  },
};

function mountGrowth(root, { lang = 'en' } = {}) {
  const w = GROWTH_UI[lang] ?? GROWTH_UI.en;
  root.innerHTML = `
    <div class="demo-controls">
      <label class="demo-slider">${w.size} <output data-field="n-out">16</output>
        <input type="range" min="1" max="1000" value="16" data-field="n" />
      </label>
    </div>
    <div class="demo-stage"><div class="growth-bars"></div></div>
    <p class="demo-caption">${w.start}</p>
  `;
  const slider = root.querySelector('[data-field="n"]');
  const output = root.querySelector('[data-field="n-out"]');
  const bars = root.querySelector('.growth-bars');

  // Rows are built once; dragging the slider only changes widths and numbers,
  // so the bars grow and shrink smoothly instead of being redrawn.
  bars.innerHTML = growthRates
    .map(
      (rate) => `
        <div class="growth-row">
          <span class="growth-label">${rate.label}</span>
          <div class="growth-track"><div class="growth-bar growth-${rate.id}"></div></div>
          <span class="growth-value"></span>
        </div>`,
    )
    .join('');
  const barEls = [...bars.querySelectorAll('.growth-bar')];
  const valueEls = [...bars.querySelectorAll('.growth-value')];

  const draw = () => {
    const n = Number(slider.value);
    output.textContent = n;
    const rows = growthRates.map((rate) => ({ ...rate, value: rate.ops(n) }));
    const max = Math.max(...rows.map((row) => row.value));
    rows.forEach((row, i) => {
      // At 1 µs per step, how long would this take?
      const ms = row.value / 1000;
      const time = ms < 1 ? `${formatNumber(row.value)} µs` : ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`;
      barEls[i].style.width = `${Math.max(0.6, (row.value / max) * 100)}%`;
      valueEls[i].textContent = w.steps(formatNumber(row.value), time);
    });
  };

  slider.addEventListener('input', () => {
    draw();
    emit(root, { op: 'n', n: Number(slider.value) });
  });
  draw();
}


/* ---------- Binary search: halve the range each step ---------- */

const SEARCH_UI = {
  en: {
    target: 'Target', search: 'Search', shuffle: 'New list', list: 'Your list', use: 'Use list', placeholder: 'e.g. 4 8 15 16 23 42',
    keyMid: 'checking (mid)', keyFound: 'found', keyOut: 'ruled out', keyRange: 'still in play (lo..hi)',
    question: (lo, hi) => `lo = ${lo} and hi = ${hi}. Which cell is checked next?`,
    explain: (lo, hi, mid) => `mid = (lo + hi) // 2 = (${lo} + ${hi}) // 2 = ${mid}.`,
    typeNumber: 'Type a whole number to search for.',
    compare: (checks, linear, n) => `Binary search: ${checks} checks. Linear search would check ${linear} of ${n} values.`,
  },
  bn: {
    target: 'লক্ষ্য', search: 'খোঁজো', shuffle: 'নতুন তালিকা', list: 'তোমার তালিকা', use: 'এই তালিকা নাও', placeholder: 'যেমন 4 8 15 16 23 42',
    keyMid: 'যেটা দেখা হচ্ছে (mid)', keyFound: 'পাওয়া গেছে', keyOut: 'বাদ পড়েছে', keyRange: 'এখনও বিবেচনায় (lo..hi)',
    question: (lo, hi) => `lo = ${lo} আর hi = ${hi}। এরপর কোন ঘরটা দেখা হবে?`,
    explain: (lo, hi, mid) => `mid = (lo + hi) // 2 = (${lo} + ${hi}) // 2 = ${mid}।`,
    typeNumber: 'খোঁজার জন্য একটা পূর্ণসংখ্যা লেখো।',
    compare: (checks, linear, n) => `বাইনারি সার্চ: ${checks}টি চেক। বাম থেকে ডানে খুঁজলে ${n}টির মধ্যে ${linear}টি মান দেখতে হতো।`,
  },
};

function mountBinarySearch(root, { lang = 'en' } = {}) {
  const w = SEARCH_UI[lang] ?? SEARCH_UI.en;
  const c = COMMON[lang] ?? COMMON.en;
  let values = [];
  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.target} <input class="demo-input" type="number" value="0" data-field="target" /></label>
      <button type="button" class="demo-button" data-op="search">${w.search}</button>
      <button type="button" class="demo-button" data-op="shuffle">${w.shuffle}</button>
      <div class="demo-list-row">
  <label>${w.list} <input class="demo-input demo-input-wide" type="text" placeholder="${w.placeholder}" data-field="list" /></label>
  <button type="button" class="demo-button" data-op="use">${w.use}</button>
      </div>
    </div>
    ${motionStageHtml('bs-row')}
    ${legend([['mid', w.keyMid], ['found', w.keyFound], ['out', w.keyOut], ['range', w.keyRange]], lang)}
    <p class="bs-compare" aria-live="polite"></p>
  `;

  const stage = motionRow(root.querySelector('.motion-row'));
  const compare = root.querySelector('.bs-compare');
  const input = root.querySelector('[data-field="target"]');
  const listInput = root.querySelector('[data-field="list"]');
  const checked = (next) => (Number.isInteger(next.found) && next.found >= 0 ? next.found : next.mid);

  // lo, mid and hi glide under the cells; the bracket around lo..hi shrinks by half each check.
  const player = createPlayer(root, ({ lo, hi, mid, found }) => {
    const isFound = Number.isInteger(found) && found >= 0;
    stage.update(
      values.map((value, i) => ({
        key: `i${i}`,
        className: `array-cell ${i === found ? 'is-found' : i === mid ? 'is-mid' : i < lo || i > hi ? 'is-out' : ''}`,
        html: cellHtml(value, i),
      })),
      { pointers: { lo, mid: isFound ? found : mid, hi }, range: lo <= hi ? [lo, hi] : null },
    );
  }, {
    // Predict: which cell will be checked next?
    predict: {
      question: (now, next) => w.question(next.lo, next.hi),
      answer: checked,
      explain: (next) => w.explain(next.lo, next.hi, checked(next)),
      cells: () => stage.row.querySelectorAll(':scope > [data-key]'),
    },
    lang,
  });

  // `byLearner`: only searches the learner started count toward missions.
  const run = (byLearner = false) => {
    const target = readInt(input);
    if (target === null) {
      setStatus(compare, w.typeNumber, { error: true, kept: c.kept });
      return;
    }
    const frames = binarySearchFrames(values, target, lang);
    const linear = values.indexOf(target);
    const found = frames.at(-1).found >= 0;
    if (byLearner) emit(root, { op: 'search', found, checks: frames.length - (found ? 0 : 1), n: values.length });
    setStatus(compare, w.compare(frames.length - (frames.at(-1).found === -1 ? 1 : 0), linear === -1 ? values.length : linear + 1, values.length));
    player.load(frames, binarySearchCode);
  };

  const shuffle = () => {
    // Distinct sorted values: binary search needs sorted input.
    // A 390px phone fits 7 cells at once and the 760px lesson column fits 12;
    // more would push lo and hi out of view.
    const count = window.matchMedia('(max-width: 480px)').matches ? 7 : 12;
    values = [...new Set(randomValues(40, 1, 99))].slice(0, count).sort((a, b) => a - b);
    // Not the first two values (a plain scan would look better there) and not
    // the first middle (the search would end in one step and show nothing).
    const firstMid = Math.floor((values.length - 1) / 2);
    const choices = values.map((_, i) => i).filter((i) => i >= 2 && i !== firstMid);
    input.value = values[choices[randomInt(0, choices.length - 1)]];
    run();
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'search') run(true);
    if (op === 'shuffle') shuffle();
    if (op === 'use') {
      const list = readList(listInput, { min: -999, max: 999 });
      if (!list) {
        setStatus(compare, c.badList(1, 20, -999, 999), { error: true, kept: c.kept });
        return;
      }
      // Binary search only works on sorted data, so sort (and drop repeats) first.
      values = [...new Set(list)].sort((a, b) => a - b);
      run();
    }
  });

  shuffle();
}

/* ---------- Sorting: compare, swap, repeat ---------- */

const SORT_UI = {
  en: {
    algorithm: 'Algorithm', size: 'Size', shuffle: 'Shuffle', nearly: 'Nearly sorted', reversed: 'Reversed',
    list: 'Your values', use: 'Use values', placeholder: 'e.g. 5 2 9 1',
    keyActive: 'being compared or moved', keySorted: 'in its final place',
    labels: {}, big: {},
    meta: (label, big, steps, n) => `${label} · ${big} · ${steps} recorded steps for ${n} values.`,
  },
  bn: {
    algorithm: 'অ্যালগরিদম', size: 'মাপ', shuffle: 'এলোমেলো করো', nearly: 'প্রায় সাজানো', reversed: 'উল্টো ক্রমে',
    list: 'তোমার মানগুলো', use: 'এই মানগুলো নাও', placeholder: 'যেমন 5 2 9 1',
    keyActive: 'তুলনা হচ্ছে বা সরছে', keySorted: 'নিজের চূড়ান্ত জায়গায়',
    labels: { bubble: 'বাবল সর্ট', selection: 'সিলেকশন সর্ট', insertion: 'ইনসার্শন সর্ট', merge: 'মার্জ সর্ট' },
    big: { insertion: 'O(n²), প্রায় সাজানো হলে O(n)' },
    meta: (label, big, steps, n) => `${label} · ${big} · ${n}টি মানের জন্য ${steps}টি ধাপ।`,
  },
};

function mountSorting(root, { lang = 'en' } = {}) {
  const w = SORT_UI[lang] ?? SORT_UI.en;
  const c = COMMON[lang] ?? COMMON.en;
  const label = (id) => w.labels[id] ?? sortingAlgorithms[id].label;
  let values = [];
  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.algorithm}
        <select class="demo-input demo-input-wide" data-field="algorithm">
          ${Object.keys(sortingAlgorithms).map((id) => `<option value="${id}">${label(id)}</option>`).join('')}
        </select>
      </label>
      <label>${w.size}
        <select class="demo-input" data-field="size">
          <option>8</option><option selected>12</option><option>20</option>
        </select>
      </label>
      <button type="button" class="demo-button" data-op="shuffle">${w.shuffle}</button>
      <button type="button" class="demo-button" data-op="nearly">${w.nearly}</button>
      <button type="button" class="demo-button" data-op="reversed">${w.reversed}</button>
      <div class="demo-list-row">
  <label>${w.list} <input class="demo-input demo-input-wide" type="text" placeholder="${w.placeholder}" data-field="list" /></label>
  <button type="button" class="demo-button" data-op="use">${w.use}</button>
      </div>
    </div>
    <div class="demo-stage"><div class="sort-bars"></div></div>
    ${legend([['active', w.keyActive], ['sorted', w.keySorted]], lang)}
    <p class="sort-meta" aria-live="polite"></p>
  `;

  const bars = root.querySelector('.sort-bars');
  // Keys follow values, so a swap is two bars trading places.
  const keys = identityKeys();
  const meta = root.querySelector('.sort-meta');
  const algorithmSelect = root.querySelector('[data-field="algorithm"]');
  const sizeSelect = root.querySelector('[data-field="size"]');
  const listInput = root.querySelector('[data-field="list"]');

  const player = createPlayer(root, ({ values: frameValues, active, sorted }) => {
    const ids = keys(frameValues);
    patchRow(
      bars,
      frameValues.map((value, i) => ({
        key: ids[i],
        className: `sort-bar ${active.includes(i) ? 'is-active' : sorted.includes(i) ? 'is-sorted' : ''}`,
        style: `height: ${value}%`,
        html: `<span>${value}</span>`,
      })),
    );
  }, { lang });

  // `byLearner`: the shuffle on load does not count toward missions.
  const load = (byLearner = true) => {
    keys.reset();
    const id = algorithmSelect.value;
    const algorithm = sortingAlgorithms[id];
    const frames = algorithm.frames(values, lang);
    setStatus(meta, w.meta(label(id), w.big[id] ?? algorithm.big, frames.length, values.length));
    player.load(frames, algorithm.code);
    if (!byLearner) return;
    // Moves: steps where some value changed place. Passes: bubble sort's "a[end] is final" lines.
    const moves = frames.filter((f, i) => i > 0 && f.values.some((v, j) => v !== frames[i - 1].values[j])).length;
    const reversed = values.length > 1 && values[0] > values.at(-1) && values.every((v, i) => i === 0 || values[i - 1] >= v);
    emit(root, { op: 'sort', algorithm: id, n: values.length, moves, reversed, passes: frames.filter((f) => f.line === 4).length });
  };

  const shuffle = (shape = 'random', byLearner = true) => {
    const size = Number(sizeSelect.value);
    values = randomValues(size, 8, 99);
    if (shape === 'reversed') values.sort((a, b) => b - a);
    if (shape === 'nearly') {
      values.sort((a, b) => a - b);
      // Swap two neighbours so the list is almost, but not quite, sorted.
      const i = randomInt(0, size - 2);
      [values[i], values[i + 1]] = [values[i + 1], values[i]];
    }
    load(byLearner);
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'shuffle') shuffle();
    if (op === 'nearly' || op === 'reversed') shuffle(op);
    if (op === 'use') {
      const list = readList(listInput);
      if (!list) {
        setStatus(meta, c.badList(1, 20, 1, 99), { error: true, kept: c.kept });
        return;
      }
      values = list;
      load();
    }
  });
  algorithmSelect.addEventListener('change', () => load());
  sizeSelect.addEventListener('change', () => shuffle());

  shuffle('random', false);
}

/* ---------- Graph traversal: BFS vs DFS on a grid ---------- */

const GRID_UI = {
  en: {
    strategy: 'Strategy', bfs: 'Breadth-first (queue)', dfs: 'Depth-first (stack)', clear: 'Clear walls',
    hint: 'Click a cell to add or remove a wall. S is the start, G is the goal.',
    keyCurrent: 'visiting now', keyFrontier: 'waiting in the queue or stack', keyVisited: 'visited (number = order)', keyPath: 'path found', keyWall: 'wall',
    cell: (r, col, wall) => `Row ${r}, column ${col}${wall ? ', wall' : ''}`,
  },
  bn: {
    strategy: 'কৌশল', bfs: 'ব্রেডথ-ফার্স্ট (কিউ)', dfs: 'ডেপথ-ফার্স্ট (স্ট্যাক)', clear: 'দেয়াল মুছে ফেলো',
    hint: 'কোনো ঘরে ক্লিক করে দেয়াল বসাও বা সরাও। S হলো শুরু, G হলো লক্ষ্য।',
    keyCurrent: 'এখন যে ঘরে', keyFrontier: 'কিউ বা স্ট্যাকে অপেক্ষায়', keyVisited: 'দেখা হয়ে গেছে (সংখ্যা = ক্রম)', keyPath: 'খুঁজে পাওয়া পথ', keyWall: 'দেয়াল',
    cell: (r, col, wall) => `সারি ${r}, কলাম ${col}${wall ? ', দেয়াল' : ''}`,
  },
};

function mountGridTraversal(root, { lang = 'en' } = {}) {
  const w = GRID_UI[lang] ?? GRID_UI.en;
  const ROWS = 8;
  const COLS = 12;
  const start = [0, 0];
  const goal = [ROWS - 1, COLS - 1];
  const walls = new Set(['1,3', '2,3', '3,3', '4,3', '5,3', '2,7', '3,7', '4,7', '5,7', '6,7', '7,7', '0,9', '1,9', '2,9']);
  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.strategy}
        <select class="demo-input demo-input-wide" data-field="mode">
          <option value="bfs">${w.bfs}</option>
          <option value="dfs">${w.dfs}</option>
        </select>
      </label>
      <button type="button" class="demo-button" data-op="clear">${w.clear}</button>
    </div>
    <p class="demo-hint">${w.hint}</p>
    <div class="demo-stage"><div class="grid" style="grid-template-columns: repeat(${COLS}, 1fr)"></div></div>
    ${legend([['current', w.keyCurrent], ['frontier', w.keyFrontier], ['visited', w.keyVisited], ['path', w.keyPath], ['wall', w.keyWall]], lang)}
  `;

  const grid = root.querySelector('.grid');
  const modeSelect = root.querySelector('[data-field="mode"]');
  const startKey = start.join(',');
  const goalKey = goal.join(',');

  // Cells are buttons so keyboard users can toggle walls too.
  const draw = (frame) => {
    // Redrawing replaces the buttons; remember the focused cell so arrow-key stepping keeps working.
    const focusedCell = grid.contains(document.activeElement) ? document.activeElement.dataset.cell : null;
    const visited = new Set(frame?.visited);
    const frontier = new Set(frame?.frontier);
    const path = new Set(frame?.path);
    const items = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r},${c}`;
        const state = walls.has(key)
          ? 'is-wall'
          : path.has(key)
            ? 'is-path'
            : key === frame?.current
              ? 'is-current'
              : frontier.has(key)
                ? 'is-frontier'
                : visited.has(key)
                  ? 'is-visited'
                  : '';
        const label = key === startKey ? 'S' : key === goalKey ? 'G' : '';
        const order = visited.has(key) && !label ? frame.visited.indexOf(key) + 1 : '';
        items.push({
          key,
          className: `grid-cell ${state}`,
          html: String(label || order),
          attrs: { type: 'button', 'data-cell': key, 'aria-label': w.cell(r + 1, c + 1, walls.has(key)) },
          pop: state === 'is-current',
        });
      }
    }
    // Buttons are reused, so focus stays put and new visits pop in order.
    patchRow(grid, items, { tag: 'button' });
    if (focusedCell && !grid.contains(document.activeElement)) grid.querySelector(`[data-cell="${focusedCell}"]`)?.focus();
  };

  const player = createPlayer(root, draw, { lang });
  // `byLearner`: the run on load does not count toward missions. Missions
  // compare the two strategies, so a learner's run also traces the other one.
  const run = (byLearner = true) => {
    const mode = modeSelect.value;
    const trace = (m) => gridTraversalFrames({ rows: ROWS, cols: COLS, walls, start, goal, mode: m }, lang);
    const frames = trace(mode);
    player.load(frames, traversalCode(mode));
    if (!byLearner) return;
    const pathLength = (f) => f.at(-1).path.length - 1;
    const other = trace(mode === 'bfs' ? 'dfs' : 'bfs');
    const [bfs, dfs] = mode === 'bfs' ? [frames, other] : [other, frames];
    emit(root, { op: 'run', mode, found: frames.at(-1).path.length > 0, bfsPath: pathLength(bfs), dfsPath: pathLength(dfs), walls: walls.size });
  };

  root.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-cell]')?.dataset.cell;
    if (cell && cell !== startKey && cell !== goalKey) {
      if (walls.has(cell)) walls.delete(cell);
      else walls.add(cell);
      run();
      // The grid was redrawn, so put focus back on the same cell.
      root.querySelector(`[data-cell="${cell}"]`)?.focus();
      return;
    }
    if (event.target.closest('[data-op="clear"]')) {
      walls.clear();
      run();
    }
  });
  modeSelect.addEventListener('change', () => run());

  run(false);
}

/* ---------- Pattern: two pointers on a sorted array ---------- */

const PAIR_UI = {
  en: {
    target: 'Target sum', run: 'Find pair', list: 'Your sorted list', use: 'Use list', placeholder: 'e.g. 2 5 9 12 20',
    keyMid: 'L and R, being added', keyFound: 'the pair', keyOut: 'ruled out for good', keyRange: 'still possible (L..R)',
    question: (a, b, t) => `${a} + ${b} = ${a + b}, target ${t}. Where does a pointer move?`,
    left: 'The sum was too small, so L moves right to a bigger value.',
    right: 'The sum was too big, so R moves left to a smaller value.',
    compare: (steps, checks) => `Two pointers: ${steps} step${steps === 1 ? '' : 's'}. Brute force would check ${checks} pair${checks === 1 ? '' : 's'}.`,
  },
  bn: {
    target: 'লক্ষ্য যোগফল', run: 'জোড়া খোঁজো', list: 'তোমার সাজানো তালিকা', use: 'এই তালিকা নাও', placeholder: 'যেমন 2 5 9 12 20',
    keyMid: 'L আর R, যাদের যোগ করা হচ্ছে', keyFound: 'জোড়াটা', keyOut: 'চিরতরে বাদ', keyRange: 'এখনও সম্ভব (L..R)',
    question: (a, b, t) => `${a} + ${b} = ${a + b}, লক্ষ্য ${t}। কোন পয়েন্টার কোথায় সরবে?`,
    left: 'যোগফল ছোট ছিল, তাই L ডানে সরে বড় মানের দিকে যায়।',
    right: 'যোগফল বড় ছিল, তাই R বামে সরে ছোট মানের দিকে যায়।',
    compare: (steps, checks) => `টু পয়েন্টার: ${steps} ধাপ। ব্রুট ফোর্সে ${checks}টি জোড়া দেখতে হতো।`,
  },
};

function mountTwoPointers(root, { lang = 'en' } = {}) {
  const w = PAIR_UI[lang] ?? PAIR_UI.en;
  const c = COMMON[lang] ?? COMMON.en;
  let values = [1, 3, 4, 6, 8, 11, 14, 17];

  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.target} <input class="demo-input" type="number" value="19" data-field="target" /></label>
      <button type="button" class="demo-button" data-op="run">${w.run}</button>
      <div class="demo-list-row">
  <label>${w.list} <input class="demo-input demo-input-wide" type="text" placeholder="${w.placeholder}" data-field="list" /></label>
  <button type="button" class="demo-button" data-op="use">${w.use}</button>
      </div>
    </div>
    ${motionStageHtml('tp-row')}
    ${legend([['mid', w.keyMid], ['found', w.keyFound], ['out', w.keyOut], ['range', w.keyRange]], lang)}
    <p class="bs-compare tp-compare" aria-live="polite"></p>
  `;

  const stage = motionRow(root.querySelector('.motion-row'));
  const compare = root.querySelector('.tp-compare');
  const targetInput = root.querySelector('[data-field="target"]');
  const listInput = root.querySelector('[data-field="list"]');

  // Values outside left..right are ruled out for good: grey them.
  const player = createPlayer(root, ({ left, right, found }) => {
    stage.update(
      values.map((value, i) => ({
        key: `i${i}`,
        className: `array-cell ${found?.includes(i) ? 'is-found' : i === left || i === right ? 'is-mid' : i < left || i > right ? 'is-out' : ''}`,
        html: cellHtml(value, i),
      })),
      { pointers: { L: left, R: right }, range: left <= right ? [left, right] : null },
    );
  }, {
    // Predict: after this sum, which pointer moves, and to which cell?
    predict: {
      question: (now) => w.question(values[now.left], values[now.right], readInt(targetInput) ?? 0),
      answer: (next, now) => (next.found || next.left >= next.right ? null : next.left !== now.left ? next.left : next.right),
      explain: (next, now) => (next.left !== now.left ? w.left : w.right),
      cells: () => stage.row.querySelectorAll(':scope > [data-key]'),
    },
    lang,
  });

  // `byLearner`: the run on load does not count toward missions.
  const run = (byLearner = true) => {
    const target = readInt(targetInput) ?? 0;
    const frames = pairSumFrames(values, target, lang);
    const found = Boolean(frames.at(-1).found);
    const steps = found ? frames.length : frames.length - 1;
    const checks = bruteForcePairChecks(values, target);
    setStatus(compare, w.compare(steps, checks));
    player.load(frames, pairSumCode);
    if (byLearner) emit(root, { op: 'run', found, steps, checks });
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'run') run();
    if (op === 'use') {
      const list = readList(listInput, { min: -999, max: 999 });
      if (!list || list.length < 2) {
        setStatus(compare, c.badList(2, 20, -999, 999), { error: true, kept: c.kept });
        return;
      }
      // Two pointers relies on sorted order, so sort first.
      values = [...list].sort((a, b) => a - b);
      run();
    }
  });

  run(false);
}

/* ---------- Pattern: fixed-size sliding window ---------- */

const WINDOW_UI = {
  en: {
    k: 'Window size k', run: 'Slide', list: 'Your list', use: 'Use list', placeholder: 'e.g. 4 2 7 1 8 3',
    keyInside: 'inside the window', keyEntered: 'just entered', keyWindow: 'the window',
    question: (s, e) => `The window covers ${s}..${e}. Which value enters next?`,
    explain: (e, left) => `The window slides one to the right: add a[${e}], drop a[${left}].`,
    compare: (k, total, brute) => `Sliding window: ${k} additions for the first window, then 2 per slide (${total} in total). Recomputing every window would make ${brute}.`,
    badK: (n) => `Choose k between 1 and ${n}.`,
  },
  bn: {
    k: 'উইন্ডোর মাপ k', run: 'সরাও', list: 'তোমার তালিকা', use: 'এই তালিকা নাও', placeholder: 'যেমন 4 2 7 1 8 3',
    keyInside: 'উইন্ডোর ভেতরে', keyEntered: 'এইমাত্র ঢুকেছে', keyWindow: 'উইন্ডো',
    question: (s, e) => `উইন্ডো এখন ${s}..${e} জুড়ে। এরপর কোন মানটা ঢুকবে?`,
    explain: (e, left) => `উইন্ডো এক ঘর ডানে সরে: a[${e}] যোগ হয়, a[${left}] বাদ যায়।`,
    compare: (k, total, brute) => `স্লাইডিং উইন্ডো: প্রথম উইন্ডোতে ${k}টি যোগ, তারপর প্রতিবার সরাতে 2টি (মোট ${total})। প্রতিটি উইন্ডো নতুন করে যোগ করলে লাগত ${brute}টি।`,
    badK: (n) => `k বেছে নাও 1 থেকে ${n}-এর মধ্যে।`,
  },
};

function mountSlidingWindow(root, { lang = 'en' } = {}) {
  const w = WINDOW_UI[lang] ?? WINDOW_UI.en;
  const c = COMMON[lang] ?? COMMON.en;
  let values = [2, 1, 5, 1, 3, 2, 9, 4];

  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.k} <input class="demo-input" type="number" value="3" min="1" max="20" data-field="k" /></label>
      <button type="button" class="demo-button" data-op="run">${w.run}</button>
      <div class="demo-list-row">
  <label>${w.list} <input class="demo-input demo-input-wide" type="text" placeholder="${w.placeholder}" data-field="list" /></label>
  <button type="button" class="demo-button" data-op="use">${w.use}</button>
      </div>
    </div>
    ${motionStageHtml('sw-row')}
    ${legend([['moved', w.keyInside], ['hit', w.keyEntered], ['range', w.keyWindow]], lang)}
    <p class="bs-compare sw-compare" aria-live="polite"></p>
  `;

  const stage = motionRow(root.querySelector('.motion-row'));
  const compare = root.querySelector('.sw-compare');
  const kInput = root.querySelector('[data-field="k"]');
  const listInput = root.querySelector('[data-field="list"]');

  // Teal = inside the window; gold = the value that just entered.
  // The window is one frame that slides right; start and end glide with it.
  const player = createPlayer(root, ({ start, end, line }) => {
    stage.update(
      values.map((value, i) => {
        const inside = i >= start && i <= end;
        const entering = i === end && line !== 0 && line !== 4;
        return { key: `i${i}`, className: `array-cell ${entering ? 'is-hit' : inside ? 'is-moved' : ''}`, html: cellHtml(value, i) };
      }),
      { pointers: { start, end }, range: end >= start ? [start, end] : null },
    );
  }, {
    // Predict: which value enters the window next?
    predict: {
      question: (now) => w.question(now.start, now.end),
      answer: (next, now) => (next.line === 4 || next.end === now.end ? null : next.end),
      explain: (next) => w.explain(next.end, next.start - 1),
      cells: () => stage.row.querySelectorAll(':scope > [data-key]'),
    },
    lang,
  });

  // `byLearner`: the run on load does not count toward missions.
  const run = (byLearner = true) => {
    const k = readInt(kInput) ?? 0;
    const frames = windowSumFrames(values, k, lang);
    const slides = Math.max(0, values.length - k);
    const validK = k >= 1 && k <= values.length;
    const adds = k + 2 * slides;
    const brute = bruteForceWindowAdds(values.length, k);
    setStatus(compare, validK ? w.compare(k, adds, brute) : w.badK(values.length), { error: !validK, keptPrevious: false });
    player.load(frames, windowSumCode);
    if (byLearner) emit(root, { op: 'slide', valid: validK, k, n: values.length, adds, brute });
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'run') run();
    if (op === 'use') {
      const list = readList(listInput, { min: -999, max: 999 });
      if (!list) {
        setStatus(compare, c.badList(1, 20, -999, 999), { error: true, kept: c.kept });
        return;
      }
      values = list;
      run();
    }
  });

  run(false);
}

/* ---------- Pattern: fast and slow pointers on a linked list ---------- */

const FAST_SLOW_UI = {
  en: {
    nodes: 'Nodes', points: 'Last node points to', run: 'Run',
    keyHit: 'where slow and fast are', keyFound: 'where they meet', keyGap: 'the loop back',
    noLoop: 'nothing (no loop)', node: (i, name) => `node ${i} (${name})`,
    question: (f) => `Fast is on node ${f}. Where does it land after two steps?`,
    explain: (from, to, round) => `Fast follows two next pointers from node ${from} and lands on node ${to}${round ? ', going round the loop' : ''}.`,
    status: (loopTo, n, steps) => `${loopTo >= 0 ? `Node ${n - 1} points back to node ${loopTo}. ` : ''}Fast and slow: ${steps} step${steps === 1 ? '' : 's'}, two pointers of memory. A "visited" set would remember up to ${n} nodes.`,
  },
  bn: {
    nodes: 'নোড', points: 'শেষ নোড পয়েন্ট করে', run: 'চালাও',
    keyHit: 'slow আর fast যেখানে আছে', keyFound: 'যেখানে দুজন মেলে', keyGap: 'পেছনে ফেরার লুপ',
    noLoop: 'কিছুই না (লুপ নেই)', node: (i, name) => `নোড ${i} (${name})`,
    question: (f) => `fast এখন নোড ${f}-এ। দুই ধাপ পরে কোথায় গিয়ে নামবে?`,
    explain: (from, to, round) => `fast নোড ${from} থেকে দুটো next পয়েন্টার ধরে ${round ? 'লুপ ঘুরে ' : ''}নোড ${to}-এ নামে।`,
    status: (loopTo, n, steps) => `${loopTo >= 0 ? `নোড ${n - 1} আবার নোড ${loopTo}-এর দিকে পয়েন্ট করে। ` : ''}ফাস্ট ও স্লো: ${steps} ধাপ, মেমরি লাগে মাত্র দুটো পয়েন্টার। একটা "visited" সেট রাখলে ${n}টি পর্যন্ত নোড মনে রাখতে হতো।`,
  },
};

function mountFastSlow(root, { lang = 'en' } = {}) {
  const w = FAST_SLOW_UI[lang] ?? FAST_SLOW_UI.en;
  const names = 'ABCDEFGHIJKL';
  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.nodes} <input class="demo-input" type="number" value="8" min="2" max="12" data-field="n" /></label>
      <label>${w.points} <select class="demo-input demo-select" data-field="loop"></select></label>
      <button type="button" class="demo-button" data-op="run">${w.run}</button>
    </div>
    ${motionStageHtml('fs-row')}
    ${legend([['hit', w.keyHit], ['found', w.keyFound], ['gap', w.keyGap]], lang)}
    <p class="bs-compare fs-compare" aria-live="polite"></p>
  `;

  const stage = motionRow(root.querySelector('.motion-row'));
  const loop = document.createElement('span');
  loop.className = 'fs-loop';
  loop.setAttribute('aria-hidden', 'true');
  const compare = root.querySelector('.fs-compare');
  const nInput = root.querySelector('[data-field="n"]');
  const loopSelect = root.querySelector('[data-field="loop"]');
  let n = 8;
  let loopTo = 3;

  // Options: "nothing" (a plain list) or any node before it, which makes a loop.
  const fillOptions = () => {
    loopSelect.innerHTML = [`<option value="-1">${w.noLoop}</option>`]
      .concat(Array.from({ length: n }, (_, i) => `<option value="${i}">${w.node(i, names[i])}</option>`))
      .join('');
    loopSelect.value = String(Math.min(loopTo, n - 1));
  };

  // Slow steps one cell and fast jumps two: watch fast lap slow on a loop.
  const player = createPlayer(root, ({ slow, fast, met }) => {
    stage.update(
      Array.from({ length: n }, (_, i) => ({
        key: `i${i}`,
        className: `array-cell ${met && i === slow ? 'is-found' : i === slow || i === fast ? 'is-hit' : ''}`,
        html: cellHtml(names[i], i),
      })),
      { pointers: { slow, fast: fast >= 0 ? fast : null } },
    );
    // The loop is drawn as a dashed U from the last node back to its target.
    if (loopTo >= 0) {
      loop.style.cssText = `--from:${loopTo};--to:${n - 1}`;
      stage.row.append(loop);
    } else loop.remove();
  }, {
    // Predict: where does fast land after its two steps?
    predict: {
      question: (now) => w.question(now.fast),
      answer: (next) => (next.fast >= 0 && next.line !== 5 ? next.fast : null),
      explain: (next, now) => w.explain(now.fast, next.fast, now.fast + 2 > n - 1 && loopTo >= 0),
      cells: () => stage.row.querySelectorAll(':scope > [data-key]'),
    },
    lang,
  });

  // `byLearner`: the run on load does not count toward missions.
  const run = (byLearner = true) => {
    n = Math.min(12, Math.max(2, readInt(nInput) ?? 8));
    nInput.value = n;
    loopTo = Number(loopSelect.value);
    if (!(loopTo < n)) loopTo = -1;
    const frames = fastSlowFrames(n, loopTo, lang);
    const steps = frames.at(-1).vars.steps;
    setStatus(compare, w.status(loopTo, n, steps));
    player.load(frames, fastSlowCode);
    if (byLearner) emit(root, { op: 'run', loop: loopTo >= 0, met: frames.at(-1).met, steps, n });
  };

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-op="run"]')) run();
  });
  nInput.addEventListener('change', () => {
    n = Math.min(12, Math.max(2, readInt(nInput) ?? 8));
    fillOptions();
  });

  fillOptions();
  run(false);
}

/* ---------- Pattern: prefix sums ---------- */

const PREFIX_UI = {
  en: {
    from: 'From l', to: 'to r', ask: 'Ask', list: 'Your list', use: 'Use list', placeholder: 'e.g. 3 -1 4 1 5',
    keyRead: 'being read', keyWritten: 'just written, or the range asked for', keyGap: 'not built yet',
    compare: (n, l, r) => `Prefix sums: ${n} additions once, then 1 subtraction per question. Adding a[${l}..${r}] directly takes ${r - l} addition${r - l === 1 ? '' : 's'} for this question alone.`,
    pick: (last) => `Pick 0 ≤ l ≤ r ≤ ${last}.`,
  },
  bn: {
    from: 'l থেকে', to: 'r পর্যন্ত', ask: 'জিজ্ঞেস করো', list: 'তোমার তালিকা', use: 'এই তালিকা নাও', placeholder: 'যেমন 3 -1 4 1 5',
    keyRead: 'যেটা পড়া হচ্ছে', keyWritten: 'এইমাত্র লেখা হলো, বা যে রেঞ্জ চাওয়া হয়েছে', keyGap: 'এখনও বানানো হয়নি',
    compare: (n, l, r) => `প্রিফিক্স সাম: একবারই ${n}টি যোগ, তারপর প্রতিটি প্রশ্নে 1টি বিয়োগ। a[${l}..${r}] সরাসরি যোগ করলে শুধু এই প্রশ্নের জন্যই লাগত ${r - l}টি যোগ।`,
    pick: (last) => `0 ≤ l ≤ r ≤ ${last} বেছে নাও।`,
  },
};

function mountPrefixSums(root, { lang = 'en' } = {}) {
  const w = PREFIX_UI[lang] ?? PREFIX_UI.en;
  const c = COMMON[lang] ?? COMMON.en;
  let values = [3, -1, 4, 1, 5, 9, 2, 6];
  root.innerHTML = `
    <div class="demo-controls">
      <label>${w.from} <input class="demo-input" type="number" value="2" min="0" data-field="l" /></label>
      <label>${w.to} <input class="demo-input" type="number" value="5" min="0" data-field="r" /></label>
      <button type="button" class="demo-button" data-op="run">${w.ask}</button>
      <div class="demo-list-row">
  <label>${w.list} <input class="demo-input demo-input-wide" type="text" placeholder="${w.placeholder}" data-field="list" /></label>
  <button type="button" class="demo-button" data-op="use">${w.use}</button>
      </div>
    </div>
    <div class="demo-stage">
      <p class="ps-label">a</p>
      ${motionRowHtml('ps-values')}
      <p class="ps-label">prefix</p>
      ${motionRowHtml('ps-prefix')}
    </div>
    ${legend([['hit', w.keyRead], ['moved', w.keyWritten], ['gap', w.keyGap]], lang)}
    <p class="bs-compare ps-compare" aria-live="polite"></p>
  `;

  const [valueStage, prefixStage] = [...root.querySelectorAll('.motion-row')].map(motionRow);
  const compare = root.querySelector('.ps-compare');
  const lInput = root.querySelector('[data-field="l"]');
  const rInput = root.querySelector('[data-field="r"]');
  const listInput = root.querySelector('[data-field="list"]');
  const cell = (value, j, state) => ({ key: `i${j}`, className: `array-cell ${state}`, html: cellHtml(value, j) });

  // Building: i walks the values while prefix[i+1] fills in. Asking: the range
  // a[l..r] is framed, and the two prefix entries that answer it are pointed at.
  const player = createPlayer(root, ({ prefix, i, query }) => {
    valueStage.update(
      values.map((value, j) => cell(value, j, query ? (j >= query.l && j <= query.r ? 'is-moved' : '') : j === i ? 'is-hit' : '')),
      { pointers: { i: query ? null : i }, range: query ? [query.l, query.r] : null },
    );
    prefixStage.update(
      Array.from({ length: values.length + 1 }, (_, j) => {
        if (j >= prefix.length) return cell('', j, 'is-gap');
        return cell(prefix[j], j, query ? (j === query.r + 1 || j === query.l ? 'is-hit' : '') : j === i + 1 ? 'is-moved' : j === i ? 'is-hit' : '');
      }),
      { pointers: query ? { l: query.l, 'r+1': query.r + 1 } : { 'i+1': i >= 0 ? i + 1 : null } },
    );
  }, { lang });

  // `byLearner`: the run on load does not count toward missions.
  const run = (byLearner = true) => {
    const l = readInt(lInput);
    const r = readInt(rInput);
    const valid = l !== null && r !== null && l >= 0 && l <= r && r < values.length;
    setStatus(compare, valid ? w.compare(values.length, l, r) : w.pick(values.length - 1), { error: !valid, keptPrevious: false });
    player.load(prefixSumFrames(values, l, r, lang), prefixSumCode);
    if (byLearner) emit(root, { op: 'ask', valid, l, r, n: values.length });
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'run') run();
    if (op === 'use') {
      const list = readList(listInput, { min: -99, max: 99, count: 12 });
      if (!list) {
        setStatus(compare, c.badList(1, 12, -99, 99), { error: true, kept: c.kept });
        return;
      }
      values = list;
      run();
    }
  });

  run(false);
}

export const demos = {
  'array-ops': {
    title: 'Insert, delete and read',
    intro: 'Change the array and count how many values move.',
    bn: { title: 'ইনসার্ট, ডিলিট আর পড়া', intro: 'অ্যারে বদলাও আর গুনে দেখো কয়টি মান সরে।' },
    mount: mountArray,
  },
  'linked-list': {
    title: 'Follow the pointers',
    intro: 'Insert at the head and at the tail, then search. Watch how far each operation walks.',
    bn: { title: 'পয়েন্টার ধরে এগোও', intro: 'head আর tail-এ যোগ করো, তারপর খোঁজো। দেখো প্রতিটি কাজে কতদূর হাঁটতে হয়।' },
    mount: mountLinkedList,
  },
  'stack-queue': {
    title: 'Last in or first in?',
    intro: 'Push and enqueue the same values, then remove one from each side.',
    bn: { title: 'শেষে ঢুকে আগে, নাকি আগে ঢুকে আগে?', intro: 'একই মান push আর enqueue করো, তারপর দুই দিক থেকে একটা করে সরাও।' },
    mount: mountStackQueue,
  },
  'hash-table': {
    title: 'Hash a key into a bucket',
    intro: 'Type a key to see the hash arithmetic and the bucket it lands in.',
    bn: { title: 'কী-কে বাকেটে ফেলো', intro: 'একটা কী লেখো; হ্যাশের হিসাব আর কোন বাকেটে পড়ল দেখো।' },
    mount: mountHashTable,
  },
  bst: {
    title: 'Build and search a tree',
    intro: 'Insert values and search for them. Then try sorted inserts to see the tree degrade.',
    bn: { title: 'ট্রি বানাও আর খোঁজো', intro: 'মান যোগ করো আর খোঁজো। তারপর সাজানো ক্রমে যোগ করে দেখো ট্রি কীভাবে বেঁকে যায়।' },
    mount: mountBst,
  },
  growth: {
    title: 'Growth rates side by side',
    intro: 'Change n and compare how many steps each shape needs.',
    bn: { title: 'বৃদ্ধির হার পাশাপাশি', intro: 'n বদলাও আর তুলনা করো কোন ধরনে কত ধাপ লাগে।' },
    mount: mountGrowth,
  },
  'binary-search': {
    title: 'Halve the search range',
    intro: 'Step through each comparison. Grey values are ruled out.',
    bn: { title: 'খোঁজার পরিসর অর্ধেক করো', intro: 'প্রতিটি তুলনা ধাপে ধাপে দেখো। ধূসর মানগুলো বাদ পড়েছে।' },
    mount: mountBinarySearch,
  },
  sorting: {
    title: 'Watch a sort run',
    intro: 'Pick an algorithm and step through every compare and swap. Highlighted bars are being compared.',
    bn: { title: 'সর্ট চলতে দেখো', intro: 'একটা অ্যালগরিদম বেছে নাও, প্রতিটি তুলনা আর অদলবদল ধাপে ধাপে দেখো।' },
    mount: mountSorting,
  },
  'grid-traversal': {
    title: 'Breadth-first vs depth-first',
    intro: 'Same grid, same start and goal. The only change is a queue versus a stack.',
    bn: { title: 'ব্রেডথ-ফার্স্ট বনাম ডেপথ-ফার্স্ট', intro: 'একই গ্রিড, একই শুরু আর লক্ষ্য। পার্থক্য শুধু কিউ বনাম স্ট্যাক।' },
    mount: mountGridTraversal,
  },
  'two-pointers': {
    title: 'Squeeze from both ends',
    intro: 'Watch L and R close in on the target. Every grey value is ruled out for good.',
    bn: { title: 'দুই দিক থেকে চেপে আনো', intro: 'দেখো L আর R কীভাবে লক্ষ্যের দিকে এগোয়। প্রতিটি ধূসর মান চিরতরে বাদ।' },
    mount: mountTwoPointers,
  },
  'sliding-window': {
    title: 'Slide the window',
    intro: 'Each slide adds the value that enters and subtracts the one that leaves.',
    bn: { title: 'উইন্ডো সরাও', intro: 'প্রতিবার সরালে ঢোকা মানটি যোগ হয় আর বেরোনো মানটি বাদ যায়।' },
    mount: mountSlidingWindow,
  },
  'fast-slow': {
    title: 'Fast and slow pointers',
    intro: 'Slow steps one node, fast steps two. On a loop they must meet; on a plain list fast falls off the end.',
    bn: { title: 'ফাস্ট ও স্লো পয়েন্টার', intro: 'স্লো এক ঘর যায়, ফাস্ট দুই ঘর। লুপ থাকলে তারা মিলবেই; না থাকলে ফাস্ট শেষ মাথা পেরিয়ে যায়।' },
    mount: mountFastSlow,
  },
  'prefix-sums': {
    title: 'Build once, ask in O(1)',
    intro: 'Build the running totals, then answer a range sum with one subtraction.',
    bn: { title: 'একবার বানাও, O(1)-এ জিজ্ঞেস করো', intro: 'চলতি যোগফল বানাও, তারপর এক বিয়োগে রেঞ্জের যোগফল বের করো।' },
    mount: mountPrefixSums,
  },
};
