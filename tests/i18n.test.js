import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dict, LOCALES } from '../lib/i18n.js';
import { allLessons, buildArticle, findLesson, lessonMarkdown } from '../lib/lessons.js';
import { bnLessons, bnSections } from '../src/content/bn/curriculum.js';
import { curriculum } from '../src/content/curriculum.js';
import { resources } from '../db/resources.js';

// Every key in English exists in Bangla with the same kind of value, all the way down.
const shape = (value) =>
  typeof value === 'function' ? 'fn' : Array.isArray(value) ? 'array' : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)])) : typeof value;

test('the Bangla dictionary has every English key', () => {
  assert.deepEqual(shape(dict('bn')), shape(dict('en')));
});

test('every section and lesson has a Bangla title, summary and goals', () => {
  for (const section of curriculum) {
    assert.ok(bnSections[section.id]?.title, section.id);
    for (const lesson of section.lessons) {
      const bn = bnLessons[lesson.id];
      assert.ok(bn?.title && bn.summary, lesson.id);
      assert.equal(bn.goals.length, lesson.goals.length, `${lesson.id} goals`);
    }
  }
});

test('a Bangla lesson keeps the shared ids, and an untranslated one falls back to English', () => {
  const found = findLesson('bn', 'data-structures', 'arrays-and-strings');
  const { markdown, fallback } = lessonMarkdown('bn', 'data-structures', 'arrays-and-strings');
  assert.equal(fallback, false);
  const { html, headings } = buildArticle(markdown, { lang: 'bn', ...found, demo: { title: 'ডেমো' } });
  for (const id of ['cost-cheat-sheet', 'what-to-remember', 'practice-prompt', 'when-to-use', 'demo-title']) assert.ok(html.includes(`id="${id}"`), id);
  assert.ok(html.includes('<details class="sources">'));
  assert.ok(!headings.some(({ text }) => text.includes('{#')), 'ids are stripped from heading text');

  // A language without a file for a lesson falls back to the English text.
  const missing = lessonMarkdown('xx', 'algorithms', 'sorting');
  assert.equal(missing.fallback, true);
  assert.match(missing.markdown, /^# Sorting/);
});

test('lesson paths carry the language', () => {
  assert.deepEqual(LOCALES, ['en', 'bn']);
  assert.equal(allLessons('bn').length, allLessons('en').length);
  assert.equal(findLesson('bn', 'algorithms', 'big-o').next.lesson.title, 'বাইনারি সার্চ');
});

test('the resource library is well formed and every topic is a real lesson', () => {
  const lessonIds = new Set(['general', ...curriculum.flatMap((s) => s.lessons.map((l) => l.id))]);
  const urls = new Set();
  for (const r of resources) {
    assert.ok(/^https:\/\//.test(r.url), r.url);
    assert.ok(!urls.has(r.url), `duplicate ${r.url}`);
    urls.add(r.url);
    assert.ok(['en', 'bn'].includes(r.lang), r.url);
    assert.ok(['article', 'visualizer', 'video', 'course', 'practice', 'book', 'reference'].includes(r.kind), r.url);
    assert.ok(['basics', 'interview', 'cp'].includes(r.track), r.url);
    assert.ok(r.title && r.author && r.note_en && r.note_bn, r.url);
    assert.ok(r.topics.length && r.topics.every((t) => lessonIds.has(t)), `${r.url} topics`);
  }
  // Every lesson has at least one resource to go deeper with.
  for (const id of lessonIds) assert.ok(resources.some((r) => r.topics.includes(id)), `no resource for ${id}`);
});

test('every mission belongs to a real demo and reads in both languages', async () => {
  const { missions } = await import('../src/demos/missions.js');
  const demoIds = new Set(curriculum.flatMap((s) => s.lessons.map((l) => l.demo)));
  for (const [demo, list] of Object.entries(missions)) {
    assert.ok(demoIds.has(demo), demo);
    for (const m of list) {
      assert.ok(m.en && m.bn && m.hint.en && m.hint.bn, `${demo}/${m.id}`);
      assert.equal(typeof m.done, 'function');
    }
  }
  // A sample event: inserting at the front completes exactly that mission.
  const hit = missions['array-ops'].filter((m) => m.done({ op: 'insert', index: 0, moved: 5 })).map((m) => m.id);
  assert.deepEqual(hit, ['front']);

  // Sample events from the other demos complete exactly the mission they teach.
  const hits = (demo, detail) => missions[demo].filter((m) => m.done(detail)).map((m) => m.id);
  assert.deepEqual(hits('linked-list', { op: 'find', found: false, index: -1, n: 3 }), ['missing']);
  assert.deepEqual(hits('stack-queue', { op: 'dequeue', empty: false, left: 0 }), ['fifo', 'drain']);
  assert.deepEqual(hits('bst', { op: 'sorted', size: 7, height: 7 }), ['line']);
  assert.deepEqual(hits('sorting', { op: 'sort', algorithm: 'insertion', n: 12, moves: 1, reversed: false, passes: 0 }), ['nearly']);
  assert.deepEqual(hits('grid-traversal', { op: 'run', mode: 'dfs', found: true, bfsPath: 18, dfsPath: 58, walls: 14 }), ['dfs']);
  // The player's predict event only counts for missions that ask for predictions.
  for (const [demo, list] of Object.entries(missions)) {
    for (const m of list) assert.equal(m.done({ op: 'predict', right: true }), m.id === 'predict', `${demo}/${m.id}`);
  }
});
