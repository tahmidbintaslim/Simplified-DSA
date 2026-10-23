# Simplified DSA

**Live demo:** [dsa.tahmid.space](https://dsa.tahmid.space) (working demo, 2 lessons so far)

Simplified DSA is a beginner-friendly core computer science learning app built with Vite, plain HTML, CSS, JavaScript, and Markdown.

## What exists today

- 2 lessons: Arrays and Strings (Data Structures) and Big O (Algorithms).
- The Arrays lesson has read-only tabs that show the same array in 10 languages (JavaScript, Python, C, C++, Java, Go, Rust, C#, Kotlin, Swift), each with a runtime note, a memory note and a source link.
- Each lesson has its own URL, so a refresh or a shared link opens the same lesson.

Not built yet: more lessons, visualizers, quizzes and a code runner. See the [Project Plan](./PLAN.md).

## Goals

The project has two learning goals. The app covers a small part of the first one today.

1. Help end users learn DSA, memory, language runtimes, compiler/interpreter ideas, CPU/RAM basics, and operating-system connections through clear explanations and interactive practice.
2. Help contributors learn JavaScript, OOP, clean code, CSS, documentation, and deployment by working inside a small real project.

## Tech Stack

- Vite
- Plain JavaScript with ES modules
- Hand-written CSS, with Tailwind CSS v4 only for its base reset
- Markdown content files
- Node's built-in test runner (`node --test`)
- Vercel for deployment
- pnpm for package management

## Run Locally

```bash
pnpm install
pnpm dev
```

Open:

```text
http://127.0.0.1:3000/
```

Each lesson lives at `/<section>/<lesson>`, for example `http://127.0.0.1:3000/algorithms/big-o`.

## Test

```bash
pnpm test
```

The tests cover the Markdown renderer and the lesson URL helpers.

## Build

```bash
pnpm build
```

The production output goes to `dist/`.

## Deploy Preview

```bash
pnpm dlx vercel deploy -y --target preview
```

Use preview deployments while building. Use production deploys only when the team agrees.

## Project Structure

```text
src/
  core/
    App.js
    router.js
  content/
    curriculum.js
    data-structures/
    algorithms/
  utils/
    markdown.js
  main.js
  style.css
tests/
```

Read these before contributing:

- [Project Plan](./PLAN.md)
- [Contributor Guide](./docs/CONTRIBUTING.md)
- [JavaScript and OOP Guide](./docs/JS_OOP_GUIDE.md)
- [Content Guide](./docs/CONTENT_GUIDE.md)
- [Sources and Learnings](./docs/SOURCES_AND_LEARNINGS.md)
- [Language Comparison Guide](./docs/LANGUAGE_COMPARISON_GUIDE.md)
- [CSS Guide](./docs/CSS_GUIDE.md)
- [Learning Experience Guide](./docs/LEARNING_EXPERIENCE.md)

## License

- Code (the app and every code example, including snippets inside lessons) is under the [MIT License](./LICENSE).
- Lesson text (the Markdown files in `src/content/` and the prose notes in `src/content/languageExamples.js`) is under [CC BY 4.0](./LICENSE-CONTENT). You can reuse and adapt it with credit.

By contributing, you agree that your code is licensed under MIT and your lesson text under CC BY 4.0.
