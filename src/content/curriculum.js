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

// `demo` names an interactive panel in src/demos/index.js. It is optional.
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
        markdown: arraysAndStrings,
        demo: 'array-ops',
        languageExamples: arrayLanguageExamples,
      },
      {
        id: 'linked-lists',
        title: 'Linked Lists',
        summary: 'Nodes and pointers: cheap inserts at the front, slow lookups.',
        markdown: linkedLists,
        demo: 'linked-list',
      },
      {
        id: 'stacks-and-queues',
        title: 'Stacks and Queues',
        summary: 'Last in first out versus first in first out, and where each shows up.',
        markdown: stacksAndQueues,
        demo: 'stack-queue',
      },
      {
        id: 'hash-tables',
        title: 'Hash Tables',
        summary: 'Keys, hash functions, buckets, collisions and load factor.',
        markdown: hashTables,
        demo: 'hash-table',
      },
      {
        id: 'binary-search-trees',
        title: 'Binary Search Trees',
        summary: 'Sorted data in a tree shape, and why height decides the cost.',
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
        markdown: bigO,
        demo: 'growth',
      },
      {
        id: 'binary-search',
        title: 'Binary Search',
        summary: 'Halve a sorted range each step: O(log n) you can watch.',
        markdown: binarySearch,
        demo: 'binary-search',
      },
      {
        id: 'sorting',
        title: 'Sorting',
        summary: 'Bubble, selection, insertion and merge sort, step by step.',
        markdown: sorting,
        demo: 'sorting',
      },
      {
        id: 'graph-traversal',
        title: 'Graph Traversal',
        summary: 'Breadth-first and depth-first search: a queue versus a stack.',
        markdown: graphTraversal,
        demo: 'grid-traversal',
      },
    ],
  },
];
