import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonPath, resolvePath } from '../src/core/router.js';

// Same shape as src/content/curriculum.js, without the Markdown imports
// that only Vite can load.
const sections = [
  {
    id: 'data-structures',
    lessons: [{ id: 'arrays-and-strings' }, { id: 'linked-lists' }],
  },
  {
    id: 'algorithms',
    lessons: [{ id: 'big-o' }],
  },
];

test('lessonPath builds /section/lesson', () => {
  assert.equal(lessonPath('algorithms', 'big-o'), '/algorithms/big-o');
});

test('the root path opens the first lesson and stays "/"', () => {
  assert.deepEqual(resolvePath(sections, '/'), {
    sectionId: 'data-structures',
    lessonId: 'arrays-and-strings',
    path: '/',
  });
});

test('a lesson path opens that lesson', () => {
  assert.deepEqual(resolvePath(sections, '/algorithms/big-o'), {
    sectionId: 'algorithms',
    lessonId: 'big-o',
    path: '/algorithms/big-o',
  });
  assert.equal(resolvePath(sections, '/data-structures/linked-lists').lessonId, 'linked-lists');
});

test('a trailing slash resolves to the clean path', () => {
  assert.equal(resolvePath(sections, '/algorithms/big-o/').path, '/algorithms/big-o');
});

test('a section path opens its first lesson', () => {
  assert.equal(resolvePath(sections, '/algorithms').path, '/algorithms/big-o');
});

test('an unknown lesson falls back to the first lesson of its section', () => {
  assert.equal(resolvePath(sections, '/algorithms/heaps').path, '/algorithms/big-o');
});

test('unknown sections, extra segments and bad escapes fall back to "/"', () => {
  for (const pathname of ['/nope', '/nope/big-o', '/algorithms/big-o/extra', '/%E0%A4%A']) {
    const route = resolvePath(sections, pathname);
    assert.equal(route.path, '/', pathname);
    assert.equal(route.lessonId, 'arrays-and-strings', pathname);
  }
});
