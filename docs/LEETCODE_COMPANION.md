# Plan: Practice Companion Browser Extension

A browser extension that sits beside coding-practice sites (LeetCode first) and turns each problem into a lesson: which pattern it uses, a hint ladder instead of a full answer, a visual demo of the idea, and an automatic, well-organised GitHub record of what you solved.

Status: plan only. Nothing here is built.

## Problems it solves

- "I solved 200 problems and remember none of them." → Every accepted solution is saved to the learner's GitHub with their approach, cost and date, plus a review queue.
- "I'm stuck, but the editorial spoils everything." → A hint ladder: nudge → pattern → approach → pseudocode. Full code only on request.
- "I don't know which pattern this is." → Each problem maps to a pattern and to the matching Simplified DSA lesson and demo.
- "My solution passed, but is it good?" → A Big O check of the learner's own code, naming the line that sets the cost.
- "My GitHub doesn't show my practice." → A clean repository: one folder per problem, a generated README index, consistent commits.

Tools that sync solutions to GitHub already exist. Ours is different because it teaches: the pattern mapping, hint ladder, cost check and visual demos. We build our own design and name and copy no other extension's code, look or branding.

## Rules we set before writing code

- **Read the site's terms first.** Our automated check could not open LeetCode's terms page (it returned 403). Read the current Terms of Service and contest rules by hand before building. Use these defaults until they are confirmed:
  - **No AI help during live contests.** The extension detects contest pages and switches hints off there.
  - **No copying problem content.** Problem statements are never stored on our servers or committed to GitHub. The synced repo holds the learner's own code and notes, plus a link back to the problem.
  - **No scraping or bulk access.** The extension only reads the page the learner has open, and only when they act.
- **Privacy:** the extension's single purpose is "help me learn from the problem I'm on". It sends nothing until the learner presses a button, and says what is sent and where. It collects no browsing history. It follows the Chrome Web Store [Limited Use policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use) and publishes a privacy page.
- **Naming:** don't put another company's brand in our product name or use its logo. "Works with LeetCode" as a plain description, once checked against their trademark guidance.
- **Secrets:** API keys and GitHub tokens live only in the learner's browser (`chrome.storage.local`) or on our server, never in the extension's code.

## Architecture

- **Manifest V3 extension** for Chrome and Edge. Firefox later through the WebExtensions API.
  - A content script reads the open problem (title, slug, difficulty, tags, the learner's code) and watches for an "Accepted" result.
  - A side panel shows the UI: pattern, hints, cost check, demo link and sync status.
  - A service worker handles the GitHub API and AI calls.
- **GitHub sync** uses a GitHub App with OAuth device flow, limited to one repository the learner picks. A fine-grained personal access token is the fallback.
  - On "Accepted", commit `<pattern>/<slug>/solution.<ext>` and `notes.md` (approach, time and space cost, date, attempts).
  - The same commit regenerates the root `README.md` index.
  - Sync is idempotent: the same solution never creates a second commit.
- **Pattern mapping:** a small, hand-curated table from problem tags and slugs to our patterns and lessons (two pointers, sliding window, BFS and so on). It ships in the extension and is open source, so contributors can add entries.
- **AI, in stages:**
  - v1, no backend: a button builds a well-structured tutoring prompt for the current problem. The learner opens it in Claude, where the Simplified DSA connector and the `dsa-tutor` skill do the teaching. Zero cost to us and no data handling.
  - v2, bring your own key: hints and the cost check call the Claude API directly with the learner's key.
  - v3, hosted: our serverless proxy with per-user rate limits and a daily budget cap. Build only once people demonstrably use v2.
- **Shared code:** the Big O explanations, lesson links and traces come from the same `src/demos/algorithms.js` and MCP tools, so the website, plugin and extension agree.

## Phases

| Phase | Ships | Done when |
| --- | --- | --- |
| 0. Groundwork | Terms reviewed, privacy page, pattern table for ~50 classic problems | Legal defaults confirmed in writing |
| 1. Sync + map | GitHub sync, pattern detection, lesson and demo links, review queue | 10 testers sync 20+ problems each without a duplicate or lost commit |
| 2. Teach | Hint ladder and Big O check (prompt hand-off, then bring-your-own key) | Testers rate hints "helpful without spoiling" in at least 4 of 5 cases |
| 3. Publish | Chrome Web Store and Edge Add-ons listings | Store review passed |
| 4. Grow | Hosted AI, Firefox, more practice sites | Real demand from phase 3 users |

## New lessons this needs on the website

The pattern map should link to lessons that exist. Add them in roughly this order: Two Pointers, Sliding Window, Recursion and Backtracking, Heaps / Priority Queues, Dynamic Programming, Tries, Union-Find, Dijkstra. Each one comes with a demo, like the existing lessons.

## Risks

- **The site changes its page markup** and breaks the content script. Keep the selectors in one file, test them against saved fixture pages, and fail softly with "couldn't read this page" rather than wrong data.
- **Terms change.** Re-check before each store release.
- **AI cost.** v1 and v2 cost us nothing. v3 needs the budget cap before launch.
- **Token safety.** Use the narrowest GitHub scope (one repo, contents only) and offer a one-click disconnect.
