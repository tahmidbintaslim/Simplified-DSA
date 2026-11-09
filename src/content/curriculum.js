import arraysAndStrings from './data-structures/arrays-and-strings.md?raw';
import linkedLists from './data-structures/linked-lists.md?raw';
import stacksAndQueues from './data-structures/stacks-and-queues.md?raw';
import hashTables from './data-structures/hash-tables.md?raw';
import binarySearchTrees from './data-structures/binary-search-trees.md?raw';
import bigO from './algorithms/big-o.md?raw';
import binarySearch from './algorithms/binary-search.md?raw';
import sorting from './algorithms/sorting.md?raw';
import graphTraversal from './algorithms/graph-traversal.md?raw';
import { arrayLanguageExamples } from './languageExamples.js';

// `demo` names an interactive panel in src/demos/index.js; a ```demo block in the
// lesson places it, otherwise it follows the text. `level`, `minutes` and `goals`
// fill the lesson header. All of these are optional.
export const curriculum = [
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Ways to organize data so operations become easier to reason about.',
    lessons: [
      {
        id: 'arrays-and-strings',
        title: 'Arrays and Strings',
        summary: 'Core array idea, memory layout, strings, and language differences.',
        level: 'Beginner',
        minutes: 12,
        goals: ['Explain why reading by index is O(1)', 'Count how many values move on insert or delete', 'Treat a string as ordered data you can scan'],
        markdown: arraysAndStrings,
        demo: 'array-ops',
        languageExamples: arrayLanguageExamples,
      },
      {
        id: 'linked-lists',
        title: 'Linked Lists',
        summary: 'Nodes and pointers: cheap inserts at the front, slow lookups.',
        level: 'Beginner',
        minutes: 12,
        goals: ['Draw nodes and pointers for any short list', 'Explain why inserting at the head is O(1)', 'Choose between a linked list and an array'],
        markdown: linkedLists,
        demo: 'linked-list',
      },
      {
        id: 'stacks-and-queues',
        title: 'Stacks and Queues',
        summary: 'Last in first out versus first in first out, and where each shows up.',
        level: 'Beginner',
        minutes: 10,
        goals: ['Predict what comes out of a stack or a queue', 'Match real problems to LIFO or FIFO', 'Explain why a plain array makes a slow queue'],
        markdown: stacksAndQueues,
        demo: 'stack-queue',
      },
      {
        id: 'hash-tables',
        title: 'Hash Tables',
        summary: 'Keys, hash functions, buckets, collisions and load factor.',
        level: 'Beginner',
        minutes: 15,
        goals: ['Hash a key into a bucket by hand', 'Explain collisions and load factor', 'Turn an O(n\u00b2) search into O(n) with a hash set'],
        markdown: hashTables,
        demo: 'hash-table',
      },
      {
        id: 'binary-search-trees',
        title: 'Binary Search Trees',
        summary: 'Sorted data in a tree shape, and why height decides the cost.',
        level: 'Intermediate',
        minutes: 15,
        goals: ['Search and insert by following left and right', 'Explain why tree height decides the cost', 'Spot when a tree degrades into a list'],
        markdown: binarySearchTrees,
        demo: 'bst',
      },
    ],
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Step-by-step ways to solve problems and measure their growth.',
    lessons: [
      {
        id: 'big-o',
        title: 'Big O',
        summary: 'Constant, linear, and quadratic growth without formal noise.',
        level: 'Beginner',
        minutes: 12,
        goals: ['Name the growth shape of a loop or nested loop', 'Simplify costs by dropping constants', 'Spot library calls that hide a loop'],
        markdown: bigO,
        demo: 'growth',
      },
      {
        id: 'binary-search',
        title: 'Binary Search',
        summary: 'Halve a sorted range each step: O(log n) you can watch.',
        level: 'Beginner',
        minutes: 12,
        goals: ['Trace lo, mid and hi by hand', 'Explain why it needs sorted data', 'Avoid the two classic off-by-one bugs'],
        markdown: binarySearch,
        demo: 'binary-search',
      },
      {
        id: 'sorting',
        title: 'Sorting',
        summary: 'Bubble, selection, insertion and merge sort, step by step.',
        level: 'Intermediate',
        minutes: 18,
        goals: ['Trace bubble, insertion and merge sort by hand', 'Compare O(n\u00b2) and O(n log n) sorts', 'Know when insertion sort is the fast choice'],
        markdown: sorting,
        demo: 'sorting',
      },
      {
        id: 'graph-traversal',
        title: 'Graph Traversal',
        summary: 'Breadth-first and depth-first search: a queue versus a stack.',
        level: 'Intermediate',
        minutes: 18,
        goals: ['Run BFS and DFS by hand on a small graph', 'Explain why BFS finds the shortest path', 'Recognise grid problems as graph problems'],
        markdown: graphTraversal,
        demo: 'grid-traversal',
      },
    ],
  },
];
