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

  const sorting = lessonMarkdown('bn', 'algorithms', 'sorting');
  assert.equal(sorting.fallback, true);
  assert.match(sorting.markdown, /^# Sorting/);
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
