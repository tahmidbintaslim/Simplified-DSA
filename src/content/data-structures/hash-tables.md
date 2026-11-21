# Hash Tables

A hash table finds a value by its key, such as a name or an ID, without scanning everything. It is the structure behind JavaScript `Map`, Python `dict`, Java `HashMap` and Go `map`, and it shows up in a large share of interview problems. It sounds like magic, but it is one array and one small piece of arithmetic. By the end of this lesson you will be able to do that arithmetic by hand, and say exactly when the "instant lookup" promise holds and when it breaks.

> **Analogy:** A coat check. You hand over your coat and get ticket number 4. Later you show ticket 4 and the attendant walks straight to hook 4. Nobody searches every hook. A hash table turns any key into a hook number like that.

## The Core Idea

An array is fast when you know the index: the computer calculates the address and goes straight there. The trouble is that real keys are names and words, not small numbers.

A hash table closes that gap. It turns the key into a number with a hash function, squeezes that number into the range of an array, and stores the value in that slot. The slots are called buckets.

```text
key "cat"  →  hash function  →  312  →  312 % 7 = 4  →  bucket 4
```

To look the key up later, run the same arithmetic, land on the same bucket, and check only what is inside it. No searching, because you calculated where the key must be.

## The Hash Function, By Hand

This lesson uses a deliberately simple hash so you can follow it: add up the character codes of the letters, then take the remainder after dividing by the number of buckets (7 here). The remainder of a division by 7 is always between 0 and 6, so it is always a valid bucket.

```text
"cat":  c(99) + a(97) + t(116) = 312      312 % 7 = 4
"dog":  d(100) + o(111) + g(103) = 314    314 % 7 = 6
"owl":  o(111) + w(119) + l(108) = 338    338 % 7 = 2
```

```cells
values: · · owl · cat · dog
highlight: 4
note: Seven buckets, numbered 0 to 6. "cat" lives in bucket 4, "dog" in 6 and "owl" in 2.
```

Notice that the keys are not in alphabetical order, or in the order they were added. A hash scatters keys on purpose.

> **Key idea:** The same key always produces the same bucket. That is why lookups can skip the search: you calculate where the key must be.

```quiz
Q: Using the same hash and 7 buckets, which bucket does "act" go to?
- 0
  Why not: Bucket 0 would mean the sum divides evenly by 7. Add up the codes for a, c and t and check the remainder again.
- 2
  Why not: Bucket 2 is where "owl" lands, with a sum of 338. "act" has different letters from "owl", so its sum is different too.
* 4
Why: "act" has the same letters as "cat", so the sum is the same 312, and 312 % 7 = 4.
```

## Collisions

"act" and "cat" both want bucket 4. Two keys landing in the same bucket is a collision. Collisions are not bugs. There are far more possible keys than buckets, so some keys must share, however good the hash function is.

The common fix is chaining: each bucket holds a short list, and colliding keys join it. That means the table must store the key itself next to the value, because landing in the right bucket no longer proves you found the right key. A lookup for "act" goes to bucket 4, then compares keys along the chain:

```cells
values: cat act
pointers: check=0
highlight: 0
note: Bucket 4 holds two keys. Is "cat" the key we want? No. Move along the chain.
```

```cells
values: cat act
pointers: check=1
found: 1
note: "act" matches. 2 comparisons, and the keys in the other six buckets were never looked at.
```

So the real cost of a lookup is one hash calculation plus the length of one chain. Keep the chains short and the lookup is `O(1)`.

> **Watch out:** A bad hash function puts many keys in one bucket, and the table quietly becomes a slow list. Our letter sum is a bad one: every anagram collides. Real hash functions mix the bits so that similar keys land far apart.

## Try It

Type a key and insert it. Read the arithmetic, then find a word that collides with one already in the table. Before you press Insert, work out the bucket yourself.

```demo
```

## Load Factor and Growing

What keeps chains short? Having enough buckets for the keys you store. The measure is the load factor:

```text
load factor = number of keys ÷ number of buckets
```

It is the average chain length. At 0.5 there are twice as many buckets as keys, so most keys sit alone. At 3, an average chain holds three keys.

Add keys below until the chains get long, then double the buckets. Watch which keys change bucket.

```widget
load-factor
```

Two things happened when you doubled. The chains got shorter, because the same keys were spread over more buckets. And many keys moved, because a key's bucket is `sum % number of buckets`: change the number of buckets and the answer changes. That is why a table cannot just add empty buckets on the end. It has to place every key again.

Real hash tables do this for you. They watch the load factor, and when it passes a limit (Java's `HashMap` uses `0.75`) they build a bucket array about twice as big and re-insert every key. That resize is `O(n)`, but doubling makes it rare, so inserts still average `O(1)`. It is the same bargain a growable array makes when it runs out of room.

```quiz
Q: A table has 8 buckets and 6 keys. What is its load factor?
- 1.33
  Why not: That is 8 ÷ 6, buckets divided by keys. The division is the other way round.
* 0.75
- 6
  Why not: That is just the number of keys. Load factor compares the keys to the 8 buckets they share.
Why: Load factor is keys divided by buckets: 6 ÷ 8 = 0.75.
```

```quiz
Q: The letter sum of "bee" is 300. With 4 buckets it sits in bucket 0. The table doubles to 8 buckets. Where is "bee" now?
- Still bucket 0
  Why not: The bucket is the remainder after dividing by the number of buckets. With 8 buckets the division is different, so work it out again.
* Bucket 4
- Bucket 8
  Why not: Eight buckets are numbered 0 to 7, so there is no bucket 8. A remainder is always smaller than the number you divide by.
Why: 300 % 4 = 0, but 300 % 8 = 4, because 300 = 37 × 8 + 4. A resize re-places every key with the new bucket count.
```

## Brute Force vs Hash Table

Problem: given a list of numbers, is any number repeated?

- **Brute force:** compare every number with every other number. That is about `n × n ÷ 2` pairs: `O(n²)`.
- **Hash table:** walk the list once. For each number, ask a hash set "have I seen this?", then add it. One `O(1)` question per number: `O(n)` in total.

Here is the second way on `[4, 9, 2, 9]`.

```cells
values: 4 9 2 9
pointers: at=0
highlight: 0
note: Seen so far: nothing. Is 4 in the set? No. Add it.
```

```cells
values: 4 9 2 9
pointers: at=1
highlight: 1
done: 0
note: Seen: 4. Is 9 in the set? No. Add it.
```

```cells
values: 4 9 2 9
pointers: at=2
highlight: 2
done: 0 1
note: Seen: 4, 9. Is 2 in the set? No. Add it.
```

```cells
values: 4 9 2 9
pointers: at=3
found: 3
done: 0 1 2
note: Seen: 4, 9, 2. Is 9 in the set? Yes. A repeat, found with 4 lookups and no looking back.
```

For 10,000 numbers that is about 50,000,000 comparisons versus 10,000 lookups.

> **When to use it:** "Have I seen this before?", "count how many times each thing appears", "find the pair that adds up to a target", "group things by a key". Almost any time you think "I need to search for this again and again".

## Cost Cheat Sheet

| Operation | Average | Worst case | Why |
| --- | --- | --- | --- |
| Insert | `O(1)` | `O(n)` | One hash, then add to one short chain; a resize re-places every key |
| Look up | `O(1)` | `O(n)` | One hash, then one chain; worst case every key is in that chain |
| Remove | `O(1)` | `O(n)` | Find the key in its chain, then unlink it |
| Keys in sorted order | not supported | not supported | Hashing scatters keys on purpose; use a tree instead |

```deep-dive
title: Deep dive: a hash table with no chains at all
Chaining is not the only way to handle a collision. The other big family is **open addressing**: every bucket holds at most one key, and there are no lists.

When a key's bucket is taken, the table tries the next bucket, then the next, wrapping round at the end, until it finds a free one. This is called linear probing. A lookup follows the same trail: start at the key's bucket and step forward until you find the key or reach an empty bucket.

Removing a key is the tricky part. If you simply emptied its bucket, a later lookup would stop at that hole and miss keys stored further along the trail. So the bucket is marked "deleted" instead: lookups step over it, and inserts may reuse it.

Open addressing keeps everything in one array, which is kind to the processor's cache, but it needs a load factor well below 1, because a full array has nowhere left to probe.
```

> **Watch out:** Two habits that break hash tables. First, do not change a key after inserting it: its hash would change, and the table would look in the wrong bucket. Python refuses to use a list as a dictionary key for exactly this reason. Second, do not count on the order of the keys. Java's `HashMap` promises no order at all, Go's `map` order is unspecified, and Python's `dict` keeps insertion order, which is still not sorted order.

> **Interview tip:** If your first idea has a loop inside a loop that searches for something, ask whether a hash map could remember it instead. That single move turns many `O(n²)` answers into `O(n)`.

## What To Remember

- A hash table is an array plus a function that turns keys into indexes.
- A lookup costs one hash calculation plus the length of one chain.
- Load factor is keys ÷ buckets. Tables grow and re-place every key to keep it low.
- The `O(1)` promise depends on a good hash function and a low load factor. Without them the worst case is `O(n)`.

## Practice Prompt

With 7 buckets and the letter-sum hash, find two other three-letter words that collide with "cat". What would happen to lookups if every stored word collided?

```answer
"act" has the same letters, so the same sum (312) and the same bucket, 4. Two words with different letters also land in bucket 4:

- "ear": e(101) + a(97) + r(114) = 312, and 312 % 7 = 4.
- "fox": f(102) + o(111) + x(120) = 333, and 333 % 7 = 4.

If every stored word collided, they would all sit in one bucket's chain. Every lookup would walk that chain one key at a time, so the table would behave like a plain list: `O(n)` instead of `O(1)`.
```

## Sources Checked

- [Open Data Structures: ChainedHashTable, hashing with chaining](https://opendatastructures.org/ods-java/5_1_ChainedHashTable_Hashin.html)
- [Open Data Structures: LinearHashTable, linear probing](https://opendatastructures.org/ods-java/5_2_LinearHashTable_Linear_.html)
- [Java HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [Python dict](https://docs.python.org/3/library/stdtypes.html#mapping-types-dict)
- [Go maps in action](https://go.dev/blog/maps)
