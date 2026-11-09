import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  binarySearchCode,
  binarySearchFrames,
  bstInOrder,
  bstInsert,
  bstLayout,
  bstSearchPath,
  gridTraversalFrames,
  simpleHash,
  sortingAlgorithms,
  traversalCode,
} from '../src/demos/algorithms.js';

const inputs = [[], [1], [5, 1, 4, 2, 8], [3, 3, 1, 2, 1], [9, 8, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4]];

for (const [id, algorithm] of Object.entries(sortingAlgorithms)) {
  test(`${id} sort ends sorted and never loses values`, () => {
    for (const input of inputs) {
      const frames = algorithm.frames(input);
      const expected = [...input].sort((a, b) => a - b);
      assert.deepEqual(frames.at(-1).values, expected);
      for (const frame of frames) {
        assert.deepEqual([...frame.values].sort((a, b) => a - b), expected);
        assert.ok(frame.caption);
      }
    }
  });
}

test('bubble sort stops after one pass on sorted input', () => {
  // Start + 3 compares + end-of-pass + "stop early" + done.
  assert.equal(sortingAlgorithms.bubble.frames([1, 2, 3, 4]).length, 7);
});

test('binary search finds every present value and rejects absent ones', () => {
  const sorted = [3, 9, 14, 21, 30, 42, 57];
  sorted.forEach((value, index) => assert.equal(binarySearchFrames(sorted, value).at(-1).found, index));
  assert.equal(binarySearchFrames(sorted, 10).at(-1).found, -1);
  assert.equal(binarySearchFrames([], 1).at(-1).found, -1);
  // log2(1024) + 1 checks at most.
  const big = Array.from({ length: 1024 }, (_, i) => i);
  assert.ok(binarySearchFrames(big, 777).length <= 11);
});

test('BFS finds a shortest path; DFS finds some path', () => {
  const options = { rows: 3, cols: 3, walls: new Set(['1,1']), start: [0, 0], goal: [2, 2] };
  const bfs = gridTraversalFrames({ ...options, mode: 'bfs' }).at(-1);
  const dfs = gridTraversalFrames({ ...options, mode: 'dfs' }).at(-1);
  assert.equal(bfs.path.length - 1, 4);
  assert.deepEqual([bfs.path[0], bfs.path.at(-1)], ['0,0', '2,2']);
  assert.ok(dfs.path.length - 1 >= 4);
  assert.deepEqual([dfs.path[0], dfs.path.at(-1)], ['0,0', '2,2']);
});

test('traversal reports an unreachable goal', () => {
  const walls = new Set(['0,1', '1,0', '1,1']);
  const last = gridTraversalFrames({ rows: 2, cols: 2, walls, start: [0, 0], goal: [1, 1], mode: 'bfs' }).at(-1);
  assert.deepEqual(last.path, []);
});

test('simpleHash is the sum of code points modulo bucket count', () => {
  assert.deepEqual(simpleHash('cat', 7), { codes: [99, 97, 116], sum: 312, index: 4 });
  assert.equal(simpleHash('act', 7).index, simpleHash('cat', 7).index);
});

test('BST keeps values ordered, rejects duplicates, and lays out without overlap', () => {
  let root = null;
  for (const value of [50, 30, 70, 20, 40, 60, 80, 40]) root = bstInsert(root, value);
  assert.deepEqual(bstInOrder(root), [20, 30, 40, 50, 60, 70, 80]);
  assert.deepEqual(bstSearchPath(root, 60), { path: [50, 70, 60], found: true });
  assert.deepEqual(bstSearchPath(root, 65), { path: [50, 70, 60], found: false });
  const { nodes, edges } = bstLayout(root);
  assert.equal(new Set(nodes.map((node) => node.x)).size, nodes.length);
  assert.equal(edges.length, nodes.length - 1);
});

test('every step points at a real pseudocode line', () => {
  const inRange = (frames, code) => frames.every((f) => f.line === -1 || (f.line >= 0 && f.line < code.length));
  for (const algorithm of Object.values(sortingAlgorithms)) {
    assert.ok(inRange(algorithm.frames([5, 1, 4, 2, 8]), algorithm.code), algorithm.label);
  }
  assert.ok(inRange(binarySearchFrames([1, 3, 5, 7], 5), binarySearchCode));
  assert.ok(inRange(binarySearchFrames([1, 3, 5, 7], 4), binarySearchCode));
  for (const mode of ['bfs', 'dfs']) {
    const frames = gridTraversalFrames({ rows: 3, cols: 3, walls: new Set(), start: [0, 0], goal: [2, 2], mode });
    assert.ok(inRange(frames, traversalCode(mode)), mode);
  }
});
