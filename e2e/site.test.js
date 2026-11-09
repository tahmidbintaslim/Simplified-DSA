/**
 * Browser tests: the built site in a real Chromium, driven like a learner would.
 *
 * Run with `pnpm test:e2e` (it builds first). The unit tests in tests/ cover
 * the pure logic; these cover what only a browser shows: rendering, clicks,
 * keyboard, storage and layout.
 */
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { loadLessons } from '../mcp/server.js';

const lessons = loadLessons().map((lesson) => `/${lesson.section}/${lesson.id}`);
let server;
let browser;
let base;

before(async () => {
  server = await preview({ logLevel: 'silent', preview: { port: 4180, strictPort: false } });
  base = server.resolvedUrls.local[0].replace(/\/$/, '');
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.httpServer.close(resolve));
});

// A fresh page per test; any uncaught page error fails the test.
const open = async (path, { width = 1280, init } = {}) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  if (init) await page.addInitScript(init);
  await page.goto(`${base}${path}`);
  return { page, errors };
};

test('every lesson renders its title, demo, quizzes and footer without errors', async () => {
  for (const path of lessons) {
    const { page, errors } = await open(path);
    const shape = await page.evaluate(() => ({
      title: document.querySelector('main h1')?.textContent,
      demo: !!document.querySelector('.demo-panel .demo > *'),
      quizzes: document.querySelectorAll('.quiz').length,
      footer: !!document.querySelector('#complete-button'),
      leftoverMarker: document.body.innerHTML.includes('data-demo-here'),
    }));
    assert.ok(shape.title, `${path}: title`);
    assert.ok(shape.demo, `${path}: demo mounted`);
    assert.ok(shape.quizzes >= 1, `${path}: quizzes`);
    assert.ok(shape.footer, `${path}: footer`);
    assert.equal(shape.leftoverMarker, false, `${path}: demo marker replaced`);
    assert.deepEqual(errors, [], `${path}: page errors`);
    await page.close();
  }
});

test('no lesson scrolls sideways on a 390px phone', async () => {
  for (const path of lessons) {
    const { page } = await open(path, { width: 390 });
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(width <= 390, `${path} is ${width}px wide`);
    await page.close();
  }
});

test('a quiz hides the answer after one miss and reveals it after two', async () => {
  const { page } = await open('/data-structures/arrays-and-strings');
  const quiz = page.locator('.quiz').first();
  const wrong = quiz.locator('[data-quiz-option="false"]');
  await wrong.nth(0).click();
  assert.equal(await quiz.locator('.is-right').count(), 0);
  await wrong.nth(1).click();
  assert.equal(await quiz.locator('.is-right').count(), 1);
  assert.match(await quiz.locator('.quiz-feedback').textContent(), /answer is highlighted/);
  await page.close();
});

test('the step player moves the highlighted code line and the variables together', async () => {
  const { page } = await open('/algorithms/binary-search');
  // Fixed input: the demo's random list could put the target at the first middle (a one-step search).
  await page.fill('[data-field="list"]', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16');
  await page.fill('[data-field="target"]', '16');
  await page.click('[data-op="use"]');
  await page.click('[data-player="next"]');
  assert.match(await page.textContent('.demo-count'), /^Step 2 \//);
  assert.equal(await page.locator('.trace-lines li.is-current').count(), 1);
  assert.match(await page.textContent('.trace-var-list'), /mid/);
  await page.locator('[data-player="next"]').focus();
  await page.keyboard.press('ArrowLeft');
  assert.match(await page.textContent('.demo-count'), /^Step 1 \//);
  await page.close();
});

test('progress survives a reload and Next opens the next lesson at the top', async () => {
  const { page } = await open('/data-structures/hash-tables');
  await page.click('#complete-button');
  await page.reload();
  assert.match(await page.textContent('#complete-button'), /Completed/);
  await page.locator('.lesson-step:last-child').scrollIntoViewIfNeeded();
  await page.click('.lesson-step:last-child');
  assert.equal(new URL(page.url()).pathname, '/data-structures/binary-search-trees');
  assert.equal(await page.evaluate(() => window.scrollY), 0);
  await page.close();
});

test('an unknown URL shows "Page not found" and keeps the URL', async () => {
  const { page } = await open('/algorithms/heaps');
  assert.equal(await page.textContent('main h1'), 'Page not found');
  assert.ok(page.url().endsWith('/algorithms/heaps'));
  await page.close();
});

test('the site still works when the browser blocks site data', async () => {
  const { page, errors } = await open('/algorithms/sorting', {
    init: () =>
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      }),
  });
  assert.equal(await page.textContent('main h1'), 'Sorting');
  await page.click('#complete-button');
  assert.deepEqual(errors, []);
  await page.close();
});
