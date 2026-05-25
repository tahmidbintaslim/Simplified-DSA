# Simplified DSA - Platform Plan

## Vision

Simplified DSA is a slow, beginner-friendly core computer science learning platform. The product starts with Data Structures and Algorithms, then connects each idea to programming languages, memory, CPU behavior, operating systems, compilers, interpreters, bytecode, and machine code.

The goal is not to become a heavy course platform early. The goal is to make each data structure and algorithm feel understandable before adding more technology.

The codebase is also a teaching tool. Collaborators should be able to learn HTML, CSS, JavaScript, OOP, clean code, Git, Vercel deployment, and core CS by reading and extending the project.

## Current Stack

- **Runtime:** Vite
- **UI:** Plain HTML, CSS, and modern JavaScript
- **Content:** Markdown files stored in `src/content`
- **Deployment:** Vercel preview deployments
- **Package Manager:** pnpm

## Current Product Shape

The first version has two learning sections:

1. **Data Structures**
   - What data structures are
   - Arrays and Strings
   - Later: Linked Lists, Stacks, Queues, Hash Tables, Trees, Heaps, Graphs

2. **Algorithms**
   - What algorithms are
   - Big O and complexity
   - Later: Searching, Sorting, Recursion, Two Pointers, Sliding Window, Graph Traversal

Each topic should be written in our own voice after researching trusted references. Source links can live inside the Markdown so we remember where facts came from without copying another explanation.

## Language Strategy

The platform is not a JavaScript, Python, or C++ course. It teaches the core idea first, then shows how popular languages express the idea.

Initial language set:

1. JavaScript
2. Python
3. C
4. C++
5. Java
6. Go
7. Rust
8. C#
9. Kotlin
10. Swift

Each data structure lesson should answer:

- What is the core CS concept?
- How does the computer represent it in memory?
- How do different languages expose it through syntax and standard libraries?
- Which languages use fixed arrays, dynamic arrays, slices, vectors, lists, or managed objects?
- What does the compiler, interpreter, VM, runtime, or garbage collector do?
- What does the CPU or RAM care about?

The first implementation uses read-only language comparison tabs. A real editor and runner can come later.

## Engineering Principles

### Keep It Simple

Use Vite, HTML, CSS, and JavaScript until the product proves it needs more. Do not migrate to React, Next.js, or any other framework by default.

### Clean Code

- Keep files small and focused.
- Prefer clear names over comments.
- Use modern ES modules and classes where state or behavior needs a home.
- Keep DOM rendering separate from domain logic when the logic grows.
- Avoid clever abstractions with only one use.
- Write less code when less code stays readable.
- Add beginner-friendly documentation when introducing a project pattern.
- Add comments when they teach why the code is shaped a certain way.

### JavaScript Style

- Use modern ES syntax.
- Use OOP for app modules, renderers, and future visualizers.
- Keep data in plain objects and arrays when that is enough.
- Avoid global state except for the top-level app instance.
- Use private helper methods when they reduce repetition inside a class.

### CSS Style

- Prefer readable custom CSS for the app shell and lesson UI.
- Tailwind and DaisyUI are installed, but they are not a reason to fill HTML with long class strings.
- Use stable spacing, readable type, and direct hierarchy.
- Avoid decorative UI that distracts from learning.

## Architecture

```text
src/
  core/
    App.js              App coordinator and screen rendering
  content/
    curriculum.js       Lesson registry and raw Markdown imports
    languageExamples.js Language-specific code and runtime notes
    data-structures/    Data structure lessons
    algorithms/         Algorithm lessons
  utils/
    markdown.js         Small Markdown-to-HTML renderer
  style.css             App styles
  main.js               Browser entry point
```

This structure should stay simple until the app has enough real features to justify deeper modules.

## Research Sources

Use outside references to check facts, then write original explanations:

- OpenDSA for DSA concepts and educational framing
- Open Data Structures for implementation-oriented explanations
- CP-Algorithms for algorithm references
- Official language documentation for language syntax and standard library behavior
- MDN for JavaScript behavior
- Curated DSA and system-design sources listed in `docs/SOURCES_AND_LEARNINGS.md`
- Other sources only when they add clarity and are linked in the lesson

## Learning Experience Strategy

The app should support multiple learning modes without treating "learning styles" as fixed boxes. Each topic should grow toward:

- Written explanations
- Visual diagrams or animations
- Interactive practice
- Logical reasoning prompts
- Self-study prompts
- Pair or group discussion prompts
- Future narration scripts
- Language comparison tabs
- Memory and runtime diagrams

This follows a multimodal and Universal Design for Learning direction: multiple ways to access and practice the same idea.

## Near-Term Roadmap

- [x] Keep the project on Vite, plain JavaScript, CSS, and Markdown.
- [ ] Build the first real learning shell with Data Structures and Algorithms sections.
- [ ] Write the first Data Structures lesson: Arrays and Strings.
- [ ] Write the first Algorithms lesson: Big O.
- [ ] Add contributor docs for HTML, CSS, JavaScript, OOP, content, Git, and deployment.
- [ ] Add language comparison tabs for the Arrays lesson.
- [ ] Add the first small interactive visualizer after the concept and language comparison shape feel right.
- [ ] Add a browser editor after we define safe execution and language support.
- [ ] Deploy preview builds to Vercel.

## Future Evaluation

Only revisit larger framework choices after the plain Vite app starts to strain.

Possible future directions:

- **React + TanStack Router/Query:** If the app needs complex client state, nested routes, or data loading patterns.
- **Next.js:** If the app needs server rendering, content indexing, auth, database-backed progress, or stronger SEO pages.
- **MDX:** If lessons need embedded interactive components inside Markdown.

Framework migration is a product decision, not a default engineering move.
