# Strategy: Product, Brand, Tech, Legal and AI

A working plan, not a commitment. Each section ends with the next concrete step. Decisions are marked **Decide**; they belong to the maintainer.

## 1. Product

**One-line pitch:** See every step. Data structures and algorithms explained in plain words, with a demo you can poke on every page.

**Who it is for (in order):**

- Self-taught developers and bootcamp grads who use arrays and maps daily but never learned why they behave the way they do.
- CS students in their first DSA course who need intuition before the formal proofs.
- Interview preppers who memorised patterns but cannot explain them.

**What makes it different:** most visualizers show animation without explanation, and most courses show explanation without interaction. Here every step has a caption that says what happened and what it cost (`3 values shifted right: O(n)`), and the same idea is compared across 10 languages down to memory layout.

**Non-goals for now:** accounts, a full online judge, video, gamification beyond simple progress.

**Next step:** ship the 9 lessons + demos, then pick the next 5 lessons from user research (section 3), not from a list.

## 2. Name

"Simplified DSA" is descriptive and honest, but generic, hard to trademark and hard to search for.

Candidate directions (all unchecked; see the legal check below):

- Keep **Simplified DSA** as the product, and use a short tagline ("see every step").
- A step/trace name: something that says "you watch the algorithm think".
- A lens/look name: something that says "see inside the data structure".

**Decide:** whether to rename at all. Recommendation: do not rename until 20+ real learners have used it; rename once, before any marketing push.

**Before adopting any name:** search the USPTO/EUIPO trademark databases, GitHub, npm, the App Store and the domain registrars. Avoid names close to existing learning brands.

## 3. User research

Cheap and fast, in this order:

- **5 think-aloud sessions** (30 minutes each): give a learner one lesson and its demo, ask them to explain the idea back. Note where they get confused, not what they like.
- **One question on every lesson page:** "Did the demo make this clearer? Yes / No / Comment." Store answers with a privacy-friendly tool (see section 7), no accounts.
- **Watch where people already ask:** r/learnprogramming, r/cscareerquestions, CS Discords. Collect the exact phrases people use when stuck ("why is a hash map O(1)?"). Those phrases become lesson titles and SEO.
- **Measure:** lesson completion (scrolled to "What To Remember"), demo interactions per visit, return visits within 7 days.

**Next step:** recruit 5 learners from your own network and run the think-alouds on the Arrays and Hash Tables lessons.

## 4. Brand and design

The current look (warm dark, gold accent, calm type) already reads as "patient teacher", which fits. Keep it and make it consistent:

- **Voice:** short sentences, plain words, every claim paired with a cost. Already written down in `docs/CONTENT_GUIDE.md`.
- **Colour meaning, used everywhere:** gold = the thing being touched, teal = moved / on the path / done, grey = ruled out. The demos follow this; diagrams and future social images should too.
- **Missing pieces:** a light theme (many students study in daylight), a logo mark, an Open Graph image per lesson so shared links look good, and colour tokens as CSS variables instead of repeated hex values.
- **Accessibility as a feature:** keyboard-usable demos, live captions, reduced-motion support. Say so on the home page; few competitors do.

**Next step:** move colours into CSS custom properties, then add the light theme.

## 5. Tech stack

The current stack (Vite, plain JS, Markdown, Vercel) is the right size. Keep it until a real need forces a change.

| Need | When it arrives | Smallest fitting choice |
| --- | --- | --- |
| Progress tracking | Learners ask to resume | `localStorage` first, no accounts |
| Quizzes | After user research | Quiz data in the lesson Markdown, checked in the browser |
| Run learner code | Many learners ask | JS in a sandboxed Web Worker; Python via Pyodide. No server execution |
| Search | 30+ lessons | Build-time index (e.g. MiniSearch) |
| SEO / share previews | Before marketing | Pre-render each lesson to static HTML at build time |
| AI tutor | See section 8 | One Vercel serverless function calling the Claude API |
| Accounts | Only if sync across devices is demanded | A hosted auth provider; never hand-rolled |

The demo algorithms in `src/demos/algorithms.js` are pure functions. That is the most valuable technical asset: the same code can power the website, tests, an MCP server and AI tools (section 8).

## 6. Marketing

Teaching content markets itself if it is shareable:

- **One demo per post.** A 10-second screen recording of BFS vs DFS or the degenerate BST beats any ad. Post to X, LinkedIn, Reddit (follow each subreddit's self-promotion rules), and dev.to with a short written explainer.
- **Embeddable demos.** Let teachers and bloggers embed a demo with an `<iframe>` and a credit link. Every embed is a backlink.
- **SEO on real questions** collected in user research ("why is binary search log n").
- **Open source as marketing:** "good first issue" labels on new lessons and demos, a contributor wall, Hacktoberfest participation.
- **Educators:** email 10 university TAs offering the demos free for their course.

**Next step:** record and post the BST "sorted inserts" demo; it is the clearest "aha" moment.

## 7. Open source and legal

Not legal advice. For anything with money or personal data involved, ask a lawyer.

- **Licences are already sound:** code under MIT, lesson text under CC BY 4.0 (`LICENSE`, `LICENSE-CONTENT`). Keep that split. Add a short `CONTRIBUTING` note that contributions are accepted under the same licences (inbound = outbound); a CLA is not needed at this size.
- **Content sources:** keep writing in our own voice and listing sources. Never paste text, figures or problem statements from books, courses or LeetCode-style sites. Problem *ideas* are fine; their wording is not.
- **Trademarks:** check the name (section 2) before investing in a brand. Mentioning language names (Rust, Java, Python) descriptively is fine; do not use their logos.
- **Privacy:** today the site collects nothing. If analytics are added, choose a cookieless tool, add a privacy page, and avoid collecting anything that identifies a person. Accounts or emails bring GDPR (EU) obligations; a site aimed at under-13s brings COPPA (US) ones, so state the audience is 13+.
- **AI features:** follow the model provider's usage policies, label AI-generated answers as such, rate-limit the endpoint, and never put API keys in the browser.
- **Security:** keep Dependabot, CodeQL and the HTML-escaping Markdown renderer. Any code runner must stay in the browser sandbox.

## 8. Claude skills, MCP, plugin, connector and AI learning

Yes, this project fits all four, and they build on each other. The key is to reuse the same pure functions, so the website, the tests and the AI tools never disagree.

**8.1 MCP server (build first).** A small Node package, `simplified-dsa-mcp`, that exposes:

- *Resources:* every lesson's Markdown, addressable as `dsa://data-structures/hash-tables`.
- *Tools:* `list_lessons`, `get_lesson(id)`, `trace_algorithm(name, input)` (returns the same frames and captions the website shows, from `algorithms.js`), and `practice_problem(topic, level)` that returns a problem from a curated, original problem bank.

Because the traces come from real code, an AI tutor can answer "show me merge sort on [5, 2, 9, 1]" with exact, checkable steps instead of guessing.

**8.2 Connector.** Host the same MCP server remotely (one Vercel function, read-only, no auth needed for public lessons). Anyone can then add it as a custom connector in Claude and ask questions grounded in the lessons.

**8.3 Claude Skill.** A `dsa-tutor` skill (a `SKILL.md` plus examples) that tells Claude *how* to teach with this material: ask the learner to predict the next step before revealing it, explain cost after every operation, use the trace tool instead of mental simulation, and end with one practice prompt. A second skill, `dsa-lesson-author`, encodes `docs/CONTENT_GUIDE.md` so contributors can draft new lessons and demos in the house style.

**8.4 Plugin.** Bundle the MCP server, both skills and slash commands (`/trace merge-sort 5 2 9 1`, `/quiz hash-tables`, `/explain-cost <code>`) into one Claude Code plugin, so a learner or contributor installs everything at once.

**8.5 AI inside the website (later, after research shows demand).**

- *Ask about this step:* a button on each demo frame that sends the frame and caption to a tutor and asks "why?". Grounded in the frame, so answers stay accurate.
- *Explain my code's Big O:* paste a function, get the growth class and the line that causes it.
- *Generated practice:* new inputs for the demos and fresh practice prompts, checked by running the real algorithm before showing the answer.
- *Make an artifact:* "turn this lesson into flashcards / a one-page cheat sheet / an interactive page" via Claude, for learners to keep.

Cost and safety rules: server-side key only, per-IP rate limits, a daily budget cap, and a clear "AI-generated" label.

**Status:** the MCP server (`mcp/server.js`, without `practice_problem` yet) and the `dsa-tutor` skill are built. Next: the plugin bundle.

**Suggested order:** MCP server (reuses `algorithms.js`, a few hundred lines) → `dsa-tutor` skill → plugin bundle → hosted connector → in-site AI, only once there are users asking for it.
