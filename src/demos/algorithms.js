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

export function bubbleSortFrames(input) {
  const a = [...input];
  const sorted = new Set();
  const frames = [frame(a, [], sorted, 'Start: compare neighbours and swap them when they are out of order.', 0)];

  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      frames.push(frame(a, [i, i + 1], sorted, `Compare ${a[i]} and ${a[i + 1]}.`, 2, { end, i, 'a[i]': a[i], 'a[i+1]': a[i + 1] }));
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swapped = true;
        frames.push(frame(a, [i, i + 1], sorted, `${a[i + 1]} > ${a[i]}, so swap them.`, 3, { end, i, swapped }));
      }
    }
    sorted.add(end);
    frames.push(frame(a, [], sorted, `The largest unsorted value, ${a[end]}, has bubbled to index ${end}.`, 4, { end, swapped }));
    // No swaps in a full pass means everything left is already in order.
    if (!swapped) {
      frames.push(frame(a, [], sorted, 'No swaps in a whole pass: the rest is already in order, so stop early.', 5, { swapped }));
      break;
    }
  }

  a.forEach((_, i) => sorted.add(i));
  frames.push(frame(a, [], sorted, 'Sorted.'));
  return frames;
}

export function selectionSortFrames(input) {
  const a = [...input];
  const sorted = new Set();
  const frames = [frame(a, [], sorted, 'Start: find the smallest unsorted value and move it to the front.', 0)];

  for (let start = 0; start < a.length - 1; start++) {
    let min = start;
    for (let i = start + 1; i < a.length; i++) {
      frames.push(frame(a, [min, i], sorted, `Smallest so far is ${a[min]}. Check ${a[i]}.`, 3, { start, i, min, 'a[min]': a[min] }));
      if (a[i] < a[min]) min = i;
    }
    [a[start], a[min]] = [a[min], a[start]];
    sorted.add(start);
    frames.push(frame(a, [start], sorted, `Place ${a[start]} at index ${start}.`, 4, { start, min }));
  }

  a.forEach((_, i) => sorted.add(i));
  frames.push(frame(a, [], sorted, 'Sorted.'));
  return frames;
}

export function insertionSortFrames(input) {
  const a = [...input];
  const sorted = new Set([0]);
  const frames = [frame(a, [], sorted, 'Start: the first value alone is a sorted hand of cards.', 0)];

  for (let i = 1; i < a.length; i++) {
    let j = i;
    frames.push(frame(a, [j], sorted, `Pick up ${a[j]} and slide it left into place.`, 1, { i, j, 'a[j]': a[j] }));
    while (j > 0 && a[j - 1] > a[j]) {
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      frames.push(frame(a, [j - 1, j], sorted, `${a[j]} > ${a[j - 1]}, so ${a[j - 1]} moves left.`, 3, { i, j: j - 1 }));
      j--;
    }
    for (let k = 0; k <= i; k++) sorted.add(k);
    frames.push(frame(a, [j], sorted, `The first ${i + 1} values are now sorted.`, 2, { i, j }));
  }

  frames.push(frame(a, [], sorted, 'Sorted.'));
  return frames;
}

export function mergeSortFrames(input) {
  const a = [...input];
  const frames = [frame(a, [], [], 'Start: split the list in half until each piece has one value.', 0)];

  const sort = (lo, hi) => {
    if (hi - lo < 1) return;
    const mid = Math.floor((lo + hi) / 2);
    const range = [];
    for (let k = lo; k <= hi; k++) range.push(k);
    frames.push(frame(a, range, [], `Split indexes ${lo}-${hi} at ${mid}: sort each half first.`, 3, { lo, mid, hi }));
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
      frames.push(frame(view, [k], [], `Merge indexes ${lo}-${hi}: take the smaller front value, ${a[k]}, into index ${k}.`, 4, { lo, mid, hi, k }));
    }
  };

  sort(0, a.length - 1);
  frames.push(frame(a, [], a.map((_, i) => i), 'Sorted.'));
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
export function binarySearchFrames(sorted, target) {
  const frames = [];
  let lo = 0;
  let hi = sorted.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = sorted[mid];
    const vars = { target, lo, hi, mid, 'a[mid]': value };
    if (value === target) {
      frames.push({ lo, hi, mid, found: mid, line: 3, vars, caption: `Middle value ${value} equals ${target}. Found at index ${mid}.` });
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
      caption: `Middle value ${value} is ${goRight ? 'smaller' : 'larger'} than ${target}, so drop the ${goRight ? 'left' : 'right'} half.`,
    });
    if (goRight) lo = mid + 1;
    else hi = mid - 1;
  }

  frames.push({ lo, hi, mid: -1, found: -1, line: 6, vars: { target, lo, hi }, caption: `lo passed hi, so nothing is left to check: ${target} is not in the list.` });
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
export function gridTraversalFrames({ rows, cols, walls, start, goal, mode }) {
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
        caption: `Reached the goal after visiting ${visited.length} cells. Path length: ${path.length - 1} steps.`,
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
      caption: `Visit (${r}, ${c}). Add its unvisited neighbours to the ${container}: ${frontier.length} waiting.`,
    });
  }

  frames.push({ visited: [...visited], frontier: [], current: null, path: [], line: 6, vars: { visited: visited.length }, caption: 'The goal cannot be reached: walls block every route.' });
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
