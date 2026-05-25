import arraysAndStrings from './data-structures/arrays-and-strings.md?raw';
import bigO from './algorithms/big-o.md?raw';
import { arrayLanguageExamples } from './languageExamples.js';

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
        languageExamples: arrayLanguageExamples,
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
      },
    ],
  },
];
