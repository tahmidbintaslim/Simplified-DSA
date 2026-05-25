export const escapeHtml = (value) =>
  value
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

/**
 * A tiny Markdown renderer for the syntax this project currently needs.
 *
 * This is intentionally small so beginners can read it.
 * If we later need full Markdown support, we can replace this module.
 */
export class MarkdownRenderer {
  render(markdown) {
    const lines = markdown.trim().split('\n');
    const html = [];
    let paragraph = [];
    let list = [];
    let code = [];
    let inCodeBlock = false;

    // Flush helpers finish the current block before a new block starts.
    const flushParagraph = () => {
      if (paragraph.length === 0) return;
      html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (list.length === 0) return;
      html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
      list = [];
    };

    const flushCode = () => {
      if (code.length === 0) return;
      html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      code = [];
    };

    for (const line of lines) {
      // A fenced code block starts and ends with three backticks.
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        } else {
          flushParagraph();
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      // While inside a code block, keep text exactly as the author wrote it.
      if (inCodeBlock) {
        code.push(line);
        continue;
      }

      // Blank lines separate paragraphs, lists, and code blocks.
      if (line.trim() === '') {
        flushParagraph();
        flushList();
        continue;
      }

      // The order matters: check headings before regular paragraph text.
      if (line.startsWith('## ')) {
        flushParagraph();
        flushList();
        html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
        continue;
      }

      if (line.startsWith('# ')) {
        flushParagraph();
        flushList();
        html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
        continue;
      }

      // Bullet lines are collected into one list until another block starts.
      if (line.startsWith('- ')) {
        flushParagraph();
        list.push(line.slice(2));
        continue;
      }

      paragraph.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushCode();

    return html.join('');
  }
}
