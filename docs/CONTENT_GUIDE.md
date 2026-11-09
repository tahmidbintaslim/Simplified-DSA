# Content Guide

Lessons live as Markdown files. The app imports those files and renders them in the browser. Language-specific examples live beside the lessons as JavaScript data.

## Folder Rules

Data structure lessons:

```text
src/content/data-structures/
```

Algorithm lessons:

```text
src/content/algorithms/
```

The lesson registry lives here:

```text
src/content/curriculum.js
```

Language examples live here:

```text
src/content/languageExamples.js
```

## Add A Data Structure Lesson

Create a file:

```text
src/content/data-structures/hash-tables.md
```

Write the lesson:

```markdown
# Hash Tables

Hash tables store values by key.

## The Core Idea

Use a hash function to turn a key into an array index.

## What To Remember

- Lookup is usually fast.
- Collisions must be handled.
- Hash tables trade memory for speed.

## Sources Checked

- [Open Data Structures](https://opendatastructures.org/)
```

Register it in `src/content/curriculum.js`:

```javascript
import hashTables from './data-structures/hash-tables.md?raw';

export const curriculum = [
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Ways to organize data so operations become easier to reason about.',
    lessons: [
      {
        id: 'hash-tables',
        title: 'Hash Tables',
        summary: 'Keys, hashing, collisions, and lookup tradeoffs.',
        markdown: hashTables,
      },
    ],
  },
];
```

If the lesson has language examples, import and attach them:

```javascript
import { hashTableLanguageExamples } from './languageExamples.js';

{
  id: 'hash-tables',
  title: 'Hash Tables',
  summary: 'Keys, hashing, collisions, and language runtime differences.',
  markdown: hashTables,
  languageExamples: hashTableLanguageExamples,
}
```

## Add An Algorithm Lesson

Create a file:

```text
src/content/algorithms/binary-search.md
```

Register it:

```javascript
import binarySearch from './algorithms/binary-search.md?raw';
```

Then add a lesson object under the `algorithms` section.

## Lesson Template

Use this shape for most lessons:

````markdown
# Topic Name

One language-neutral explanation of what this is.

## The Core Idea

Explain the concept with one small example.

## How The Computer Sees It

Explain memory, CPU, runtime, compiler, interpreter, bytecode, or garbage collection connections when useful.

## Why It Works

Explain the rule, pattern, or tradeoff.

## Language Examples

Explain that users can compare syntax and runtime behavior in the language tabs below the lesson.

## What To Remember

- One important point.
- Another important point.

## Practice Prompt

Ask one small question the learner can answer.

## Sources Checked

- [Source name](https://example.com)
````

## Research Rules

Use trusted sources to check facts. Then write our own explanation.

Good sources:

- OpenDSA
- Open Data Structures
- CP-Algorithms
- Official language documentation
- MDN for JavaScript behavior
- University course notes when relevant
- Curated repositories and roadmaps listed in [Sources and Learnings](./SOURCES_AND_LEARNINGS.md)

Do not copy another site. Read, understand, then explain in our voice.

## Language-Neutral Writing Rules

Use language-neutral terms before syntax:

- Say "array-like structure" before saying "JavaScript Array" or "Python list".
- Say "growable sequence" before saying "vector", "slice", or "list".
- Say "runtime checks the index" before naming Java, C#, or JavaScript.
- Say "compiler emits machine code" before naming C, C++, Go, Rust, or Swift.

This helps learners understand the concept before they compare languages.

## Markdown Support

The current renderer supports:

- `# Heading`
- `## Heading`
- Paragraphs
- Bullet lists
- Code blocks
- Inline code
- Links
- Bold text

If a lesson needs tables, images, or callouts, update `src/utils/markdown.js` first and document the new syntax here.

## Add An Interactive Demo

Demos live in `src/demos/`:

- `algorithms.js` holds the algorithm itself as a pure function with no DOM access. Step-by-step algorithms return an array of frames: a snapshot of state plus a `caption` that explains the step. Add a test in `tests/algorithms.test.js`.
- `player.js` gives any frame-based demo Back, Play, Step and speed controls. Call `createPlayer(root, drawFrame)` and then `player.load(frames)`.
- `index.js` holds one `mount(element)` function per demo and the `demos` registry.

To attach a demo to a lesson, add its id to the lesson in `curriculum.js`:

```javascript
{
  id: 'hash-tables',
  title: 'Hash Tables',
  markdown: hashTables,
  demo: 'hash-table',
}
```

Demo rules:

- Build the controls once and redraw only the picture, so keyboard focus stays on the button the learner pressed.
- Put the explanation in an `aria-live="polite"` caption. Say what happened and what it cost, for example "3 values shifted right: O(n)".
- Escape anything the learner types with `escapeHtml` before it goes into HTML.
- Cap sizes (values, nodes, keys) so the picture fits on a phone.

## After Changing Lessons Or Demo Algorithms

The Claude Code plugin ships its own copy of the lessons and a bundled MCP server. Rebuild it and commit the result, or CI fails:

```bash
pnpm build:plugin
```
