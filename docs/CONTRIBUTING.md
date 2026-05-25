# Contributor Guide

This project is intentionally beginner friendly. Write code that a new HTML, CSS, and JavaScript learner can read.

## Working Rules

1. Make one small change at a time.
2. Run `pnpm build` before saying the change works.
3. Keep file names clear.
4. Prefer simple code over clever code.
5. Add a short comment when a beginner would not understand why something exists.
6. Do not add a framework unless the team decides together.

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm dlx vercel deploy -y --target preview
```

## How To Commit

Check changed files:

```bash
git status -sb
git diff
```

Stage only the files that belong to the change:

```bash
git add README.md docs src
```

Commit with a short message:

```bash
git commit -m "Build first DSA learning shell"
```

Push when the team is ready:

```bash
git push
```

## Commit Message Style

Use simple messages:

```text
Add arrays lesson
Fix mobile lesson layout
Document Markdown lesson workflow
```

Avoid vague messages:

```text
updates
fix stuff
changes
```

## How To Add A New Lesson

1. Create a Markdown file in the right folder.
2. Add that file to `src/content/curriculum.js`.
3. Add language examples in `src/content/languageExamples.js` when the concept has meaningful language differences.
4. Run `pnpm dev` and click the lesson in the browser.
5. Run `pnpm build`.
6. Commit the lesson and registry update together.

Example folders:

```text
src/content/data-structures/hash-tables.md
src/content/algorithms/binary-search.md
```

## Lesson Quality Bar

Every core lesson should teach more than syntax:

- Core CS idea
- Memory or hardware connection
- Runtime, compiler, interpreter, or VM connection when relevant
- Language differences
- Complexity and tradeoffs
- Sources checked

## Deployment Workflow

Use preview deploys for normal work:

```bash
pnpm dlx vercel deploy -y --target preview
```

After deploy, inspect the URL:

```bash
pnpm dlx vercel inspect <deployment-url>
```

Only use production deploy when the team agrees:

```bash
pnpm dlx vercel deploy --prod
```
