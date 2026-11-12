# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: complete beginners.** Students and junior developers with no data-structures or algorithms background, usually learning alone, often on a phone. Their job: understand an idea well enough to explain it and predict what it does, not memorise it.
- **Also served: interview preppers.** Developers who already code and want patterns, costs and the "when to use it" signals quickly before interviews. They need shortcuts (the Interview Patterns section, cost tables, step demos they can drive themselves) without the beginner path getting in their way.
- Design for the beginner path first; give preppers fast ways around it, never a separate denser product.

## Product Purpose

A free, open learning site that teaches data structures, algorithms and interview patterns so a beginner can see and predict every step, not just read about it. Success means a learner can trace an algorithm by hand, state what each step costs, and recognise when to reach for it.

## Positioning

**See every step.** Every idea is traced step by step: drawn arrays with pointer labels, a plain-words caption for every step, and pseudocode with the running line highlighted beside live variables, all driven by the same tested algorithm code. The same traces power the AI tutor (MCP connector, Claude plugin and `dsa-tutor` skill), so the site and the tutor never disagree.

## Operating Context

- Self-paced study: one lesson at a time (10–18 minutes), on a phone between classes or at a desk.
- Lesson flow: analogy → small example traced by hand → quick quiz → interactive demo → brute force vs better → when to use it → cost table → common mistakes.
- Learners drive demos themselves (Step, Back, Play, arrow keys, their own input) and mark lessons complete; progress stays in their browser.
- Some learners continue in Claude with the connector at `https://dsa.tahmid.space/mcp` or the Claude Code plugin.

## Capabilities and Constraints

- Existing stack (from the codebase): vanilla JavaScript + Vite, Markdown lessons rendered by a small escaping renderer, no JS framework, deployed on Vercel. Hard constraint not yet confirmed by the owner; keep it unless they decide otherwise.
- Lessons: 11 across Data Structures, Algorithms and Interview Patterns, each with an inline demo, quizzes and traced examples.
- No accounts, no analytics, no tracking (see `public/privacy.html`). Progress is stored only in the learner's browser.
- Terminology used consistently: lesson, demo, step, trace, pattern, cost (Big O).
- Open decisions: rename (waits for user research), light vs dark theme, a home/course-map page.

## Brand Commitments

- Name: "Simplified DSA" (kept until user research; see `docs/STRATEGY.md`).
- Voice: plain words, short sentences, analogy first, every claim paired with its cost, warm and patient (`docs/CONTENT_GUIDE.md`).
- State colours already carry meaning in every lesson and demo: gold = looking at it, teal = moved / done / on the path, grey = ruled out. Future visual work should keep these meanings even if the hues change.
- Assets: tree icon with a highlighted search path (`public/icon.png`, plugin icon), share image (`public/og.png`).

## Evidence on Hand

- 11 lessons with traced examples, quizzes and demos (`src/content/`).
- Design critique: 25/40, priority issues and personas (`.impeccable/critique/`).
- Research on how VisuAlgo, Hello Interview, InterviewRank, AlgoMaster and Expora teach (summarised in PR #14).
- No testimonials, user numbers or learner research yet. Do not invent any.

## Product Principles

1. **Show the step, then name it.** A learner sees what happens before the term or the Big O arrives.
2. **Every number is real.** Captions, counts and traces come from running the actual algorithm, never from hand-typed claims.
3. **Beginner path first, shortcuts second.** Nothing a prepper needs should make the first lesson harder for a beginner.
4. **Predict, then reveal.** Quizzes and demos ask the learner to think before showing the answer.
5. **Free and private by default.** No account, no tracking, open source.

## Accessibility & Inclusion

- WCAG 2.1 AA as the floor: contrast, keyboard use for every demo, screen-reader captions for every step, colour never the only signal.
- Respect `prefers-reduced-motion`.
- Phone-first layouts at 390px with 44px touch targets; learners on slow phones and connections.
