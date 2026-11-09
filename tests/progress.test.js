import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCompleted, saveCompleted } from '../src/core/progress.js';

const memoryStorage = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
};

test('progress round-trips through storage', () => {
  const storage = memoryStorage();
  saveCompleted(new Set(['algorithms/big-o']), storage);
  assert.deepEqual([...loadCompleted(storage)], ['algorithms/big-o']);
});

test('broken, foreign or throwing storage gives empty progress instead of an error', () => {
  const storage = memoryStorage();
  storage.setItem('simplified-dsa:completed', '{not json');
  assert.equal(loadCompleted(storage).size, 0);
  storage.setItem('simplified-dsa:completed', '[1, "a/b", null]');
  assert.deepEqual([...loadCompleted(storage)], ['a/b']);
  const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(loadCompleted(throwing).size, 0);
  assert.doesNotThrow(() => saveCompleted(new Set(['x']), throwing));
  assert.equal(loadCompleted(undefined).size, 0);
});

test('a browser that throws on reading localStorage itself still loads', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError: site data is blocked');
    },
  });
  try {
    assert.equal(loadCompleted().size, 0);
    assert.doesNotThrow(() => saveCompleted(new Set(['x'])));
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
