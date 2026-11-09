/**
 * Lesson progress, kept in this browser only (no account, nothing sent).
 *
 * Storage can be missing or throw (private windows, blocked site data), so
 * every read and write is guarded and the app works without it.
 */
const KEY = 'simplified-dsa:completed';

export function loadCompleted(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveCompleted(completed, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify([...completed]));
  } catch {
    // Progress simply is not remembered; the lesson still works.
  }
}
