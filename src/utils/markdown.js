export const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// Inline Markdown runs after escaping so lesson text cannot inject raw HTML.
const inlineMarkdown = (value) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

// Marks where a lesson wants its interactive demo; App.js swaps in the panel.
export const DEMO_MARKER = '<div data-demo-here></div>';

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * ```cells block: an array drawn as boxes, for tracing an example by hand.
 *
 *   values: 3 9 14 21 30
 *   pointers: lo=0 mid=2 hi=4     (labels under cells; several may share one)
 *   highlight: 2                  (gold: the cell being looked at)
 *   done: 0 1                     (teal: finished / moved / on the path)
 *   dim: 3 4                      (grey: ruled out)
 *   note: First, look at the middle.
 */
function renderCells(lines) {
  const fields = Object.fromEntries(
    lines
      .map((line) => line.match(/^(\w+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.trim()]),
  );
  const values = (fields.values ?? '').split(/\s+/).filter(Boolean);
  const indexes = (key) => new Set((fields[key] ?? '').split(/\s+/).filter(Boolean).map(Number));
  const highlight = indexes('highlight');
  const done = indexes('done');
  const dim = indexes('dim');
  const labels = {};
  for (const pair of (fields.pointers ?? '').split(/\s+/).filter(Boolean)) {
    const [name, index] = pair.split('=');
    labels[index] = [...(labels[index] ?? []), name];
  }

  const cells = values
    .map((value, i) => {
      const state = highlight.has(i) ? 'is-hit' : done.has(i) ? 'is-moved' : dim.has(i) ? 'is-out' : '';
      const label = labels[i] ? `<span class="cell-pointer">${escapeHtml(labels[i].join(' '))}</span>` : '';
      return `<div class="array-cell ${state}"><span class="array-value">${escapeHtml(value)}</span><span class="array-index">${i}</span>${label}</div>`;
    })
    .join('');
  const note = fields.note ? `<figcaption>${inlineMarkdown(fields.note)}</figcaption>` : '';
  return `<figure class="cells-figure"><div class="array-row">${cells}</div>${note}</figure>`;
}

/**
 * ```quiz block: one multiple-choice question with instant feedback.
 *
 *   Q: The question?
 *   - a wrong option
 *   * the right option
 *   Why: The explanation shown after any answer.
 */
function renderQuiz(lines) {
  const question = lines.find((line) => line.startsWith('Q:'))?.slice(2).trim() ?? '';
  const why = lines.find((line) => line.startsWith('Why:'))?.slice(4).trim() ?? '';
  const options = lines
    .filter((line) => /^[-*] /.test(line))
    .map(
      (line, i) =>
        `<button type="button" class="quiz-option" data-quiz-option="${line.startsWith('*')}"><span class="quiz-letter" aria-hidden="true">${'ABCDEFGH'[i]}</span><span>${inlineMarkdown(line.slice(2))}</span></button>`,
    )
    .join('');
  return `
    <div class="quiz">
      <p class="quiz-question">${inlineMarkdown(question)}</p>
      <div class="quiz-options">${options}</div>
      <p class="quiz-feedback" aria-live="polite"></p>
      <p class="quiz-why" hidden>${inlineMarkdown(why)}</p>
    </div>`;
}

function renderTable(rows) {
  const cells = (row) =>
    row
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());
  const [head, , ...body] = rows; // The second row is the |---| separator.
  return `<div class="table-wrap"><table><thead><tr>${cells(head)
    .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
    .join('')}</tr></thead><tbody>${body
    .map((row) => `<tr>${cells(row).map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

/**
 * Callouts are blockquotes that start with a bold label, e.g.
 * "> **Analogy:** A hash table is like a coat check." The label picks the style.
 */
function renderCallout(lines) {
  const text = lines.join(' ');
  const match = text.match(/^\*\*([^*]+?):?\*\*:?\s*(.*)$/);
  const label = match?.[1] ?? '';
  const body = match ? match[2] : text;
  return `<aside class="callout callout-${slug(label) || 'note'}">${
    label ? `<strong class="callout-label">${escapeHtml(label)}</strong>` : ''
  }<p>${inlineMarkdown(body)}</p></aside>`;
}

/**
 * A small Markdown renderer for the syntax this project needs.
 *
 * Standard parts: #, ## and ### headings, paragraphs, "- " and "1. " lists,
 * tables, fenced code, inline code, bold and http(s) links.
 * Lesson parts: callouts (> **Label:** text) and fenced ```cells, ```quiz
 * and ```demo blocks (see the functions above).
 *
 * Everything is escaped before formatting, so lesson text cannot inject HTML.
 */
export class MarkdownRenderer {
  render(markdown) {
    const lines = markdown.trim().split('\n');
    const html = [];
    let paragraph = [];
    let list = [];
    let listTag = 'ul';
    let quote = [];
    let table = [];
    let fence = null; // { kind, lines } while inside a fenced block

    // Flush helpers finish the current block before a new block starts.
    const flushParagraph = () => {
      if (paragraph.length) html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) html.push(`<${listTag}>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listTag}>`);
      list = [];
    };
    const flushQuote = () => {
      if (quote.length) html.push(renderCallout(quote));
      quote = [];
    };
    const flushTable = () => {
      if (table.length) html.push(renderTable(table));
      table = [];
    };
    const flushAll = () => {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
    };

    for (const line of lines) {
      // A fenced block starts and ends with three backticks; the word after
      // the opening fence (```cells, ```quiz, ```demo) picks how it renders.
      if (line.startsWith('```')) {
        if (fence) {
          const { kind, lines: body } = fence;
          if (kind === 'cells') html.push(renderCells(body));
          else if (kind === 'quiz') html.push(renderQuiz(body));
          else if (kind === 'demo') html.push(DEMO_MARKER);
          else if (body.length) html.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
          fence = null;
        } else {
          flushAll();
          fence = { kind: line.slice(3).trim(), lines: [] };
        }
        continue;
      }

      // While inside a fenced block, keep text exactly as the author wrote it.
      if (fence) {
        fence.lines.push(line);
        continue;
      }

      if (line.trim() === '') {
        flushAll();
        continue;
      }

      const heading = line.match(/^(#{1,3}) (.*)$/);
      if (heading) {
        flushAll();
        const level = heading[1].length;
        html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
        continue;
      }

      // Each block flushes every other open block first, so blocks keep their written order.
      if (line.startsWith('> ') || line === '>') {
        flushParagraph();
        flushList();
        flushTable();
        quote.push(line.slice(2));
        continue;
      }

      if (line.startsWith('|')) {
        flushParagraph();
        flushList();
        flushQuote();
        table.push(line.trim());
        continue;
      }

      // Bullet and numbered lines are collected into one list until another block starts.
      const item = line.match(/^(- |\d+\. )(.*)$/);
      if (item) {
        flushParagraph();
        flushQuote();
        flushTable();
        const tag = item[1] === '- ' ? 'ul' : 'ol';
        if (list.length && tag !== listTag) flushList();
        listTag = tag;
        list.push(item[2]);
        continue;
      }

      flushQuote();
      flushTable();
      paragraph.push(line.trim());
    }

    flushAll();
    // An unclosed fence still shows its text rather than vanishing.
    if (fence?.lines.length) html.push(`<pre><code>${escapeHtml(fence.lines.join('\n'))}</code></pre>`);
    return html.join('');
  }
}
