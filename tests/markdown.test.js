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
