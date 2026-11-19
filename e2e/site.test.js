/**
 * Browser tests: the built site in a real Chromium, driven like a learner would.
 *
 * Run with `pnpm test:e2e` (it builds first). The unit tests in tests/ cover
 * the pure logic; these cover what only a browser shows: rendering, clicks,
 * keyboard, storage and layout.
 */
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import * as playwright from 'playwright';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { loadLessons } from '../mcp/server.js';

const lessons = loadLessons().map((lesson) => `/en/${lesson.section}/${lesson.id}`);
let server;
let browser;
let base;
let signedIn; // storage state of a signed-in learner (lessons need an account)

// The Clerk test user; create it once in the Clerk dev instance (see README).
const TEST_EMAIL = process.env.E2E_CLERK_USER_EMAIL || 'e2e+clerk_test@example.com';

before(async () => {
  // The production build, as Vercel runs it (`pnpm test:e2e` builds first).
  const port = 4180 + Math.floor(Math.random() * 500);
  base = `http://localhost:${port}`;
  // No database: progress stays in the browser, so tests never depend on an account's saved state.
  server = spawn('node_modules/.bin/next', ['start', '-p', String(port)], { stdio: 'ignore', env: { ...process.env, DATABASE_URL: '' } });
  for (let i = 0; i < 100; i++) {
    if (await fetch(base).then((r) => r.ok, () => false)) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await clerkSetup({ publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY });
  // BROWSER picks the engine (chromium, firefox or webkit; CI runs all three).
  // CHROMIUM_PATH lets a machine with a preinstalled Chromium run the suite
  // when its Playwright version expects a different browser build.
  const engine = process.env.BROWSER || 'chromium';
  browser = await playwright[engine].launch({
    executablePath: engine === 'chromium' ? process.env.CHROMIUM_PATH || undefined : undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base);
  await clerk.signIn({ page, emailAddress: TEST_EMAIL });
  signedIn = await context.storageState();
  await context.close();
});

after(async () => {
  await browser?.close();
  server?.kill();
});

// A fresh signed-in page per test; any uncaught page error fails the test.
const open = async (path, { width = 1280, init, signedOut = false, ...options } = {}) => {
  const context = await browser.newContext({ viewport: { width, height: 900 }, storageState: signedOut ? undefined : signedIn, ...options });
  const page = await context.newPage();
  page.on('close', () => context.close());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  if (init) await page.addInitScript(init);
  // Paths in these tests are English pages: '/' is /en, '/algorithms/x' is /en/algorithms/x.
  const url = /^\/(en|bn)(\/|$)/.test(path) ? path : `/en${path === '/' ? '' : path}`;
  await page.goto(`${base}${url}`);
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
  for (const path of [...lessons, '/bn', '/bn/data-structures/arrays-and-strings']) {
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
  await page.waitForSelector('#complete-button[aria-pressed="true"]');
  assert.match(await page.textContent('#complete-button'), /Completed/);
  await page.locator('.lesson-step:last-child').scrollIntoViewIfNeeded();
  await page.click('.lesson-step:last-child');
  await page.waitForURL('**/en/data-structures/binary-search-trees');
  await page.waitForSelector('.lesson-content h1');
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

test('pattern demos compare against brute force and trace their pseudocode', async () => {
  const { page } = await open('/patterns/two-pointers');
  assert.match(await page.textContent('.tp-compare'), /Two pointers: 7 steps\. Brute force would check 23 pairs\./);
  await page.click('[data-player="next"]');
  assert.match(await page.textContent('.trace-lines li.is-current'), /right = right - 1/);
  await page.close();

  const window = await open('/patterns/sliding-window');
  assert.match(await window.page.textContent('.sw-compare'), /\(13 in total\)\. Recomputing every window would make 18\./);
  await window.page.click('[data-player="next"]');
  assert.match(await window.page.textContent('.demo-caption'), /add 1, drop 2\. Sum = 7/);
  await window.page.close();
});

test('critique fixes: list markers, one h1, skip link, written quiz marks', async () => {
  const { page } = await open('/data-structures/arrays-and-strings');
  const markers = await page.evaluate(() => ({
    ul: getComputedStyle(document.querySelector('.lesson-content > ul')).listStyleType,
    goals: getComputedStyle(document.querySelector('.lesson-goals ul')).listStyleType,
    h1s: document.querySelectorAll('h1').length,
  }));
  assert.deepEqual(markers, { ul: 'disc', goals: 'disc', h1s: 1 });

  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main');

  const quiz = page.locator('.quiz').first();
  await quiz.locator('[data-quiz-option="true"]').click();
  assert.equal(await quiz.locator('[data-quiz-option="true"]').getAttribute('data-mark'), 'Correct');
  await page.close();
});

test('on a phone the lesson starts on the first screen and the list folds into a drawer', async () => {
  const { page } = await open('/algorithms/binary-search', { width: 390 });
  const titleTop = await page.evaluate(() => document.querySelector('main h1').getBoundingClientRect().top);
  assert.ok(titleTop < 844, `lesson title starts at ${titleTop}px`);
  assert.equal(await page.isVisible('#lesson-link-algorithms-binary-search'), false);
  await page.click('.nav-drawer > summary');
  assert.equal(await page.isVisible('#lesson-link-algorithms-binary-search'), true);
  await page.click('#lesson-link-algorithms-sorting');
  await page.waitForURL('**/en/algorithms/sorting');
  await page.waitForSelector('#lesson-link-algorithms-sorting', { state: 'hidden' });
  assert.equal(await page.isVisible('#lesson-link-algorithms-sorting'), false);
  await page.close();
});

test('the demo keeps the cell its caption talks about in view, and bad input reads as an error', async () => {
  const { page } = await open('/algorithms/binary-search', { width: 390 });
  await page.fill('[data-field="list"]', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16');
  await page.fill('[data-field="target"]', '16');
  await page.click('[data-op="use"]');
  for (let i = 0; i < 3; i++) {
    const visible = await page.evaluate(() => {
      const stage = document.querySelector('.demo-stage');
      const cell = stage.querySelector('.array-cell.is-found, .array-cell.is-mid, .array-cell.is-hit');
      const a = stage.getBoundingClientRect();
      const b = cell.getBoundingClientRect();
      return b.left >= a.left && b.right <= a.right;
    });
    assert.ok(visible, `active cell visible at step ${i + 1}`);
    await page.click('[data-player="next"]');
  }
  await page.fill('[data-field="list"]', 'banana');
  await page.click('[data-op="use"]');
  assert.equal(await page.getAttribute('.bs-compare', 'class'), 'bs-compare is-error');
  await page.close();
});

test('design: the first demo frame centres its active cell on a phone, and the demo intro sits inside the panel', async () => {
  const { page } = await open('/algorithms/binary-search', { width: 390 });
  await page.waitForTimeout(100); // one animation frame after mount
  const visible = await page.evaluate(() => {
    const stage = document.querySelector('.demo-stage');
    // The random target can sit at the first middle, which is then "found".
    const cell = stage.querySelector('.array-cell.is-mid, .array-cell.is-found');
    const a = stage.getBoundingClientRect();
    const b = cell.getBoundingClientRect();
    return b.left >= a.left && b.right <= a.right;
  });
  assert.ok(visible, 'first-frame mid cell is visible');
  // A phone gets 7 cells, so lo and hi stay on screen with mid.
  const fits = await page.evaluate(() => {
    const stage = document.querySelector('.demo-stage');
    return { cells: stage.querySelectorAll('.array-cell').length, fits: stage.scrollWidth <= stage.clientWidth };
  });
  assert.deepEqual(fits, { cells: 7, fits: true });
  const intro = await page.textContent('.demo-panel .language-panel-header p');
  assert.match(intro, /watch the code and the variables change together/);
  assert.equal(await page.locator('.quiz-label').count(), 0);
  await page.close();
});

test('home shows the course map and a start button; lessons end with a folded answer and a completion note', async () => {
  const { page, errors } = await open('/');
  assert.match(await page.textContent('main h1'), /See every step/);
  assert.equal(await page.locator('.course-lesson').count(), lessons.length);
  await page.click('.home-actions .demo-button');
  await page.waitForURL('**/en/data-structures/arrays-and-strings');
  await page.waitForSelector('#complete-button');

  // The practice answer and the sources start folded.
  assert.equal(await page.locator('details.answer').getAttribute('open'), null);
  assert.equal(await page.locator('details.sources').getAttribute('open'), null);
  await page.click('details.answer > summary');
  assert.match(await page.textContent('details.answer'), /3 values moved/);

  // The language comparison stays open when a tab re-renders the page.
  await page.click('details.language-details > summary');
  await page.click('#language-tab-python');
  assert.notEqual(await page.locator('details.language-details').getAttribute('open'), null);

  await page.click('#complete-button');
  assert.match(await page.textContent('.completion-note'), /Lesson done\. You have finished \d+ of \d+ lessons\. Up next: Linked Lists\./);
  // Marking complete re-renders the page; the answer the learner opened stays open.
  assert.notEqual(await page.locator('details.answer').getAttribute('open'), null);
  assert.deepEqual(errors, []);
  await page.close();
});

test('critique 2: home links, jump list, stepped array insert, settled quiz', async () => {
  const { page, errors } = await open('/data-structures/arrays-and-strings');
  // The jump list scrolls without re-rendering (the demo keeps its state).
  await page.click('.toc a[href="#cost-cheat-sheet"]'); // the jump list is the phone version of this
  assert.equal(await page.evaluate(() => document.activeElement.id), 'cost-cheat-sheet');
  assert.equal(new URL(page.url()).hash, '');

  // Insert shifts one value per step, with the gap travelling.
  await page.click('[data-op="insert"]');
  assert.match(await page.textContent('.arr-status'), /^3 values moved/);
  await page.click('[data-player="next"]');
  assert.equal(await page.locator('.demo-stage .array-cell.is-gap').count(), 1);
  await page.fill('[data-field="index"]', '99');
  await page.click('[data-op="delete"]');
  assert.equal(await page.getAttribute('.arr-status', 'class'), 'bs-compare arr-status is-error');

  // A solved quiz ignores more clicks.
  const quiz = page.locator('.quiz').first();
  await quiz.locator('[data-quiz-option="true"]').click();
  await quiz.locator('[data-quiz-option="false"]').first().click({ force: true }); // aria-disabled now
  assert.equal(await quiz.locator('.is-wrong').count(), 0);

  // The site title goes home; home shows the drawn step and only section links.
  await page.click('.topbar .brand');
  await page.waitForURL(`${base}/en`);
  await page.waitForSelector('.hero-figure .array-cell');
  assert.equal(await page.locator('.hero-figure .array-cell').count(), 7);
  assert.equal(await page.locator('.lesson-sidebar .lesson-link').count(), 0);
  assert.deepEqual(errors, []);
  await page.close();

  const missing = await open('/nope/nothing');
  await missing.page.click('.home-actions a');
  await missing.page.waitForURL(`${base}/en`);
  await missing.page.close();
});

test('docs shell: search filters the lesson tree, sections expand in place, theme toggle sticks', async () => {
  const { page, errors } = await open('/algorithms/binary-search');
  // "/" focuses search; typing filters lessons across sections.
  await page.keyboard.press('/');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'lesson-search');
  await page.keyboard.type('window');
  assert.equal(await page.isVisible('#lesson-link-patterns-sliding-window'), true);
  assert.equal(await page.isVisible('#lesson-link-algorithms-sorting'), false);
  await page.fill('#lesson-search', 'zzz');
  assert.equal(await page.isVisible('.nav-empty'), true);
  await page.fill('#lesson-search', '');

  // A section header expands in place instead of navigating.
  await page.click('#section-link-patterns');
  assert.equal(new URL(page.url()).pathname, '/en/algorithms/binary-search');
  assert.equal(await page.isVisible('#lesson-link-patterns-two-pointers'), true);

  // "On this page" lists the headings, including the demo.
  assert.match(await page.textContent('.toc'), /Demo: Halve the search range/);

  // The theme button flips and remembers the choice.
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click('#theme-toggle');
  assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), before);
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
  assert.deepEqual(errors, []);
  await page.close();
});

test('new patterns: fast and slow pointers meet on the loop; prefix sums answer with one subtraction', async () => {
  const { page, errors } = await open('/patterns/fast-and-slow-pointers');
  await page.selectOption('[data-field="loop"]', '3');
  await page.click('[data-op="run"]');
  // Step to the end: the last caption reports the meeting, and that cell is teal.
  for (let i = 0; i < 10; i++) await page.click('[data-player="next"]');
  assert.match(await page.textContent('.demo-caption'), /they meet, so the list has a loop/);
  assert.equal(await page.locator('.fs-row .array-cell.is-found').count(), 1);
  assert.equal(await page.locator('.fs-loop').count(), 1);
  await page.close();

  const prefix = await open('/patterns/prefix-sums');
  await prefix.page.fill('[data-field="l"]', '2');
  await prefix.page.fill('[data-field="r"]', '4');
  await prefix.page.click('[data-op="run"]');
  for (let i = 0; i < 12; i++) await prefix.page.click('[data-player="next"]');
  assert.match(await prefix.page.textContent('.demo-caption'), /sum\(2\.\.4\) = prefix\[5\] - prefix\[2\] = 12 - 2 = 10/);
  assert.equal(await prefix.page.locator('.ps-values .array-cell.is-moved').count(), 3);
  assert.deepEqual([...errors, ...prefix.errors], []);
  await prefix.page.close();
});

test('critique 3: the hero search is drivable and the beam follows the middle cell', async () => {
  const { page, errors } = await open('/');
  const left = () => page.evaluate(() => document.querySelector('.beam').getBoundingClientRect().left);
  const start = await left();
  await page.click('#hero-next');
  assert.match(await page.textContent('.hero-figure figcaption'), /Step 2 of 3/);
  await page.waitForTimeout(600); // the beam slides on the same element now
  assert.ok((await left()) > start, 'beam moved right, to the new middle');
  await page.click('#hero-next');
  assert.equal(await page.locator('.hero-figure .array-cell.is-found').count(), 1);
  assert.equal(await page.isDisabled('#hero-next'), true);
  // Focus stays on a button that still works.
  assert.equal(await page.evaluate(() => document.activeElement.id), 'hero-reset');
  await page.click('#hero-reset');
  assert.match(await page.textContent('.hero-figure figcaption'), /Step 1 of 3/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('motion: worked examples scrub with pointers that glide; reduced motion still updates, without movement', async () => {
  const { page, errors } = await open('/algorithms/binary-search');
  const figure = page.locator('.cells-live').first();
  await figure.scrollIntoViewIfNeeded();
  assert.match(await figure.locator('figcaption').textContent(), /^Check 1/);
  const loX = () => figure.locator('.pointer-token[data-name="lo"]').evaluate((el) => el.dataset.x);
  const before = await loX();
  await figure.locator('[data-stepper="next"]').click();
  assert.match(await figure.locator('figcaption').textContent(), /^Check 2/);
  assert.notEqual(await loX(), before, 'lo moved to its new cell');
  await figure.locator('[data-stepper="scrub"]').fill('3');
  assert.match(await figure.locator('figcaption').textContent(), /^Check 3/);
  assert.equal(await figure.locator('[data-stepper="next"]').isDisabled(), true);
  // The demo's timeline scrubs too (fixed input: a random list could be a one-step search).
  await page.fill('[data-field="list"]', '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16');
  await page.fill('[data-field="target"]', '16');
  await page.click('[data-op="use"]');
  await page.locator('.demo-timeline input').fill('2');
  assert.match(await page.textContent('.demo-count'), /^Step 2 \//);
  await page.close();

  const calm = await open('/algorithms/sorting');
  await calm.page.emulateMedia({ reducedMotion: 'reduce' });
  await calm.page.click('[data-player="next"]');
  await calm.page.click('[data-player="next"]');
  // No movement (script-driven slides, pops and glides); colour fades on buttons are fine.
  assert.equal(await calm.page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.constructor.name === 'Animation').length), 0);
  assert.match(await calm.page.textContent('.demo-count'), /^Step 3 \//);
  assert.deepEqual([...errors, ...calm.errors], []);
  await calm.page.close();
});

test('motion: stack, queue and list keep their elements, so values move instead of being redrawn', async () => {
  const { page, errors } = await open('/data-structures/stacks-and-queues');
  const firstQueueItem = await page.locator('.queue-item').first().elementHandle();
  await page.click('[data-op="enqueue"]');
  // The old front is the same element after an enqueue (it was moved, not rebuilt).
  assert.equal(await firstQueueItem.evaluate((el) => el.isConnected), true);
  await page.click('[data-op="push"]');
  await page.click('[data-op="pop"]');
  assert.match(await page.textContent('.demo-caption'), /Popped 13/);
  assert.equal(await page.locator('.stack-view .stack-item').count(), 2);
  await page.close();

  const list = await open('/data-structures/linked-lists');
  const seven = await list.page.locator('.list-unit').first().elementHandle();
  await list.page.click('[data-op="head"]');
  assert.equal(await seven.evaluate((el) => el.isConnected && el.textContent.includes('7')), true);
  assert.equal(await list.page.locator('.list-unit').count(), 4);
  assert.match(await list.page.textContent('.list-row'), /null$/);
  assert.deepEqual([...errors, ...list.errors], []);
  await list.page.close();
});

test('predict, then reveal: Step asks first, a picked cell plays the step and says whether it was right', async () => {
  const { page, errors } = await open('/algorithms/binary-search');
  await page.fill('[data-field="list"]', '3 9 14 21 30 42 57');
  await page.fill('[data-field="target"]', '30');
  await page.click('[data-op="use"]');
  await page.check('[data-player="predict"]');
  await page.click('[data-player="next"]');
  // Step 1 checked mid = 3 (21 < 30). The next check is (4 + 6) // 2 = 5, then (4 + 4) // 2 = 4.
  assert.match(await page.textContent('.predict-question'), /^Predict: lo = 4 and hi = 6\. Which cell is checked next\?/);
  assert.match(await page.textContent('.demo-count'), /^Step 1 \//, 'the step waits for a guess');
  await page.locator('.bs-row .is-pickable').nth(4).click();
  assert.match(await page.textContent('.predict-question'), /^You picked cell 4; it was cell 5\. mid = \(lo \+ hi\) \/\/ 2 = \(4 \+ 6\) \/\/ 2 = 5\./);
  assert.match(await page.textContent('.demo-count'), /^Step 2 \//);
  assert.equal(await page.locator('.bs-row .is-pickable').count(), 0);
  // Keyboard: → asks again, Enter on the focused right cell answers it.
  await page.keyboard.press('ArrowRight');
  await page.locator('.bs-row .is-pickable').nth(4).focus();
  await page.keyboard.press('Enter');
  assert.match(await page.textContent('.predict-question'), /^Right: cell 4\./);
  assert.deepEqual(errors, []);
  await page.close();
});

test('the home hero plays its search once by itself when it comes into view', async () => {
  const { page, errors } = await open('/');
  const beam = await page.locator('.beam').elementHandle();
  await page.waitForTimeout(4800);
  assert.match(await page.textContent('.hero-figure figcaption'), /Step 3 of 3/);
  assert.equal(await page.locator('.hero-figure .array-cell.is-found').count(), 1);
  // Updated in place: the beam is the same element, so it slid rather than jumped.
  assert.equal(await beam.evaluate((el) => el.isConnected), true);
  await page.close();

  const calm = await open('/');
  await calm.page.emulateMedia({ reducedMotion: 'reduce' });
  await calm.page.reload();
  await calm.page.waitForTimeout(3500);
  assert.match(await calm.page.textContent('.hero-figure figcaption'), /Step 1 of 3/);
  assert.deepEqual([...errors, ...calm.errors], []);
  await calm.page.close();
});

test('the binary-search demo never starts on a one-step search', async () => {
  for (let i = 0; i < 12; i++) {
    const { page } = await open('/algorithms/binary-search');
    assert.doesNotMatch(await page.textContent('.demo-count'), /\/ 1$/, 'random start must take more than one check');
    await page.close();
  }
});

test('lesson widgets: the guess game plays, halving counts, the bug lab breaks, and widgets survive a re-render', async () => {
  const { page, errors } = await open('/algorithms/binary-search');
  const game = page.locator('.widget-guess-game');
  await game.locator('[data-act="watch"]').click();
  await page.waitForTimeout(6500); // binary search needs at most 5 flips of 16 cards, 1.1s apart
  assert.match(await game.locator('.widget-message').textContent(), /^Found \d+ in [1-5] guess/);
  assert.equal(await game.locator('.guess-card.is-found').count(), 1);

  assert.match(await page.textContent('.widget-halving .widget-message'), /1,000,000 values, at most 20 checks/);

  const lab = page.locator('.widget-bug-lab');
  await lab.locator('[data-bug="strict"]').check();
  await lab.locator('[data-target="30"]').click();
  assert.match(await lab.locator('.bug-result').textContent(), /^Missed! 30 is in the list/);
  assert.match(await lab.locator('.bug-code').textContent(), /while lo < hi:/);
  await lab.locator('[data-bug="strict"]').uncheck();
  await lab.locator('[data-bug="hiMid"]').check();
  await lab.locator('[data-target="10"]').click();
  assert.match(await lab.locator('.bug-result').textContent(), /^Stuck!/);

  // Mark complete re-renders the lesson; the widget keeps its state.
  await page.click('#complete-button');
  assert.match(await page.locator('.widget-bug-lab .bug-result').textContent(), /^Stuck!/);
  await page.click('.deep-dive > summary');
  assert.match(await page.textContent('.deep-dive'), /lo \+ \(hi - lo\) \/\/ 2/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('auth: home is public; a signed-out visitor to a lesson is sent to sign in and the connector stays public', async () => {
  const { page } = await open('/', { signedOut: true });
  assert.match(await page.textContent('main h1'), /See every step/);
  await page.goto(`${base}/bn/algorithms/binary-search`);
  assert.equal(new URL(page.url()).pathname, '/sign-in');
  assert.equal(new URL(page.url()).searchParams.get('redirect_url'), '/bn/algorithms/binary-search');
  await page.close();
  const mcp = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  });
  assert.equal(mcp.status, 200);
});

test('languages: / follows the browser, old links move under /en, the switch keeps the lesson, Bangla renders in Bangla', async () => {
  const toBangla = await fetch(`${base}/`, { redirect: 'manual', headers: { 'accept-language': 'bn-BD,bn;q=0.9,en;q=0.8' } });
  assert.equal(new URL(toBangla.headers.get('location'), base).pathname, '/bn');
  const toEnglish = await fetch(`${base}/`, { redirect: 'manual', headers: { 'accept-language': 'en-US' } });
  assert.equal(new URL(toEnglish.headers.get('location'), base).pathname, '/en');
  const old = await fetch(`${base}/algorithms/big-o`, { redirect: 'manual' });
  assert.equal(old.status, 308);
  assert.equal(new URL(old.headers.get('location'), base).pathname, '/en/algorithms/big-o');

  const { page, errors } = await open('/bn/data-structures/arrays-and-strings');
  assert.equal(await page.getAttribute('html', 'lang'), 'bn');
  assert.match(await page.textContent('main h1'), /অ্যারে ও স্ট্রিং/);
  assert.match(await page.textContent('.toc'), /খরচের হিসাব/);
  // The jump list finds the same sections by id in both languages.
  assert.equal(await page.locator('.lesson-jumps a[href="#cost-cheat-sheet"]').count(), 1);
  // The demo speaks Bangla too.
  assert.match(await page.textContent('.demo-panel [data-op="insert"]'), /যোগ করো/);
  // A lesson not yet translated says so and shows the English text.
  await page.goto(`${base}/bn/algorithms/sorting`);
  assert.equal(await page.locator('.lesson-fallback').count(), 1);
  assert.match(await page.textContent('.lesson-content h1'), /Sorting/);
  // The switch opens the same lesson in English.
  await page.click('.lang-switch');
  await page.waitForURL('**/en/algorithms/sorting');
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  assert.deepEqual(errors, []);
  await page.close();
});

test('arrays widgets: the address arrow jumps to any index, inserting at the front moves everything, Bangla text counts three ways', async () => {
  const { page, errors } = await open('/data-structures/arrays-and-strings');
  await page.click('.memory-cell[data-index="3"]');
  assert.match(await page.textContent('.memory-formula'), /1000 \+ 3 × 4 = 1012/);
  await page.click('[data-size="8"]');
  assert.match(await page.textContent('.memory-formula'), /1000 \+ 3 × 8 = 1024/);

  await page.click('.shift-gap[data-gap="0"]');
  assert.match(await page.textContent('.widget-shift-cost .widget-message'), /moved 8 values/);
  await page.click('.shift-row .array-cell');
  await page.click('.shift-gap[data-gap="8"]');
  assert.match(await page.textContent('.widget-shift-cost .widget-message'), /moved 0 values/);
  assert.equal(await page.locator('.shift-bar.is-tried').count(), 2);

  await page.click('.widget-string-bytes [data-text="বাংলা"]');
  const counts = await page.locator('.bytes-row strong').allTextContents();
  assert.deepEqual(counts.slice(1), ['5', '15']); // code points, UTF-8 bytes
  assert.deepEqual(errors, []);
  await page.close();
});

test('simulators: the hub lists every demo, missions tick off from what you do, and progress is remembered', async () => {
  const { page, errors } = await open('/simulators', { signedOut: true });
  assert.equal(await page.locator('.hub-card').count(), lessons.length);
  await page.close();

  const sim = await open('/simulators/array-ops');
  await sim.page.click('[data-op="read"]');
  await sim.page.fill('[data-field="index"]', '0');
  await sim.page.click('[data-op="insert"]');
  await sim.page.click('[data-op="delete"]');
  await sim.page.waitForFunction(() => document.querySelectorAll('.mission.is-done').length === 3);
  await sim.page.click('[data-op="append"]');
  await sim.page.waitForSelector('.sim-all-done');
  await sim.page.reload();
  await sim.page.waitForSelector('.mission.is-done');
  assert.equal(await sim.page.textContent('.sim-count'), '4/4');
  // A search the page starts by itself is not the learner's; only clicks count.
  await sim.page.goto(`${base}/en/simulators/binary-search`);
  await sim.page.waitForSelector('.mission');
  assert.equal(await sim.page.locator('.mission.is-done').count(), 0);
  assert.deepEqual([...errors, ...sim.errors], []);
  await sim.page.close();
});

test('quizzes: a lesson quiz runs one question at a time and scores first-try answers', async () => {
  const { page, errors } = await open('/quizzes');
  const first = page.locator('.hub-card').first();
  await first.click();
  await page.waitForSelector('.quiz-runner .quiz');
  const total = Number((await page.textContent('.quiz-step')).match(/of (\d+)/)[1]);
  // First question wrong once, the rest right.
  await page.locator('.quiz [data-quiz-option="false"]').first().click();
  assert.equal(await page.isDisabled('.quiz-runner .demo-button.is-primary'), true);
  await page.click('.quiz [data-quiz-option="true"]');
  for (let i = 0; i < total; i++) {
    if (i > 0) await page.click('.quiz [data-quiz-option="true"]');
    await page.click('.quiz-runner .demo-button.is-primary');
  }
  assert.match(await page.textContent('.quiz-score-number'), new RegExp(`${total - 1} of ${total}`));
  assert.deepEqual(errors, []);
  await page.close();
});
