import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { dict } from './i18n.js';
import { DEMO_MARKER, escapeHtml, MarkdownRenderer } from '../src/utils/markdown.js';

/**
 * Lessons on the server: find a lesson, read its Markdown from
 * src/content/<section>/<id>.md, and turn it into the article HTML the lesson
 * page shows. The renderer escapes everything first, so lesson text cannot
 * inject HTML (the page sets this string as innerHTML).
 */

export { allLessons, course, findLesson, lessonPath } from './course.js';

/**
 * The lesson's Markdown in `lang`: src/content/bn/<section>/<id>.md for Bangla,
 * falling back to the English file (fallback: true) until it is written.
 */
export function lessonMarkdown(lang, sectionId, lessonId) {
  const file = (...dirs) => path.join(process.cwd(), 'src', 'content', ...dirs, sectionId, `${lessonId}.md`);
  const local = lang === 'en' ? null : file(lang);
  if (local && existsSync(local)) return { markdown: readFileSync(local, 'utf8'), fallback: false };
  return { markdown: readFileSync(file(), 'utf8'), fallback: lang !== 'en' };
}

// "Cost Cheat Sheet" → "cost-cheat-sheet". Tags and entities become spaces, so
// stripped fragments can never join up; the result is only [a-z0-9-].
// "Cost Cheat Sheet" → "cost-cheat-sheet"; Bangla headings keep their letters.
// Tags and entities become spaces, so stripped fragments never join up.
export const slugify = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');

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

/**
 * The article for one lesson: h1 + lead, then the lesson card (where it sits,
 * how long, goals, jump list), then the text. The paragraph written just
 * before a ```demo block becomes the demo's intro; sources fold away.
 * Returns { html, headings }; the demo itself is mounted on the client into
 * <div data-demo-slot>.
 *
 * A heading may name its id, "## খরচের হিসাব {#cost-cheat-sheet}", so lessons
 * in any language share the ids the jump list and the sources fold look for.
 */
export function buildArticle(markdown, { lang = 'en', section, lesson, demo, fallback = false }) {
  const t = dict(lang);
  const position = section.lessons.indexOf(lesson) + 1;

  let html = new MarkdownRenderer({ lang })
    .render(markdown)
    .replace(/<h2>([\s\S]*?)<\/h2>/g, (_, text) => {
      const named = text.match(/^([\s\S]*?)\s*\{#([a-z0-9-]+)\}$/);
      const id = named ? named[2] : slugify(text) === 'sources-checked' ? 'sources' : slugify(text);
      return `<h2 id="${id}">${named ? named[1] : text}</h2>`;
    })
    .replace('<aside class="callout callout-when-to-use-it">', '<aside class="callout callout-when-to-use-it" id="when-to-use">');

  const has = (id) => html.includes(`id="${id}"`);
  const jumps = [
    lesson.demo && ['demo-title', t.jumps.demo],
    has('when-to-use') && ['when-to-use', t.jumps.when],
    has('cost-cheat-sheet') && ['cost-cheat-sheet', t.jumps.cost],
    has('what-to-remember') && ['what-to-remember', t.jumps.remember],
    has('practice-prompt') && ['practice-prompt', t.jumps.practice],
  ].filter(Boolean);
  const header = `
    ${fallback ? `<p class="lesson-fallback" lang="${lang}">${escapeHtml(t.fallbackNotice)}</p>` : ''}
    <header class="lesson-header">
      <p class="lesson-meta">
        <span>${escapeHtml(t.lessonOf(section.title, position, section.lessons.length))}</span>
        ${lesson.minutes ? `<span>${escapeHtml(t.aboutMin(lesson.minutes))}</span>` : ''}
        ${lesson.level ? `<span class="lesson-level">${escapeHtml(lesson.level)}</span>` : ''}
      </p>
      ${lesson.goals?.length ? `<div class="lesson-goals"><p>${escapeHtml(t.youWillBeAbleTo)}</p><ul>${lesson.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}</ul></div>` : ''}
      ${jumps.length ? `<nav class="lesson-jumps" aria-label="${escapeHtml(t.jumpTo)}"><span>${escapeHtml(t.jumpTo)}</span>${jumps.map(([id, label]) => `<a href="#${id}">${escapeHtml(label)}</a>`).join('')}</nav>` : ''}
    </header>`;

  const opening = /(<h1>[\s\S]*?<\/h1>)<p>([\s\S]*?<\/p>)/;
  html = opening.test(html) ? html.replace(opening, (_, title, lead) => `${title}<p class="lead">${lead}${header}`) : header + html;

  let demoIntro = null;
  html = html.replace(/<p>((?:(?!<p>)[\s\S])*?)<\/p>(?=<div data-demo-here><\/div>)/, (_, text) => {
    demoIntro = text;
    return '';
  });
  // Sources matter, but they are reference, not the lesson's last word.
  html = html.replace(/<h2 id="sources">[\s\S]*?<\/h2>(<ul>[\s\S]*?<\/ul>)/, (_, list) => `<details class="sources"><summary>${escapeHtml(t.sourcesChecked)}</summary>${list}</details>`);

  // The demo panel goes where the lesson placed it, or after the text.
  if (lesson.demo) {
    const panel = `
      <section class="demo-panel" aria-labelledby="demo-title">
        <div class="language-panel-header">
          <h2 id="demo-title">${escapeHtml(t.tryIt)}: ${escapeHtml(demo?.title ?? '')}</h2>
          ${demoIntro ? `<p>${demoIntro}</p>` : demo?.intro ? `<p>${escapeHtml(demo.intro)}</p>` : ''}
        </div>
        <div data-demo-slot></div>
      </section>`;
    html = html.includes(DEMO_MARKER) ? html.replace(DEMO_MARKER, () => panel) : html + panel;
  }

  const headings = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(([, id, text]) => ({
    id,
    text: id === 'demo-title' ? `${t.demoPrefix}: ${demo?.title ?? ''}` : plainText(text),
  }));
  return { html, headings };
}

/**
 * A lesson's quizzes as separate rendered blocks, in lesson order (the same
 * order the lesson page numbers them in, so saved answers line up).
 */
export function lessonQuizzes(lang, sectionId, lessonId) {
  const { markdown, fallback } = lessonMarkdown(lang, sectionId, lessonId);
  const renderer = new MarkdownRenderer({ lang });
  const blocks = [...markdown.matchAll(/^```quiz\n[\s\S]*?^```$/gm)].map(([block]) => renderer.render(block));
  return { quizzes: blocks, fallback };
}
