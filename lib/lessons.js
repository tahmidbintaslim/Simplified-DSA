import { readFileSync } from 'node:fs';
import path from 'node:path';
import { curriculum } from '../src/content/curriculum.js';
import { DEMO_MARKER, escapeHtml, MarkdownRenderer } from '../src/utils/markdown.js';

/**
 * Lessons on the server: find a lesson, read its Markdown from
 * src/content/<section>/<id>.md, and turn it into the article HTML the lesson
 * page shows. The renderer escapes everything first, so lesson text cannot
 * inject HTML (the page sets this string as innerHTML).
 */

export const sections = curriculum;

/** Every lesson in course order, with its section. */
export const allLessons = () => curriculum.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));

export const lessonPath = (sectionId, lessonId) => `/${sectionId}/${lessonId}`;

export function findLesson(sectionId, lessonId) {
  const entries = allLessons();
  const index = entries.findIndex(({ section, lesson }) => section.id === sectionId && lesson.id === lessonId);
  if (index === -1) return null;
  return { ...entries[index], index, previous: entries[index - 1] ?? null, next: entries[index + 1] ?? null, total: entries.length };
}

export function lessonMarkdown(sectionId, lessonId) {
  return readFileSync(path.join(process.cwd(), 'src', 'content', sectionId, `${lessonId}.md`), 'utf8');
}

// "Cost Cheat Sheet" → "cost-cheat-sheet". Tags and entities become spaces, so
// stripped fragments can never join up; the result is only [a-z0-9-].
export const slugify = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The article for one lesson: h1 + lead, then the lesson card (where it sits,
 * how long, goals, jump list), then the text. The paragraph written just
 * before a ```demo block becomes the demo's intro; sources fold away.
 * Returns { html, headings } — the demo itself is mounted on the
 * client into <div data-demo-slot>.
 */
// Heading HTML → plain text for "On this page" (React escapes it again when rendering).
// Tags become spaces, stray angle brackets go, then the renderer's entities are decoded.
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const plainText = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim();

export function buildArticle(markdown, { section, lesson, demo }) {
  const jumps = [
    lesson.demo && ['demo-title', 'Demo'],
    /\*\*When to use it:\*\*/.test(markdown) && ['when-to-use', 'When to use it'],
    /^## Cost Cheat Sheet$/m.test(markdown) && ['cost-cheat-sheet', 'Cost'],
    /^## What To Remember$/m.test(markdown) && ['what-to-remember', 'Key points'],
    /^## Practice Prompt$/m.test(markdown) && ['practice-prompt', 'Practice'],
  ].filter(Boolean);
  const position = section.lessons.indexOf(lesson) + 1;
  const header = `
    <header class="lesson-header">
      <p class="lesson-meta">
        <span>${escapeHtml(section.title)} · Lesson ${position} of ${section.lessons.length}</span>
        ${lesson.minutes ? `<span>About ${lesson.minutes} min</span>` : ''}
        ${lesson.level ? `<span class="lesson-level">${escapeHtml(lesson.level)}</span>` : ''}
      </p>
      ${lesson.goals?.length ? `<div class="lesson-goals"><p>You will be able to:</p><ul>${lesson.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}</ul></div>` : ''}
      ${jumps.length ? `<nav class="lesson-jumps" aria-label="Jump to"><span>Jump to</span>${jumps.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>` : ''}
    </header>`;

  let html = new MarkdownRenderer()
    .render(markdown)
    .replace(/<h2>((?!Sources Checked<)[\s\S]*?)<\/h2>/g, (_, text) => `<h2 id="${slugify(text)}">${text}</h2>`)
    .replace('<aside class="callout callout-when-to-use-it">', '<aside class="callout callout-when-to-use-it" id="when-to-use">');
  const opening = /(<h1>[\s\S]*?<\/h1>)<p>([\s\S]*?<\/p>)/;
  html = opening.test(html) ? html.replace(opening, (_, title, lead) => `${title}<p class="lead">${lead}${header}`) : header + html;

  let demoIntro = null;
  html = html.replace(/<p>((?:(?!<p>)[\s\S])*?)<\/p>(?=<div data-demo-here><\/div>)/, (_, text) => {
    demoIntro = text;
    return '';
  });
  html = html.replace(/<h2>Sources Checked<\/h2>(<ul>[\s\S]*?<\/ul>)/, '<details class="sources"><summary>Sources checked</summary>$1</details>');

  // The demo panel goes where the lesson placed it, or after the text.
  if (lesson.demo) {
    const panel = `
      <section class="demo-panel" aria-labelledby="demo-title">
        <div class="language-panel-header">
          <h2 id="demo-title">Try it: ${escapeHtml(demo?.title ?? 'the demo')}</h2>
          ${demoIntro ? `<p>${demoIntro}</p>` : demo?.intro ? `<p>${escapeHtml(demo.intro)}</p>` : ''}
        </div>
        <div data-demo-slot></div>
      </section>`;
    html = html.includes(DEMO_MARKER) ? html.replace(DEMO_MARKER, () => panel) : html + panel;
  }

  const headings = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(([, id, text]) => ({
    id,
    text: plainText(text).replace(/^Try it: /, 'Demo: '),
  }));
  return { html, headings };
}
