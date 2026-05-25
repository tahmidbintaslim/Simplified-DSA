# Simplified DSA

Simplified DSA is a beginner-friendly core computer science learning app built with Vite, plain HTML, CSS, JavaScript, and Markdown.

The project has two learning goals:

1. Help end users learn DSA, memory, language runtimes, compiler/interpreter ideas, CPU/RAM basics, and operating-system connections through clear explanations and interactive practice.
2. Help contributors learn JavaScript, OOP, clean code, CSS, documentation, and deployment by working inside a small real project.

## Tech Stack

- Vite
- Plain JavaScript with ES modules
- Plain CSS
- Markdown content files
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
  content/
    curriculum.js
    data-structures/
    algorithms/
  utils/
    markdown.js
  main.js
  style.css
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
