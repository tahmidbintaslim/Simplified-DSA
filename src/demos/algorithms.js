/**
 * Pure step generators for the interactive demos.
 *
 * Each function runs an algorithm and records "frames": snapshots of state
 * plus a caption that explains the step in plain words. The UI only plays
 * frames back, so these functions have no DOM access and Node tests can run them.
 */

/* ---------- Sorting ---------- */

/**
 * Every sorting frame: { values, active: [i, j], sorted: [indexes], caption,
 * line, vars }. `line` indexes the algorithm's pseudocode (`code` below) so the
 * player can highlight it; `vars` are the variables shown beside the code.
 */
const frame = (values, active, sorted, caption, line = -1, vars = {}) => ({
  values: [...values],
  active,
  sorted: [...sorted],
  caption,
  line,
  vars,
});

// Sorting captions in each language; English is the default.
const SORT_WORDS = {
  en: {
    sorted: 'Sorted.',
    bubbleStart: 'Start: compare neighbours and swap them when they are out of order.',
    compare: (x, y) => `Compare ${x} and ${y}.`,
    swap: (big, small) => `${big} > ${small}, so swap them.`,
    bubbled: (v, end) => `The largest unsorted value, ${v}, has bubbled to index ${end}.`,
    early: 'No swaps in a whole pass: the rest is already in order, so stop early.',
    selectionStart: 'Start: find the smallest unsorted value and move it to the front.',
    check: (min, v) => `Smallest so far is ${min}. Check ${v}.`,
    place: (v, i) => `Place ${v} at index ${i}.`,
    insertionStart: 'Start: the first value alone is a sorted hand of cards.',
    pick: (v) => `Pick up ${v} and slide it left into place.`,
    moveLeft: (big, small) => `${big} > ${small}, so ${small} moves left.`,
    firstSorted: (k) => `The first ${k} values are now sorted.`,
    mergeStart: 'Start: split the list in half until each piece has one value.',
    split: (lo, hi, mid) => `Split indexes ${lo}-${hi} at ${mid}: sort each half first.`,
    merge: (lo, hi, v, k) => `Merge indexes ${lo}-${hi}: take the smaller front value, ${v}, into index ${k}.`,
  },
  bn: {
    sorted: 'সাজানো শেষ।',
    bubbleStart: 'শুরু: পাশাপাশি দুটো মান তুলনা করো, ভুল ক্রমে থাকলে অদলবদল করো।',
    compare: (x, y) => `${x} আর ${y} তুলনা করো।`,
    swap: (big, small) => `${big} > ${small}, তাই দুটোকে অদলবদল করো।`,
    bubbled: (v, end) => `না-সাজানো অংশের সবচেয়ে বড় মান ${v} ভেসে উঠে ইনডেক্স ${end}-এ পৌঁছে গেছে।`,
    early: 'পুরো এক পাসে একটাও অদলবদল হয়নি: বাকিটা আগে থেকেই সাজানো, তাই এখানেই থামো।',
    selectionStart: 'শুরু: না-সাজানো অংশের সবচেয়ে ছোট মানটা খুঁজে সামনে নিয়ে আসো।',
    check: (min, v) => `এখন পর্যন্ত সবচেয়ে ছোট ${min}। এবার ${v} দেখো।`,
    place: (v, i) => `${v}-কে ইনডেক্স ${i}-এ বসাও।`,
    insertionStart: 'শুরু: প্রথম মানটা একাই এক হাত সাজানো তাস।',
    pick: (v) => `${v} হাতে তুলে নাও, তারপর বামে সরিয়ে ঠিক জায়গায় বসাও।`,
    moveLeft: (big, small) => `${big} > ${small}, তাই ${small} বামে সরে যায়।`,
    firstSorted: (k) => `প্রথম ${k}টি মান এখন সাজানো।`,
    mergeStart: 'শুরু: প্রতিটি টুকরোয় একটা করে মান না থাকা পর্যন্ত তালিকাকে অর্ধেক করতে থাকো।',
    split: (lo, hi, mid) => `ইনডেক্স ${lo}-${hi}-কে ${mid}-এ ভাগ করো: আগে দুই অর্ধেক আলাদা করে সাজাও।`,
    merge: (lo, hi, v, k) => `ইনডেক্স ${lo}-${hi} জোড়া দাও: দুই দিকের সামনের মানের মধ্যে ছোটটা, ${v}, যায় ইনডেক্স ${k}-এ।`,
  },
};

export function bubbleSortFrames(input, lang = 'en') {
  const w = SORT_WORDS[lang] ?? SORT_WORDS.en;
  const a = [...input];
  const sorted = new Set();
  const frames = [frame(a, [], sorted, w.bubbleStart, 0)];

  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      frames.push(frame(a, [i, i + 1], sorted, w.compare(a[i], a[i + 1]), 2, { end, i, 'a[i]': a[i], 'a[i+1]': a[i + 1] }));
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swapped = true;
        frames.push(frame(a, [i, i + 1], sorted, w.swap(a[i + 1], a[i]), 3, { end, i, swapped }));
      }
    }
    sorted.add(end);
    frames.push(frame(a, [], sorted, w.bubbled(a[end], end), 4, { end, swapped }));
    // No swaps in a full pass means everything left is already in order.
    if (!swapped) {
      frames.push(frame(a, [], sorted, w.early, 5, { swapped }));
      break;
    }
  }

  a.forEach((_, i) => sorted.add(i));
  frames.push(frame(a, [], sorted, w.sorted));
  return frames;
}

export function selectionSortFrames(input, lang = 'en') {
  const w = SORT_WORDS[lang] ?? SORT_WORDS.en;
  const a = [...input];
  const sorted = new Set();
  const frames = [frame(a, [], sorted, w.selectionStart, 0)];

  for (let start = 0; start < a.length - 1; start++) {
    let min = start;
    for (let i = start + 1; i < a.length; i++) {
      frames.push(frame(a, [min, i], sorted, w.check(a[min], a[i]), 3, { start, i, min, 'a[min]': a[min] }));
      if (a[i] < a[min]) min = i;
    }
    [a[start], a[min]] = [a[min], a[start]];
    sorted.add(start);
    frames.push(frame(a, [start], sorted, w.place(a[start], start), 4, { start, min }));
  }

  a.forEach((_, i) => sorted.add(i));
  frames.push(frame(a, [], sorted, w.sorted));
  return frames;
}

export function insertionSortFrames(input, lang = 'en') {
  const w = SORT_WORDS[lang] ?? SORT_WORDS.en;
  const a = [...input];
  const sorted = new Set([0]);
  const frames = [frame(a, [], sorted, w.insertionStart, 0)];

  for (let i = 1; i < a.length; i++) {
    let j = i;
    frames.push(frame(a, [j], sorted, w.pick(a[j]), 1, { i, j, 'a[j]': a[j] }));
    while (j > 0 && a[j - 1] > a[j]) {
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      frames.push(frame(a, [j - 1, j], sorted, w.moveLeft(a[j], a[j - 1]), 3, { i, j: j - 1 }));
      j--;
    }
    for (let k = 0; k <= i; k++) sorted.add(k);
    frames.push(frame(a, [j], sorted, w.firstSorted(i + 1), 2, { i, j }));
  }

  frames.push(frame(a, [], sorted, w.sorted));
  return frames;
}

export function mergeSortFrames(input, lang = 'en') {
  const w = SORT_WORDS[lang] ?? SORT_WORDS.en;
  const a = [...input];
  const frames = [frame(a, [], [], w.mergeStart, 0)];

  const sort = (lo, hi) => {
    if (hi - lo < 1) return;
    const mid = Math.floor((lo + hi) / 2);
    const range = [];
    for (let k = lo; k <= hi; k++) range.push(k);
    frames.push(frame(a, range, [], w.split(lo, hi, mid), 3, { lo, mid, hi }));
    sort(lo, mid);
    sort(mid + 1, hi);

    // Merge the two sorted halves a[lo..mid] and a[mid+1..hi].
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    for (let k = lo; k <= hi; k++) {
      const takeLeft = j >= right.length || (i < left.length && left[i] <= right[j]);
      a[k] = takeLeft ? left[i++] : right[j++];
      // Show values not merged yet after the merged ones, so no value appears twice.
      const view = [...a.slice(0, k + 1), ...left.slice(i), ...right.slice(j), ...a.slice(hi + 1)];
      frames.push(frame(view, [k], [], w.merge(lo, hi, a[k], k), 4, { lo, mid, hi, k }));
    }
  };

  sort(0, a.length - 1);
  frames.push(frame(a, [], a.map((_, i) => i), w.sorted));
  return frames;
}

// `code` is short pseudocode; frame.line points into it.
export const sortingAlgorithms = {
  bubble: {
    label: 'Bubble sort',
    big: 'O(n²)',
    frames: bubbleSortFrames,
    code: [
      'for end from n-1 down to 1:',
      '  for i from 0 to end-1:',
      '    if a[i] > a[i+1]:',
      '      swap a[i] and a[i+1]',
      '  a[end] is now in its final place',
      '  if nothing was swapped: stop early',
    ],
  },
  selection: {
    label: 'Selection sort',
    big: 'O(n²)',
    frames: selectionSortFrames,
    code: [
      'for start from 0 to n-2:',
      '  min = start',
      '  for i from start+1 to n-1:',
      '    if a[i] < a[min]: min = i',
      '  swap a[start] and a[min]',
    ],
  },
  insertion: {
    label: 'Insertion sort',
    big: 'O(n²), O(n) if nearly sorted',
    frames: insertionSortFrames,
    code: [
      'for i from 1 to n-1:',
      '  j = i',
      '  while j > 0 and a[j-1] > a[j]:',
      '    swap a[j-1] and a[j]; j = j - 1',
    ],
  },
  merge: {
    label: 'Merge sort',
    big: 'O(n log n)',
    frames: mergeSortFrames,
    code: [
      'mergeSort(lo, hi):',
      '  if lo >= hi: return',
      '  mid = (lo + hi) / 2',
      '  mergeSort(lo, mid); mergeSort(mid+1, hi)',
      '  merge: keep taking the smaller front value',
    ],
  },
};

/* ---------- Searching ---------- */

export const binarySearchCode = [
  'lo = 0, hi = n - 1',
  'while lo <= hi:',
  '  mid = (lo + hi) // 2',
  '  if a[mid] == target: return mid',
  '  if a[mid] < target: lo = mid + 1',
  '  else: hi = mid - 1',
  'return "not found"',
];

// Frame: { lo, hi, mid, found, caption, line, vars }. found is the index, or -1 when absent.
const SEARCH_WORDS = {
  en: {
    found: (v, t, mid) => `Middle value ${v} equals ${t}. Found at index ${mid}.`,
    drop: (v, t, right) => `Middle value ${v} is ${right ? 'smaller' : 'larger'} than ${t}, so drop the ${right ? 'left' : 'right'} half.`,
    missing: (t) => `lo passed hi, so nothing is left to check: ${t} is not in the list.`,
  },
  bn: {
    found: (v, t, mid) => `মাঝের মান ${v} আর ${t} সমান। ইনডেক্স ${mid}-এ পাওয়া গেছে।`,
    drop: (v, t, right) => `মাঝের মান ${v}, ${t}-এর চেয়ে ${right ? 'ছোট' : 'বড়'}, তাই ${right ? 'বাম' : 'ডান'} অর্ধেক বাদ দাও।`,
    missing: (t) => `lo এখন hi-কে পেরিয়ে গেছে, দেখার মতো আর কিছু বাকি নেই: ${t} তালিকায় নেই।`,
  },
};

export function binarySearchFrames(sorted, target, lang = 'en') {
  const w = SEARCH_WORDS[lang] ?? SEARCH_WORDS.en;
  const frames = [];
  let lo = 0;
  let hi = sorted.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = sorted[mid];
    const vars = { target, lo, hi, mid, 'a[mid]': value };
    if (value === target) {
      frames.push({ lo, hi, mid, found: mid, line: 3, vars, caption: w.found(value, target, mid) });
      return frames;
    }
    const goRight = value < target;
    frames.push({
      lo,
      hi,
      mid,
      found: null,
      line: goRight ? 4 : 5,
      vars,
      caption: w.drop(value, target, goRight),
    });
    if (goRight) lo = mid + 1;
    else hi = mid - 1;
  }

  frames.push({ lo, hi, mid: -1, found: -1, line: 6, vars: { target, lo, hi }, caption: w.missing(target) });
  return frames;
}

/* ---------- Graph traversal on a grid ---------- */

export const traversalCode = (mode) => {
  const list = mode === 'bfs' ? 'queue' : 'stack';
  return [
    `${list} = [start]`,
    `while ${list} is not empty:`,
    `  cell = take from the ${mode === 'bfs' ? 'front' : 'top'} of ${list}`,
    '  if cell was visited: skip it',
    '  if cell is the goal: stop, follow parents back',
    `  push each open, unvisited neighbour onto ${list}`,
    'the goal cannot be reached',
  ];
};

/**
 * BFS or DFS over a grid. `walls` is a Set of "row,col" strings.
 * Frame: { visited: [keys], frontier: [keys], current, path: [keys], caption, line, vars }.
 */
const GRID_WORDS = {
  en: {
    queue: 'queue', stack: 'stack',
    goal: (v, p) => `Reached the goal after visiting ${v} cells. Path length: ${p} steps.`,
    visit: (r, c, list, waiting) => `Visit (${r}, ${c}). Add its unvisited neighbours to the ${list}: ${waiting} waiting.`,
    blocked: 'The goal cannot be reached: walls block every route.',
  },
  bn: {
    queue: 'কিউ', stack: 'স্ট্যাক',
    goal: (v, p) => `${v}টি ঘর ঘোরার পর লক্ষ্যে পৌঁছানো গেল। পথের দৈর্ঘ্য: ${p} ধাপ।`,
    visit: (r, c, list, waiting) => `(${r}, ${c}) ঘরে যাও। এর না-দেখা প্রতিবেশীদের ${list}-এ রাখো: ${waiting}টি অপেক্ষায়।`,
    blocked: 'লক্ষ্যে পৌঁছানো যাবে না: দেয়াল সব পথ আটকে রেখেছে।',
  },
};

export function gridTraversalFrames({ rows, cols, walls, start, goal, mode }, lang = 'en') {
  const w = GRID_WORDS[lang] ?? GRID_WORDS.en;
  const key = ([r, c]) => `${r},${c}`;
  const startKey = key(start);
  const goalKey = key(goal);
  const parent = new Map([[startKey, null]]);
  const frontier = [start];
  const visited = [];
  const frames = [];
  const container = mode === 'bfs' ? 'queue' : 'stack';

  while (frontier.length) {
    // The only difference between BFS and DFS: which end we take from.
    const cell = mode === 'bfs' ? frontier.shift() : frontier.pop();
    const cellKey = key(cell);
    if (visited.includes(cellKey)) continue;
    visited.push(cellKey);

    if (cellKey === goalKey) {
      const path = [];
      for (let k = goalKey; k; k = parent.get(k)) path.unshift(k);
      frames.push({
        visited: [...visited],
        frontier: frontier.map(key),
        current: cellKey,
        path,
        line: 4,
        vars: { cell: `(${cellKey})`, visited: visited.length, 'path length': path.length - 1 },
        caption: w.goal(visited.length, path.length - 1),
      });
      return frames;
    }

    const [r, c] = cell;
    const neighbours = [[r - 1, c], [r, c + 1], [r + 1, c], [r, c - 1]].filter(
      ([nr, nc]) => nr >= 0 && nc >= 0 && nr < rows && nc < cols && !walls.has(`${nr},${nc}`),
    );
    for (const next of neighbours) {
      const nextKey = key(next);
      if (mode === 'bfs' && parent.has(nextKey)) continue;
      if (mode === 'dfs' && visited.includes(nextKey)) continue;
      parent.set(nextKey, cellKey);
      frontier.push(next);
    }

    frames.push({
      visited: [...visited],
      frontier: frontier.map(key),
      current: cellKey,
      path: [],
      line: 5,
      vars: { cell: `(${r},${c})`, visited: visited.length, [`${container} size`]: frontier.length },
      caption: w.visit(r, c, w[container], frontier.length),
    });
  }

  frames.push({ visited: [...visited], frontier: [], current: null, path: [], line: 6, vars: { visited: visited.length }, caption: w.blocked });
  return frames;
}

/* ---------- Hashing ---------- */

/**
 * A teaching hash: add up the character codes, then take the remainder.
 * shortcut: real hash maps use stronger mixing (e.g. SipHash); this one keeps the math visible.
 */
export function simpleHash(key, bucketCount) {
  const codes = [...key].map((ch) => ch.codePointAt(0));
  const sum = codes.reduce((total, code) => total + code, 0);
  return { codes, sum, index: sum % bucketCount };
}

/* ---------- Binary search tree ---------- */

// Nodes are plain objects: { value, left, right }. Insert returns the same root.
export function bstInsert(root, value) {
  const node = { value, left: null, right: null };
  if (!root) return node;
  let current = root;
  for (;;) {
    if (value === current.value) return root; // No duplicates in this teaching tree.
    const side = value < current.value ? 'left' : 'right';
    if (!current[side]) {
      current[side] = node;
      return root;
    }
    current = current[side];
  }
}

// The values visited on the way to `value`, and whether it was found.
export function bstSearchPath(root, value) {
  const path = [];
  for (let node = root; node; node = value < node.value ? node.left : node.right) {
    path.push(node.value);
    if (node.value === value) return { path, found: true };
  }
  return { path, found: false };
}

export function bstInOrder(root, out = []) {
  if (root) {
    bstInOrder(root.left, out);
    out.push(root.value);
    bstInOrder(root.right, out);
  }
  return out;
}

/**
 * Give each node an (x, y) for drawing: x is its in-order position, y its depth.
 * In-order position keeps every left child left of its parent without overlap.
 */
export function bstLayout(root) {
  const nodes = [];
  const edges = [];
  let column = 0;
  const walk = (node, depth, parentValue) => {
    if (!node) return;
    walk(node.left, depth + 1, node.value);
    nodes.push({ value: node.value, x: column++, y: depth });
    if (parentValue !== undefined) edges.push([parentValue, node.value]);
    walk(node.right, depth + 1, node.value);
  };
  walk(root, 0, undefined);
  return { nodes, edges };
}

/* ---------- Growth rates ---------- */

export const growthRates = [
  { id: 'o1', label: 'O(1)', ops: () => 1 },
  { id: 'ologn', label: 'O(log n)', ops: (n) => Math.max(1, Math.ceil(Math.log2(n))) },
  { id: 'on', label: 'O(n)', ops: (n) => n },
  { id: 'onlogn', label: 'O(n log n)', ops: (n) => Math.ceil(n * Math.max(1, Math.log2(n))) },
  { id: 'on2', label: 'O(n²)', ops: (n) => n * n },
];

/* ---------- Pattern: two pointers ---------- */

export const pairSumCode = [
  'left = 0, right = n - 1',
  'while left < right:',
  '  sum = a[left] + a[right]',
  '  if sum == target: return (left, right)',
  '  if sum < target: left = left + 1',
  '  else: right = right - 1',
  'return "no pair"',
];

/**
 * Two pointers on a sorted array: find two values that add up to target.
 * Frame: { left, right, found: [i, j] | null, caption, line, vars }.
 * Each step rules out a whole row of pairs, so it takes at most n - 1 steps
 * instead of the n(n-1)/2 pairs a brute-force search checks.
 */
const PAIR_WORDS = {
  en: {
    found: (x, y, t) => `${x} + ${y} = ${t}. Found the pair.`,
    small: (x, y, s) => `${x} + ${y} = ${s} is too small. Every pair with ${x} is too small too, so move the left pointer right.`,
    big: (x, y, s) => `${x} + ${y} = ${s} is too big. Every pair with ${y} is too big too, so move the right pointer left.`,
    none: (t) => `The pointers met: no two values add up to ${t}.`,
  },
  bn: {
    found: (x, y, t) => `${x} + ${y} = ${t}। জোড়া পাওয়া গেছে।`,
    small: (x, y, s) => `${x} + ${y} = ${s}, খুব ছোট। ${x}-এর সাথে যেকোনো জোড়াও ছোটই হবে, তাই বাম পয়েন্টার ডানে সরাও।`,
    big: (x, y, s) => `${x} + ${y} = ${s}, খুব বড়। ${y}-এর সাথে যেকোনো জোড়াও বড়ই হবে, তাই ডান পয়েন্টার বামে সরাও।`,
    none: (t) => `পয়েন্টার দুটো মিলে গেল: কোনো দুটো মান যোগ করে ${t} হয় না।`,
  },
};

export function pairSumFrames(sorted, target, lang = 'en') {
  const w = PAIR_WORDS[lang] ?? PAIR_WORDS.en;
  const frames = [];
  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    const sum = sorted[left] + sorted[right];
    const vars = { target, left, right, sum };
    if (sum === target) {
      frames.push({ left, right, found: [left, right], line: 3, vars, caption: w.found(sorted[left], sorted[right], target) });
      return frames;
    }
    const tooSmall = sum < target;
    frames.push({
      left,
      right,
      found: null,
      line: tooSmall ? 4 : 5,
      vars,
      caption: (tooSmall ? w.small : w.big)(sorted[left], sorted[right], sum),
    });
    if (tooSmall) left++;
    else right--;
  }

  frames.push({ left, right, found: null, line: 6, vars: { target, left, right }, caption: w.none(target) });
  return frames;
}

// How many pairs a brute-force search checks before it finds the target (or all of them).
export function bruteForcePairChecks(values, target) {
  let checks = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      checks++;
      if (values[i] + values[j] === target) return checks;
    }
  }
  return checks;
}

/* ---------- Pattern: sliding window ---------- */

export const windowSumCode = [
  'sum = a[0] + … + a[k-1];  best = sum',
  'for end from k to n-1:',
  '  sum = sum + a[end] - a[end-k]',
  '  best = max(best, sum)',
  'return best',
];

/**
 * Fixed-size sliding window: the largest sum of k values in a row.
 * Frame: { start, end, sum, best, bestStart, caption, line, vars }.
 * Sliding adds the value entering and subtracts the value leaving, so each
 * step costs O(1) instead of re-adding all k values.
 */
const WINDOW_WORDS = {
  en: {
    badK: (n) => `The window size must be between 1 and ${n}.`,
    first: (k, s) => `First window: add the first ${k} values. Sum = ${s}.`,
    slide: (add, drop, s, improved, best) => `Slide right: add ${add}, drop ${drop}. Sum = ${s}${improved ? ', a new best.' : `, best is still ${best}.`}`,
    done: (start, best) => `Done. The best window starts at index ${start} with sum ${best}.`,
  },
  bn: {
    badK: (n) => `উইন্ডোর মাপ হতে হবে 1 থেকে ${n}-এর মধ্যে।`,
    first: (k, s) => `প্রথম উইন্ডো: প্রথম ${k}টি মান যোগ করো। যোগফল = ${s}।`,
    slide: (add, drop, s, improved, best) => `ডানে সরাও: ${add} যোগ করো, ${drop} বাদ দাও। যোগফল = ${s}${improved ? ', নতুন সেরা।' : `, সেরা এখনও ${best}।`}`,
    done: (start, best) => `শেষ। সেরা উইন্ডো শুরু হয় ইনডেক্স ${start}-এ, যোগফল ${best}।`,
  },
};

export function windowSumFrames(values, k, lang = 'en') {
  const w = WINDOW_WORDS[lang] ?? WINDOW_WORDS.en;
  if (k < 1 || k > values.length) {
    return [{ start: 0, end: -1, sum: 0, best: null, bestStart: -1, line: -1, vars: { k }, caption: w.badK(values.length) }];
  }

  let sum = values.slice(0, k).reduce((total, value) => total + value, 0);
  let best = sum;
  let bestStart = 0;
  const frames = [
    {
      start: 0,
      end: k - 1,
      sum,
      best,
      bestStart,
      line: 0,
      vars: { k, start: 0, end: k - 1, sum, best },
      caption: w.first(k, sum),
    },
  ];

  for (let end = k; end < values.length; end++) {
    const start = end - k + 1;
    sum += values[end] - values[end - k];
    const improved = sum > best;
    if (improved) {
      best = sum;
      bestStart = start;
    }
    frames.push({
      start,
      end,
      sum,
      best,
      bestStart,
      line: improved ? 3 : 2,
      vars: { k, start, end, sum, best },
      caption: w.slide(values[end], values[end - k], sum, improved, best),
    });
  }

  frames.push({
    start: bestStart,
    end: bestStart + k - 1,
    sum: best,
    best,
    bestStart,
    line: 4,
    vars: { k, best },
    caption: w.done(bestStart, best),
  });
  return frames;
}

// Additions a brute-force version makes: k for every window.
export const bruteForceWindowAdds = (n, k) => (k >= 1 && k <= n ? (n - k + 1) * k : 0);

/* ---------- Arrays: insert and delete shift values one at a time ---------- */

/**
 * Every array frame: { values, hit, moved: [indexes], line, vars, caption }.
 * `null` in `values` is an empty slot, drawn as a gap, so the learner sees the
 * gap travel instead of a value appearing twice mid-shift.
 */
export const arrayCode = {
  read: ['return a[i]        // address = start + i × size'],
  append: ['a[n] = x           // the next free slot'],
  insert: ['add a slot at the end', 'for j from n down to i + 1:', '  a[j] = a[j - 1]   // shift right', 'a[i] = x'],
  delete: ['x = a[i]', 'for j from i to n - 2:', '  a[j] = a[j + 1]   // shift left', 'drop the last slot'],
};

// Captions for the array demo in each language.
const ARRAY_WORDS = {
  en: {
    room: (n) => `Make room: add an empty slot at the end (index ${n}).`,
    shiftRight: (v, from, to) => `Shift ${v} right, from index ${from} to ${to}.`,
    put: (x, i, c) => `Put ${x} into the gap at index ${i}. ${c} value${c === 1 ? '' : 's'} shifted right: O(n).`,
    remove: (x, i) => `Remove ${x} from index ${i}.`,
    gap: (i) => `That leaves a gap at index ${i}.`,
    shiftLeft: (v, from, to) => `Shift ${v} left, from index ${from} to ${to}.`,
    drop: (c) => `Drop the empty last slot. ${c} value${c === 1 ? '' : 's'} shifted left to close the gap: O(n).`,
  },
  bn: {
    room: (n) => `জায়গা বানাও: শেষে একটা খালি ঘর যোগ করো (ইনডেক্স ${n})।`,
    shiftRight: (v, from, to) => `${v}-কে ডানে সরাও, ইনডেক্স ${from} থেকে ${to}-এ।`,
    put: (x, i, c) => `ফাঁকা ইনডেক্স ${i}-এ ${x} বসাও। ${c}টি মান ডানে সরেছে: O(n)।`,
    remove: (x, i) => `ইনডেক্স ${i} থেকে ${x} সরাও।`,
    gap: (i) => `ইনডেক্স ${i}-এ একটা ফাঁকা ঘর থেকে গেল।`,
    shiftLeft: (v, from, to) => `${v}-কে বামে সরাও, ইনডেক্স ${from} থেকে ${to}-এ।`,
    drop: (c) => `শেষের খালি ঘরটা বাদ দাও। ফাঁক বন্ধ করতে ${c}টি মান বামে সরেছে: O(n)।`,
  },
};

export function arrayInsertFrames(values, i, x, lang = 'en') {
  const w = ARRAY_WORDS[lang] ?? ARRAY_WORDS.en;
  const a = [...values, null];
  const n = values.length;
  const moved = [];
  const snap = (line, vars, caption, hit = -1) => ({ values: [...a], hit, moved: [...moved], line, vars, caption });
  const frames = [snap(0, { n, i, x }, w.room(n))];
  for (let j = n; j > i; j--) {
    a[j] = a[j - 1];
    a[j - 1] = null;
    moved.push(j);
    frames.push(snap(2, { n, i, x, j }, w.shiftRight(a[j], j - 1, j)));
  }
  a[i] = x;
  const count = moved.length;
  frames.push(snap(3, { n: n + 1, i, x }, w.put(x, i, count), i));
  return frames;
}

export function arrayDeleteFrames(values, i, lang = 'en') {
  const w = ARRAY_WORDS[lang] ?? ARRAY_WORDS.en;
  const a = [...values];
  const n = values.length;
  const x = a[i];
  const moved = [];
  const snap = (line, vars, caption, hit = -1) => ({ values: [...a], hit, moved: [...moved], line, vars, caption });
  const frames = [snap(0, { n, i, x }, w.remove(x, i), i)];
  a[i] = null;
  frames.push(snap(0, { n, i, x }, w.gap(i)));
  for (let j = i; j < n - 1; j++) {
    a[j] = a[j + 1];
    a[j + 1] = null;
    moved.push(j);
    frames.push(snap(2, { n, i, x, j }, w.shiftLeft(a[j], j + 1, j)));
  }
  a.pop();
  const count = moved.length;
  frames.push(snap(3, { n: n - 1, i }, w.drop(count)));
  return frames;
}

/* ---------- Pattern: fast and slow pointers (Floyd's cycle check) ---------- */

export const fastSlowCode = [
  'slow = head;  fast = head',
  'while fast and fast.next exist:',
  '  slow = slow.next',
  '  fast = fast.next.next',
  '  if slow == fast: return "loop"',
  'return "no loop"',
];

/**
 * A list of n nodes where node i points to i + 1, and the last node points
 * back to `loopTo` (or to nothing when loopTo is -1).
 * Frame: { slow, fast, met, line, vars, caption }; fast is -1 once it falls
 * off the end. Slow moves 1 node per step, fast moves 2, so on a loop fast
 * gains one node each step and must land on slow.
 */
const FAST_SLOW_WORDS = {
  en: {
    start: 'Both pointers start at the head, node 0.',
    met: (s, f, steps) => `Slow steps to node ${s} and fast jumps to node ${f}: they meet, so the list has a loop. Found in ${steps} step${steps === 1 ? '' : 's'}.`,
    step: (s, f) => `Slow steps to ${s < 0 ? 'the end' : `node ${s}`}; fast jumps two, to ${f < 0 ? 'the end' : `node ${f}`}.`,
    end: (steps, s) => `Fast reached the end after ${steps} step${steps === 1 ? '' : 's'}, so there is no loop. Slow is at node ${s}, the middle.`,
  },
  bn: {
    start: 'দুটো পয়েন্টারই শুরু করে head থেকে, নোড 0-তে।',
    met: (s, f, steps) => `slow এক ঘর এগিয়ে নোড ${s}-এ, fast লাফিয়ে নোড ${f}-এ: দুজন মিলে গেল, তাই লিস্টে লুপ আছে। ধরা পড়ল ${steps} ধাপে।`,
    step: (s, f) => `slow এক ঘর এগিয়ে ${s < 0 ? 'লিস্টের শেষে' : `নোড ${s}-এ`}; fast দুই ঘর লাফিয়ে ${f < 0 ? 'লিস্টের শেষে' : `নোড ${f}-এ`}।`,
    end: (steps, s) => `${steps} ধাপ পরে fast লিস্টের শেষে পৌঁছে গেল, তাই কোনো লুপ নেই। slow আছে নোড ${s}-এ, ঠিক মাঝখানে।`,
  },
};

export function fastSlowFrames(n, loopTo = -1, lang = 'en') {
  const w = FAST_SLOW_WORDS[lang] ?? FAST_SLOW_WORDS.en;
  const next = (i) => (i < 0 ? -1 : i + 1 < n ? i + 1 : loopTo);
  let slow = 0;
  let fast = 0;
  let steps = 0;
  const frames = [{ slow, fast, met: false, line: 0, vars: { slow, fast, steps }, caption: w.start }];

  while (fast >= 0 && next(fast) >= 0) {
    slow = next(slow);
    fast = next(next(fast));
    steps += 1;
    const met = slow === fast;
    frames.push({
      slow,
      fast,
      met,
      line: met ? 4 : 3,
      vars: { slow, fast, steps },
      caption: met ? w.met(slow, fast, steps) : w.step(slow, fast),
    });
    if (met) return frames;
  }

  frames.push({
    slow,
    fast,
    met: false,
    line: 5,
    vars: { slow, fast: fast < 0 ? 'none' : fast, steps },
    caption: w.end(steps, slow),
  });
  return frames;
}

/* ---------- Pattern: prefix sums ---------- */

export const prefixSumCode = [
  'prefix[0] = 0',
  'for i from 0 to n-1:',
  '  prefix[i+1] = prefix[i] + a[i]',
  'sum(l..r) = prefix[r+1] - prefix[l]',
];

/**
 * Build the prefix array once, then answer one range-sum question with a
 * single subtraction. Frame: { prefix (filled so far), i, query, line, vars,
 * caption }; `query` is { l, r, sum } on the last frame.
 */
const PREFIX_WORDS = {
  en: {
    zero: 'prefix[0] = 0: the sum of no values.',
    stop: '.',
    pick: (last) => `Pick 0 ≤ l ≤ r ≤ ${last} to ask for a range sum.`,
    answer: (formula) => `${formula}. One subtraction, however long the range.`,
  },
  bn: {
    zero: 'prefix[0] = 0: কোনো মান না নিলে যোগফল শূন্য।',
    stop: '।',
    pick: (last) => `রেঞ্জের যোগফল জানতে 0 ≤ l ≤ r ≤ ${last} বেছে নাও।`,
    answer: (formula) => `${formula}। রেঞ্জ যত লম্বাই হোক, একটাই বিয়োগ।`,
  },
};

export function prefixSumFrames(values, l, r, lang = 'en') {
  const w = PREFIX_WORDS[lang] ?? PREFIX_WORDS.en;
  const prefix = [0];
  const frames = [{ prefix: [...prefix], i: -1, query: null, line: 0, vars: { n: values.length }, caption: w.zero }];
  values.forEach((value, i) => {
    prefix.push(prefix[i] + value);
    frames.push({
      prefix: [...prefix],
      i,
      query: null,
      line: 2,
      vars: { i, 'a[i]': value, [`prefix[${i + 1}]`]: prefix[i + 1] },
      caption: `prefix[${i + 1}] = prefix[${i}] + a[${i}] = ${prefix[i]} + ${value} = ${prefix[i + 1]}${w.stop}`,
    });
  });

  const valid = Number.isInteger(l) && Number.isInteger(r) && l >= 0 && r < values.length && l <= r;
  if (!valid) {
    frames.push({ prefix: [...prefix], i: -1, query: null, line: -1, vars: { l, r }, caption: w.pick(values.length - 1) });
    return frames;
  }
  const sum = prefix[r + 1] - prefix[l];
  frames.push({
    prefix: [...prefix],
    i: -1,
    query: { l, r, sum },
    line: 3,
    vars: { l, r, [`prefix[${r + 1}]`]: prefix[r + 1], [`prefix[${l}]`]: prefix[l], sum },
    caption: w.answer(`sum(${l}..${r}) = prefix[${r + 1}] - prefix[${l}] = ${prefix[r + 1]} - ${prefix[l]} = ${sum}`),
  });
  return frames;
}

/* ---------- Binary search with the two classic bugs (for the bug lab) ---------- */

/**
 * Binary search with switchable edges, to show what each "small" choice does.
 * strict: loop while lo < hi (bug) instead of lo <= hi.
 * hiMid: shrink with hi = mid (bug) instead of hi = mid - 1.
 * Returns { steps: [{ lo, hi, mid }], result } where result is 'found',
 * 'not-found' (correct miss), 'missed' (the value is there but was skipped)
 * or 'stuck' (the range stopped shrinking: an infinite loop).
 */
export function binarySearchVariant(values, target, { strict = false, hiMid = false } = {}) {
  let lo = 0;
  let hi = values.length - 1;
  const steps = [];
  const seen = new Set();
  while (strict ? lo < hi : lo <= hi) {
    const key = `${lo},${hi}`;
    if (seen.has(key)) return { steps, result: 'stuck', index: -1 };
    seen.add(key);
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ lo, hi, mid });
    if (values[mid] === target) return { steps, result: 'found', index: mid };
    if (values[mid] < target) lo = mid + 1;
    else hi = hiMid ? mid : mid - 1;
  }
  return { steps, result: values.includes(target) ? 'missed' : 'not-found', index: -1, lo, hi };
}
