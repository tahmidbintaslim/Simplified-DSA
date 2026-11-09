import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, MarkdownRenderer } from '../src/utils/markdown.js';

const render = (markdown) => new MarkdownRenderer().render(markdown);

test('escapeHtml escapes the five HTML-significant characters', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('renders headings, paragraphs and lists', () => {
  const html = render('# Title\n\nFirst line\nsecond line\n\n## Part\n\n- one\n- two');
  assert.equal(
    html,
    '<h1>Title</h1><p>First line second line</p><h2>Part</h2><ul><li>one</li><li>two</li></ul>',
  );
});

test('lesson text cannot inject raw HTML', () => {
  const html = render('Hello <script>alert(1)</script> <img src=x onerror=alert(1)>');
  assert.ok(!html.includes('<script'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('fenced code keeps its text and escapes it', () => {
  const html = render('```\nif (a < b) {\n  return "x";\n}\n```');
  assert.equal(html, '<pre><code>if (a &lt; b) {\n  return &quot;x&quot;;\n}</code></pre>');
});

test('inline code and bold are formatted after escaping', () => {
  assert.equal(render('Use `a<b` and **bold**'), '<p>Use <code>a&lt;b</code> and <strong>bold</strong></p>');
});

test('only http and https links become anchors', () => {
  assert.equal(
    render('[MDN](https://developer.mozilla.org/)'),
    '<p><a href="https://developer.mozilla.org/" target="_blank" rel="noreferrer">MDN</a></p>',
  );
  const unsafe = render('[click](javascript:alert(1))');
  assert.ok(!unsafe.includes('<a '));
});

test('### headings, numbered lists and tables', () => {
  assert.equal(render('### Small'), '<h3>Small</h3>');
  assert.equal(render('1. one\n2. two'), '<ol><li>one</li><li>two</li></ol>');
  const table = render('| Op | Cost |\n| --- | --- |\n| read | `O(1)` |');
  assert.match(table, /<th>Op<\/th><th>Cost<\/th>/);
  assert.match(table, /<td>read<\/td><td><code>O\(1\)<\/code><\/td>/);
});

test('callouts take their style from the bold label', () => {
  assert.equal(
    render('> **Analogy:** A coat check.\n> You get a ticket.'),
    '<aside class="callout callout-analogy"><strong class="callout-label">Analogy</strong><p>A coat check. You get a ticket.</p></aside>',
  );
});

test('cells blocks draw values, pointers and states, escaped', () => {
  const html = render('```cells\nvalues: 3 <b> 14\npointers: lo=0 hi=2 mid=2\nhighlight: 1\ndim: 0\nnote: Look **here**.\n```');
  assert.match(html, /<span class="array-value">&lt;b&gt;<\/span>/);
  assert.match(html, /array-cell is-hit/);
  assert.match(html, /array-cell is-out/);
  assert.match(html, /<span class="cell-pointer">hi mid<\/span>/);
  assert.match(html, /<figcaption>Look <strong>here<\/strong>\.<\/figcaption>/);
});

test('quiz blocks mark the right option and keep the explanation hidden', () => {
  const html = render('```quiz\nQ: Pick <one>\n- wrong\n* right\nWhy: Because.\n```');
  assert.match(html, /Pick &lt;one&gt;/);
  assert.match(html, /data-quiz-option="false">wrong/);
  assert.match(html, /data-quiz-option="true">right/);
  assert.match(html, /<p class="quiz-why" hidden>Because\.<\/p>/);
});

test('a demo fence leaves a marker for the app', () => {
  assert.equal(render('```demo\n```'), '<div data-demo-here></div>');
});
