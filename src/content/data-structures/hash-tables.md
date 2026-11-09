# Hash Tables

A hash table finds a value by its key without scanning. It is the structure behind JavaScript `Map`, Python `dict`, Java `HashMap` and Go `map`.

## The Core Idea

An array is fast when you know the index. A hash table turns any key into an index using a hash function, then stores the value in an array slot called a bucket.

```text
key "cat" → hash function → 312 → 312 % 7 = 4 → bucket 4
```

Looking the key up later repeats the same arithmetic, lands on the same bucket, and checks only what is inside it.

## The Hash Function

A hash function takes a key and returns a number. It must always return the same number for the same key. A good one also spreads different keys evenly across the buckets.

The demo uses a deliberately weak function: add up the character codes, then take the remainder after dividing by the number of buckets. It is easy to follow by hand, and it shows the weakness quickly: `"cat"` and `"act"` have the same letters, so they get the same hash.

## Collisions

When two keys land in the same bucket, that is a collision. Collisions are not bugs. With more possible keys than buckets, they are guaranteed.

Two common fixes:

- **Chaining:** each bucket holds a small list. Colliding keys join the list. This is what the demo shows.
- **Open addressing:** if the bucket is taken, try the next one (or another one picked by a rule) until a free slot appears.

## Load Factor and Resizing

The load factor is the number of keys divided by the number of buckets. As it rises, chains get longer and lookups slow down.

Real hash tables watch the load factor. When it passes a limit (often around `0.75`), they allocate a bigger bucket array and re-insert every key. That resize is `O(n)`, but it happens rarely enough that the average insert stays `O(1)`.

## Cost Summary

- Insert, look up, remove: `O(1)` on average.
- Worst case, when every key collides into one bucket: `O(n)`.
- Keys come back in no useful order. If you need sorted keys, use a tree instead.

## What To Remember

- A hash table is an array plus a function that turns keys into indexes.
- Equal keys must hash equally, so keys should not change after you insert them.
- The `O(1)` promise depends on a good hash function and a low load factor.

## Practice Prompt

With 7 buckets and the demo's sum-of-codes hash, which other three-letter words collide with `"cat"`? What would happen to lookups if every word you stored was an anagram of every other?

## Sources Checked

- [Open Data Structures: Hash Tables](https://opendatastructures.org/ods-java/5_Hash_Tables.html)
- [Java HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [Python dict](https://docs.python.org/3/library/stdtypes.html#mapping-types-dict)
