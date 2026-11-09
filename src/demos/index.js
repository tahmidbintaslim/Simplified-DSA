import { escapeHtml } from '../utils/markdown.js';
import {
  binarySearchCode,
  binarySearchFrames,
  bruteForcePairChecks,
  bruteForceWindowAdds,
  bstInOrder,
  bstInsert,
  bstLayout,
  bstSearchPath,
  growthRates,
  gridTraversalFrames,
  pairSumCode,
  pairSumFrames,
  simpleHash,
  sortingAlgorithms,
  traversalCode,
  windowSumCode,
  windowSumFrames,
} from './algorithms.js';
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

// "5, 2 9" → [5, 2, 9]: whole numbers in range, at most `max` of them; null when empty or invalid.
const readList = (input, { min = 1, max = 99, count = 20 } = {}) => {
  const values = input.value.split(/[\s,]+/).filter(Boolean).map(Number);
  const valid = values.length > 0 && values.length <= count && values.every((v) => Number.isInteger(v) && v >= min && v <= max);
  return valid ? values : null;
};

/* ---------- Arrays: insert and delete shift values ---------- */

function mountArray(root) {
  let values = [4, 8, 15, 16, 42];
  const MAX = 10;

  root.innerHTML = `
    <div class="demo-controls">
      <label>Value <input class="demo-input" type="number" value="23" data-field="value" /></label>
      <label>Index <input class="demo-input" type="number" value="2" min="0" data-field="index" /></label>
      <button type="button" class="demo-button" data-op="read">Read [i]</button>
      <button type="button" class="demo-button" data-op="insert">Insert at i</button>
      <button type="button" class="demo-button" data-op="delete">Delete at i</button>
      <button type="button" class="demo-button" data-op="push">Append</button>
    </div>
    <div class="demo-stage"><div class="array-row"></div></div>
    <p class="demo-caption" aria-live="polite">Pick an operation. Watch how many values have to move.</p>
  `;

  const row = root.querySelector('.array-row');
  const caption = root.querySelector('.demo-caption');
  const valueInput = root.querySelector('[data-field="value"]');
  const indexInput = root.querySelector('[data-field="index"]');

  // `marks` maps an index to a CSS state: "hit" for the touched cell, "moved" for shifted ones.
  const draw = (marks = {}) => {
    row.innerHTML = values
      .map(
        (value, i) => `
        <div class="array-cell ${marks[i] ?? ''}">
          <span class="array-value">${value}</span>
          <span class="array-index">${i}</span>
        </div>`,
      )
      .join('');
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    const value = readInt(valueInput) ?? 0;
    const index = readInt(indexInput);
    const marks = {};
    const range = (from, to) => {
      for (let i = from; i < to; i++) marks[i] = 'is-moved';
    };

    if (op === 'push') {
      if (values.length >= MAX) return (caption.textContent = `The demo holds at most ${MAX} values. Delete one first.`);
      values.push(value);
      marks[values.length - 1] = 'is-hit';
      caption.textContent = `Appended ${value} at index ${values.length - 1}. Nothing moved: O(1).`;
    } else if (index === null || index < 0 || index > values.length - (op === 'insert' ? 0 : 1)) {
      caption.textContent = `Index must be between 0 and ${values.length - (op === 'insert' ? 0 : 1)}.`;
    } else if (op === 'read') {
      marks[index] = 'is-hit';
      caption.textContent = `array[${index}] is ${values[index]}. One address calculation, no scan: O(1).`;
    } else if (op === 'insert') {
      if (values.length >= MAX) return (caption.textContent = `The demo holds at most ${MAX} values. Delete one first.`);
      values.splice(index, 0, value);
      range(index + 1, values.length);
      marks[index] = 'is-hit';
      const moved = values.length - 1 - index;
      caption.textContent = `Inserted ${value} at index ${index}. ${moved} value${moved === 1 ? '' : 's'} shifted right: O(n).`;
    } else {
      const [removed] = values.splice(index, 1);
      range(index, values.length);
      const moved = values.length - index;
      caption.textContent = `Deleted ${removed}. ${moved} value${moved === 1 ? '' : 's'} shifted left to close the gap: O(n).`;
    }
    draw(marks);
  });

  draw();
}

/* ---------- Linked lists: walk the pointers ---------- */

function mountLinkedList(root) {
  let values = [7, 3, 9];
  const MAX = 8;

  root.innerHTML = `
    <div class="demo-controls">
      <label>Value <input class="demo-input" type="number" value="5" data-field="value" /></label>
      <button type="button" class="demo-button" data-op="head">Insert at head</button>
      <button type="button" class="demo-button" data-op="tail">Insert at tail</button>
      <button type="button" class="demo-button" data-op="find">Find</button>
      <button type="button" class="demo-button" data-op="remove">Remove</button>
    </div>
    <div class="demo-stage"><div class="list-row"></div></div>
    <p class="demo-caption" aria-live="polite">Each node holds a value and a pointer to the next node.</p>
  `;

  const row = root.querySelector('.list-row');
  const caption = root.querySelector('.demo-caption');
  const input = root.querySelector('[data-field="value"]');

  // `walked` is how many nodes were visited; `hit` is the index the operation landed on.
  const draw = ({ walked = 0, hit = -1 } = {}) => {
    const nodes = values.map((value, i) => {
      const state = i === hit ? 'is-hit' : i < walked ? 'is-walked' : '';
      return `
        <div class="list-node ${state}">
          ${i === 0 ? '<span class="list-label">head</span>' : ''}
          <span class="list-value">${value}</span>
          <span class="list-next" aria-hidden="true">next</span>
        </div>
        <span class="list-arrow" aria-hidden="true">→</span>`;
    });
    row.innerHTML = `${nodes.join('')}<span class="list-null">null</span>`;
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    const value = readInt(input) ?? 0;
    const full = values.length >= MAX && (op === 'head' || op === 'tail');
    if (full) return (caption.textContent = `The demo holds at most ${MAX} nodes. Remove one first.`);

    if (op === 'head') {
      values.unshift(value);
      draw({ hit: 0 });
      caption.textContent = `New node ${value} points at the old head. Only one pointer changed: O(1). Nothing shifted.`;
    } else if (op === 'tail') {
      const walked = values.length;
      values.push(value);
      draw({ walked, hit: values.length - 1 });
      caption.textContent = `Walked ${walked} node${walked === 1 ? '' : 's'} to find the end, then linked ${value}: O(n). (Keeping a tail pointer makes this O(1).)`;
    } else {
      const index = values.indexOf(value);
      if (index === -1) {
        draw({ walked: values.length });
        caption.textContent = `Walked all ${values.length} nodes: ${value} is not in the list. Search is O(n), there is no index to jump to.`;
        return;
      }
      if (op === 'find') {
        draw({ walked: index, hit: index });
        caption.textContent = `Found ${value} after walking ${index + 1} node${index ? 's' : ''}. A list cannot jump to position ${index}: O(n).`;
      } else {
        values.splice(index, 1);
        draw({ walked: index });
        caption.textContent = `Walked to ${value}, then pointed the previous node past it. Unlinking is O(1); finding it was O(n).`;
      }
    }
  });

  draw();
}

/* ---------- Stacks and queues: which end comes out ---------- */

function mountStackQueue(root) {
  const stack = [3, 8];
  const queue = [3, 8];
  let next = 12;
  const MAX = 8;

  root.innerHTML = `
    <div class="demo-columns">
      <div class="demo-column">
        <h3>Stack (LIFO)</h3>
        <div class="demo-controls">
          <button type="button" class="demo-button" data-op="push">Push</button>
          <button type="button" class="demo-button" data-op="pop">Pop</button>
        </div>
        <div class="demo-stage"><div class="stack-view"></div></div>
      </div>
      <div class="demo-column">
        <h3>Queue (FIFO)</h3>
        <div class="demo-controls">
          <button type="button" class="demo-button" data-op="enqueue">Enqueue</button>
          <button type="button" class="demo-button" data-op="dequeue">Dequeue</button>
        </div>
        <div class="demo-stage"><div class="queue-view"></div></div>
      </div>
    </div>
    <p class="demo-caption" aria-live="polite">Add the same values to both. Then take one out of each and compare.</p>
  `;

  const stackView = root.querySelector('.stack-view');
  const queueView = root.querySelector('.queue-view');
  const caption = root.querySelector('.demo-caption');

  const draw = (hit = {}) => {
    // Draw the stack top-first so the top sits at the top of the picture.
    stackView.innerHTML =
      stack
        .map((value, i) => `<div class="stack-item ${hit.stack === i ? 'is-hit' : ''}">${value}${i === stack.length - 1 ? '<small>top</small>' : ''}</div>`)
        .reverse()
        .join('') || '<p class="demo-empty">empty</p>';
    queueView.innerHTML =
      queue
        .map(
          (value, i) =>
            `<div class="queue-item ${hit.queue === i ? 'is-hit' : ''}">${value}${i === 0 ? '<small>front</small>' : ''}${i === queue.length - 1 ? '<small>back</small>' : ''}</div>`,
        )
        .join('') || '<p class="demo-empty">empty</p>';
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    if (op === 'push' || op === 'enqueue') {
      const list = op === 'push' ? stack : queue;
      if (list.length >= MAX) return (caption.textContent = `The demo holds at most ${MAX} values.`);
      const value = next++;
      list.push(value);
      draw(op === 'push' ? { stack: stack.length - 1 } : { queue: queue.length - 1 });
      caption.textContent = op === 'push' ? `Pushed ${value} on top of the stack. O(1).` : `Enqueued ${value} at the back of the queue. O(1).`;
      return;
    }
    const list = op === 'pop' ? stack : queue;
    if (!list.length) return (caption.textContent = `The ${op === 'pop' ? 'stack' : 'queue'} is empty. Nothing to remove.`);
    const value = op === 'pop' ? stack.pop() : queue.shift();
    draw();
    caption.textContent =
      op === 'pop'
        ? `Popped ${value}: the newest value leaves first (last in, first out).`
        : `Dequeued ${value}: the oldest value leaves first (first in, first out).`;
  });

  draw();
}

/* ---------- Hash tables: key → hash → bucket ---------- */

function mountHashTable(root) {
  const BUCKETS = 7;
  const buckets = Array.from({ length: BUCKETS }, () => []);
  for (const key of ['cat', 'dog', 'owl']) buckets[simpleHash(key, BUCKETS).index].push(key);

  root.innerHTML = `
    <div class="demo-controls">
      <label>Key <input class="demo-input demo-input-wide" type="text" value="act" maxlength="12" data-field="key" /></label>
      <button type="button" class="demo-button" data-op="insert">Insert</button>
      <button type="button" class="demo-button" data-op="find">Look up</button>
      <button type="button" class="demo-button" data-op="remove">Remove</button>
    </div>
    <pre class="hash-math" aria-hidden="true"></pre>
    <div class="demo-stage"><div class="hash-buckets"></div></div>
    <p class="demo-caption" aria-live="polite">Try "act": it has the same letters as "cat", so the same hash. That is a collision.</p>
  `;

  const view = root.querySelector('.hash-buckets');
  const math = root.querySelector('.hash-math');
  const caption = root.querySelector('.demo-caption');
  const input = root.querySelector('[data-field="key"]');

  const draw = (hitBucket = -1, hitKey = null) => {
    const count = buckets.reduce((total, chain) => total + chain.length, 0);
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
        .join('') + `<p class="hash-load">Load factor: ${count} keys / ${BUCKETS} buckets = ${(count / BUCKETS).toFixed(2)}</p>`;
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;
    const key = input.value.trim();
    if (!key) return (caption.textContent = 'Type a key first.');

    const { codes, sum, index } = simpleHash(key, BUCKETS);
    math.textContent = `${[...key].map((ch, i) => `${ch}(${codes[i]})`).join(' + ')} = ${sum}\n${sum} % ${BUCKETS} = ${index}  →  bucket ${index}`;
    const chain = buckets[index];
    const position = chain.indexOf(key);
    const safeKey = `"${key}"`;

    if (op === 'insert') {
      if (position !== -1) {
        caption.textContent = `${safeKey} is already in bucket ${index}. Keys are unique.`;
      } else if (chain.length >= 4) {
        caption.textContent = `Bucket ${index} is full in this demo. Real tables grow and rehash when the load factor gets high.`;
      } else {
        chain.push(key);
        caption.textContent = chain.length > 1
          ? `Collision: bucket ${index} already holds ${chain.length - 1} key${chain.length > 2 ? 's' : ''}. ${safeKey} joins the chain.`
          : `${safeKey} goes straight into empty bucket ${index}. O(1) on average.`;
      }
    } else if (op === 'find') {
      caption.textContent = position === -1
        ? `Bucket ${index} does not hold ${safeKey}, so it is not in the table. Only one bucket was checked.`
        : `Jumped to bucket ${index} and found ${safeKey} after checking ${position + 1} key${position ? 's' : ''} in its chain.`;
    } else if (position === -1) {
      caption.textContent = `${safeKey} is not in bucket ${index}. Nothing to remove.`;
    } else {
      chain.splice(position, 1);
      caption.textContent = `Removed ${safeKey} from bucket ${index}.`;
    }
    draw(index, op === 'remove' ? null : key);
  });

  draw();
}

/* ---------- Binary search trees: left is smaller, right is larger ---------- */

function mountBst(root) {
  let tree = null;
  const reset = (values) => {
    tree = null;
    for (const value of values) tree = bstInsert(tree, value);
  };
  reset([50, 30, 70, 20, 40, 60, 80]);

  root.innerHTML = `
    <div class="demo-controls">
      <label>Value <input class="demo-input" type="number" value="45" min="0" max="999" data-field="value" /></label>
      <button type="button" class="demo-button" data-op="insert">Insert</button>
      <button type="button" class="demo-button" data-op="search">Search</button>
      <button type="button" class="demo-button" data-op="random">Random tree</button>
      <button type="button" class="demo-button" data-op="sorted">Insert sorted 1-7</button>
    </div>
    <div class="demo-stage"><svg class="bst-svg" role="img" aria-label="Binary search tree"></svg></div>
    <p class="bst-inorder"></p>
    <p class="demo-caption" aria-live="polite">Every value smaller than a node lives on its left, every larger value on its right.</p>
  `;

  const svg = root.querySelector('.bst-svg');
  const inorder = root.querySelector('.bst-inorder');
  const caption = root.querySelector('.demo-caption');
  const input = root.querySelector('[data-field="value"]');

  const draw = (path = [], hit = null) => {
    const { nodes, edges } = bstLayout(tree);
    const gapX = 46;
    const gapY = 62;
    const depth = Math.max(0, ...nodes.map((node) => node.y));
    const width = Math.max(1, nodes.length) * gapX + 20;
    const height = (depth + 1) * gapY + 10;
    const at = Object.fromEntries(nodes.map((node) => [node.value, { x: node.x * gapX + 33, y: node.y * gapY + 30 }]));

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = `${width}px`;
    svg.innerHTML = [
      ...edges.map(([a, b]) => {
        const onPath = path.includes(a) && path.includes(b);
        return `<line class="bst-edge ${onPath ? 'is-path' : ''}" x1="${at[a].x}" y1="${at[a].y}" x2="${at[b].x}" y2="${at[b].y}" />`;
      }),
      ...nodes.map((node) => {
        const state = node.value === hit ? 'is-hit' : path.includes(node.value) ? 'is-path' : '';
        const { x, y } = at[node.value];
        return `<g class="bst-node ${state}"><circle cx="${x}" cy="${y}" r="18" /><text x="${x}" y="${y}">${node.value}</text></g>`;
      }),
    ].join('');
    inorder.textContent = `In-order walk (left, node, right): ${bstInOrder(tree).join(', ') || 'empty'}. Height: ${nodes.length ? depth + 1 : 0}.`;
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (!op) return;

    if (op === 'random') {
      reset(randomValues(9, 1, 99));
      draw();
      caption.textContent = 'A random insert order usually gives a bushy tree with a small height.';
      return;
    }
    if (op === 'sorted') {
      reset([1, 2, 3, 4, 5, 6, 7]);
      draw();
      caption.textContent = 'Sorted inserts make every node go right. The tree became a linked list: search is now O(n).';
      return;
    }

    const value = readInt(input);
    if (value === null || value < 0 || value > 999) return (caption.textContent = 'Use a whole number from 0 to 999.');
    const { path, found } = bstSearchPath(tree, value);
    const comparisons = path.length;

    if (op === 'insert') {
      if (found) {
        draw(path, value);
        caption.textContent = `${value} is already in the tree.`;
        return;
      }
      if (bstInOrder(tree).length >= 15) return (caption.textContent = 'The demo holds at most 15 nodes. Try "Random tree".');
      tree = bstInsert(tree, value);
      draw([...path, value], value);
      caption.textContent = `Compared with ${comparisons} node${comparisons === 1 ? '' : 's'} (${path.join(' → ') || 'empty tree'}), then attached ${value} as a leaf.`;
    } else {
      draw(path, found ? value : null);
      caption.textContent = found
        ? `Found ${value} after ${comparisons} comparison${comparisons === 1 ? '' : 's'}: ${path.join(' → ')}.`
        : `Followed ${path.join(' → ') || 'nothing'} and fell off the tree: ${value} is not here.`;
    }
  });

  draw();
}

/* ---------- Big O: how work grows with n ---------- */

function mountGrowth(root) {
  root.innerHTML = `
    <div class="demo-controls">
      <label class="demo-slider">Input size n = <output data-field="n-out">16</output>
        <input type="range" min="1" max="1000" value="16" data-field="n" />
      </label>
    </div>
    <div class="demo-stage"><div class="growth-bars"></div></div>
    <p class="demo-caption">Drag the slider. Bars are drawn to the same scale, so the slow shapes take over fast.</p>
  `;

  const slider = root.querySelector('[data-field="n"]');
  const output = root.querySelector('[data-field="n-out"]');
  const bars = root.querySelector('.growth-bars');

  const draw = () => {
    const n = Number(slider.value);
    output.textContent = n;
    const rows = growthRates.map((rate) => ({ ...rate, value: rate.ops(n) }));
    const max = Math.max(...rows.map((row) => row.value));
    bars.innerHTML = rows
      .map((row) => {
        // At 1 µs per step, how long would this take?
        const ms = row.value / 1000;
        const time = ms < 1 ? `${formatNumber(row.value)} µs` : ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`;
        return `
          <div class="growth-row">
            <span class="growth-label">${row.label}</span>
            <div class="growth-track"><div class="growth-bar growth-${row.id}" style="width: ${Math.max(0.6, (row.value / max) * 100)}%"></div></div>
            <span class="growth-value">${formatNumber(row.value)} steps · ${time}</span>
          </div>`;
      })
      .join('');
  };

  slider.addEventListener('input', draw);
  draw();
}

/* ---------- Binary search: halve the range each step ---------- */

function mountBinarySearch(root) {
  let values = [];
  root.innerHTML = `
    <div class="demo-controls">
      <label>Target <input class="demo-input" type="number" value="0" data-field="target" /></label>
      <button type="button" class="demo-button" data-op="search">Search</button>
      <button type="button" class="demo-button" data-op="shuffle">New list</button>
      <label>Your list <input class="demo-input demo-input-wide" type="text" placeholder="e.g. 4 8 15 16 23 42" data-field="list" /></label>
      <button type="button" class="demo-button" data-op="use">Use list</button>
    </div>
    <div class="demo-stage"><div class="array-row bs-row"></div></div>
    <p class="bs-compare"></p>
  `;

  const row = root.querySelector('.bs-row');
  const compare = root.querySelector('.bs-compare');
  const input = root.querySelector('[data-field="target"]');
  const listInput = root.querySelector('[data-field="list"]');

  // Pointer names sit under the cells they point at, like the hand-drawn traces in the lessons.
  const player = createPlayer(root, ({ lo, hi, mid, found }) => {
    row.innerHTML = values
      .map((value, i) => {
        const state = i === found ? 'is-hit' : i === mid ? 'is-mid' : i < lo || i > hi ? 'is-out' : '';
        const tags = [i === lo && 'lo', i === mid && 'mid', i === hi && 'hi'].filter(Boolean).join(' ');
        const pointer = tags ? `<span class="cell-pointer">${tags}</span>` : '';
        return `<div class="array-cell ${state}"><span class="array-value">${value}</span><span class="array-index">${i}</span>${pointer}</div>`;
      })
      .join('');
  });

  const run = () => {
    const target = readInt(input) ?? 0;
    const frames = binarySearchFrames(values, target);
    const linear = values.indexOf(target);
    compare.textContent = `Binary search: ${frames.length - (frames.at(-1).found === -1 ? 1 : 0)} checks. Linear search would check ${linear === -1 ? values.length : linear + 1} of ${values.length} values.`;
    player.load(frames, binarySearchCode);
  };

  const shuffle = () => {
    // Distinct sorted values: binary search needs sorted input.
    values = [...new Set(randomValues(40, 1, 99))].slice(0, 16).sort((a, b) => a - b);
    input.value = values[randomInt(0, values.length - 1)];
    run();
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'search') run();
    if (op === 'shuffle') shuffle();
    if (op === 'use') {
      const list = readList(listInput, { min: -999, max: 999 });
      if (!list) {
        compare.textContent = 'Type 1 to 20 whole numbers between -999 and 999, separated by spaces or commas.';
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

function mountSorting(root) {
  let values = [];
  root.innerHTML = `
    <div class="demo-controls">
      <label>Algorithm
        <select class="demo-input demo-input-wide" data-field="algorithm">
          ${Object.entries(sortingAlgorithms).map(([id, algo]) => `<option value="${id}">${algo.label}</option>`).join('')}
        </select>
      </label>
      <label>Size
        <select class="demo-input" data-field="size">
          <option>8</option><option selected>12</option><option>20</option>
        </select>
      </label>
      <button type="button" class="demo-button" data-op="shuffle">Shuffle</button>
      <button type="button" class="demo-button" data-op="nearly">Nearly sorted</button>
      <button type="button" class="demo-button" data-op="reversed">Reversed</button>
      <label>Your values <input class="demo-input demo-input-wide" type="text" placeholder="e.g. 5 2 9 1" data-field="list" /></label>
      <button type="button" class="demo-button" data-op="use">Use values</button>
    </div>
    <div class="demo-stage"><div class="sort-bars"></div></div>
    <p class="sort-meta"></p>
  `;

  const bars = root.querySelector('.sort-bars');
  const meta = root.querySelector('.sort-meta');
  const algorithmSelect = root.querySelector('[data-field="algorithm"]');
  const sizeSelect = root.querySelector('[data-field="size"]');
  const listInput = root.querySelector('[data-field="list"]');

  const player = createPlayer(root, ({ values: frameValues, active, sorted }) => {
    bars.innerHTML = frameValues
      .map((value, i) => {
        const state = active.includes(i) ? 'is-active' : sorted.includes(i) ? 'is-sorted' : '';
        return `<div class="sort-bar ${state}" style="height: ${value}%"><span>${value}</span></div>`;
      })
      .join('');
  });

  const load = () => {
    const algorithm = sortingAlgorithms[algorithmSelect.value];
    const frames = algorithm.frames(values);
    meta.textContent = `${algorithm.label} · ${algorithm.big} · ${frames.length} recorded steps for ${values.length} values.`;
    player.load(frames, algorithm.code);
  };

  const shuffle = (shape = 'random') => {
    const size = Number(sizeSelect.value);
    values = randomValues(size, 8, 99);
    if (shape === 'reversed') values.sort((a, b) => b - a);
    if (shape === 'nearly') {
      values.sort((a, b) => a - b);
      // Swap two neighbours so the list is almost, but not quite, sorted.
      const i = randomInt(0, size - 2);
      [values[i], values[i + 1]] = [values[i + 1], values[i]];
    }
    load();
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'shuffle') shuffle();
    if (op === 'nearly' || op === 'reversed') shuffle(op);
    if (op === 'use') {
      const list = readList(listInput);
      if (!list) {
        meta.textContent = 'Type 1 to 20 whole numbers from 1 to 99, separated by spaces or commas.';
        return;
      }
      values = list;
      load();
    }
  });
  algorithmSelect.addEventListener('change', load);
  sizeSelect.addEventListener('change', () => shuffle());

  shuffle();
}

/* ---------- Graph traversal: BFS vs DFS on a grid ---------- */

function mountGridTraversal(root) {
  const ROWS = 8;
  const COLS = 12;
  const start = [0, 0];
  const goal = [ROWS - 1, COLS - 1];
  const walls = new Set(['1,3', '2,3', '3,3', '4,3', '5,3', '2,7', '3,7', '4,7', '5,7', '6,7', '7,7', '0,9', '1,9', '2,9']);
  root.innerHTML = `
    <div class="demo-controls">
      <label>Strategy
        <select class="demo-input demo-input-wide" data-field="mode">
          <option value="bfs">Breadth-first (queue)</option>
          <option value="dfs">Depth-first (stack)</option>
        </select>
      </label>
      <button type="button" class="demo-button" data-op="clear">Clear walls</button>
    </div>
    <p class="demo-hint">Click a cell to add or remove a wall. S is the start, G is the goal.</p>
    <div class="demo-stage"><div class="grid" style="grid-template-columns: repeat(${COLS}, 1fr)"></div></div>
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
    let html = '';
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
        html += `<button type="button" class="grid-cell ${state}" data-cell="${key}" aria-label="Row ${r + 1}, column ${c + 1}${walls.has(key) ? ', wall' : ''}">${label || order}</button>`;
      }
    }
    grid.innerHTML = html;
    if (focusedCell) grid.querySelector(`[data-cell="${focusedCell}"]`)?.focus();
  };

  const player = createPlayer(root, draw);
  const run = () => {
    const mode = modeSelect.value;
    player.load(gridTraversalFrames({ rows: ROWS, cols: COLS, walls, start, goal, mode }), traversalCode(mode));
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
  modeSelect.addEventListener('change', run);

  run();
}

/* ---------- Pattern: two pointers on a sorted array ---------- */

function mountTwoPointers(root) {
  let values = [1, 3, 4, 6, 8, 11, 14, 17];

  root.innerHTML = `
    <div class="demo-controls">
      <label>Target sum <input class="demo-input" type="number" value="19" data-field="target" /></label>
      <button type="button" class="demo-button" data-op="run">Find pair</button>
      <label>Your sorted list <input class="demo-input demo-input-wide" type="text" placeholder="e.g. 2 5 9 12 20" data-field="list" /></label>
      <button type="button" class="demo-button" data-op="use">Use list</button>
    </div>
    <div class="demo-stage"><div class="array-row tp-row"></div></div>
    <p class="bs-compare tp-compare"></p>
  `;

  const row = root.querySelector('.tp-row');
  const compare = root.querySelector('.tp-compare');
  const targetInput = root.querySelector('[data-field="target"]');
  const listInput = root.querySelector('[data-field="list"]');

  // Values outside left..right are ruled out for good: grey them.
  const player = createPlayer(root, ({ left, right, found }) => {
    row.innerHTML = values
      .map((value, i) => {
        const state = found?.includes(i) ? 'is-hit' : i === left || i === right ? 'is-mid' : i < left || i > right ? 'is-out' : '';
        const tags = [i === left && 'L', i === right && 'R'].filter(Boolean).join(' ');
        const pointer = tags ? `<span class="cell-pointer">${tags}</span>` : '';
        return `<div class="array-cell ${state}"><span class="array-value">${value}</span><span class="array-index">${i}</span>${pointer}</div>`;
      })
      .join('');
  });

  const run = () => {
    const target = readInt(targetInput) ?? 0;
    const frames = pairSumFrames(values, target);
    const steps = frames.at(-1).found ? frames.length : frames.length - 1;
    compare.textContent = `Two pointers: ${steps} step${steps === 1 ? '' : 's'}. Brute force would check ${bruteForcePairChecks(values, target)} pair${values.length === 2 ? '' : 's'}.`;
    player.load(frames, pairSumCode);
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'run') run();
    if (op === 'use') {
      const list = readList(listInput, { min: -999, max: 999 });
      if (!list || list.length < 2) {
        compare.textContent = 'Type 2 to 20 whole numbers between -999 and 999, separated by spaces or commas.';
        return;
      }
      // Two pointers relies on sorted order, so sort first.
      values = [...list].sort((a, b) => a - b);
      run();
    }
  });

  run();
}

/* ---------- Pattern: fixed-size sliding window ---------- */

function mountSlidingWindow(root) {
  let values = [2, 1, 5, 1, 3, 2, 9, 4];

  root.innerHTML = `
    <div class="demo-controls">
      <label>Window size k <input class="demo-input" type="number" value="3" min="1" max="20" data-field="k" /></label>
      <button type="button" class="demo-button" data-op="run">Slide</button>
      <label>Your list <input class="demo-input demo-input-wide" type="text" placeholder="e.g. 4 2 7 1 8 3" data-field="list" /></label>
      <button type="button" class="demo-button" data-op="use">Use list</button>
    </div>
    <div class="demo-stage"><div class="array-row sw-row"></div></div>
    <p class="bs-compare sw-compare"></p>
  `;

  const row = root.querySelector('.sw-row');
  const compare = root.querySelector('.sw-compare');
  const kInput = root.querySelector('[data-field="k"]');
  const listInput = root.querySelector('[data-field="list"]');

  // Teal = inside the window; gold = the value that just entered.
  const player = createPlayer(root, ({ start, end, line }) => {
    row.innerHTML = values
      .map((value, i) => {
        const inside = i >= start && i <= end;
        const entering = i === end && line !== 0 && line !== 4;
        const state = entering ? 'is-hit' : inside ? 'is-moved' : '';
        const tags = [i === start && 'start', i === end && 'end'].filter(Boolean).join(' ');
        const pointer = tags ? `<span class="cell-pointer">${tags}</span>` : '';
        return `<div class="array-cell ${state}"><span class="array-value">${value}</span><span class="array-index">${i}</span>${pointer}</div>`;
      })
      .join('');
  });

  const run = () => {
    const k = readInt(kInput) ?? 0;
    const frames = windowSumFrames(values, k);
    const slides = Math.max(0, values.length - k);
    compare.textContent =
      k >= 1 && k <= values.length
        ? `Sliding window: ${k} additions for the first window, then 2 per slide (${k + 2 * slides} in total). Recomputing every window would make ${bruteForceWindowAdds(values.length, k)}.`
        : `Choose k between 1 and ${values.length}.`;
    player.load(frames, windowSumCode);
  };

  root.addEventListener('click', (event) => {
    const op = event.target.closest('[data-op]')?.dataset.op;
    if (op === 'run') run();
    if (op === 'use') {
      const list = readList(listInput, { min: -999, max: 999 });
      if (!list) {
        compare.textContent = 'Type 1 to 20 whole numbers between -999 and 999, separated by spaces or commas.';
        return;
      }
      values = list;
      run();
    }
  });

  run();
}

export const demos = {
  'array-ops': {
    title: 'Insert, delete and read',
    intro: 'Change the array and count how many values move.',
    mount: mountArray,
  },
  'linked-list': {
    title: 'Follow the pointers',
    intro: 'Insert at the head and at the tail, then search. Watch how far each operation walks.',
    mount: mountLinkedList,
  },
  'stack-queue': {
    title: 'Last in or first in?',
    intro: 'Push and enqueue the same values, then remove one from each side.',
    mount: mountStackQueue,
  },
  'hash-table': {
    title: 'Hash a key into a bucket',
    intro: 'Type a key to see the hash arithmetic and the bucket it lands in.',
    mount: mountHashTable,
  },
  bst: {
    title: 'Build and search a tree',
    intro: 'Insert values and search for them. Then try sorted inserts to see the tree degrade.',
    mount: mountBst,
  },
  growth: {
    title: 'Growth rates side by side',
    intro: 'Change n and compare how many steps each shape needs.',
    mount: mountGrowth,
  },
  'binary-search': {
    title: 'Halve the search range',
    intro: 'Step through each comparison. Grey values are ruled out.',
    mount: mountBinarySearch,
  },
  sorting: {
    title: 'Watch a sort run',
    intro: 'Pick an algorithm and step through every compare and swap. Highlighted bars are being compared.',
    mount: mountSorting,
  },
  'grid-traversal': {
    title: 'Breadth-first vs depth-first',
    intro: 'Same grid, same start and goal. The only change is a queue versus a stack.',
    mount: mountGridTraversal,
  },
  'two-pointers': {
    title: 'Squeeze from both ends',
    intro: 'Watch L and R close in on the target. Every grey value is ruled out for good.',
    mount: mountTwoPointers,
  },
  'sliding-window': {
    title: 'Slide the window',
    intro: 'Each slide adds the value that enters and subtracts the one that leaves.',
    mount: mountSlidingWindow,
  },
};
