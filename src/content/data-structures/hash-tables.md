# Hash Tables

A hash table finds a value by its key, such as a name or an ID, without scanning everything. It is the structure behind JavaScript `Map`, Python `dict`, Java `HashMap` and Go `map`, and it shows up in a large share of interview problems.

> **Analogy:** A coat check. You hand over your coat and get ticket number 4. Later you show ticket 4 and the attendant walks straight to hook 4. Nobody searches every hook. A hash table turns any key into a hook number like that.

## The Core Idea

An array is fast when you know the index. A hash table makes up an index from the key, using a hash function, then stores the value in that slot. The slots are called buckets.

```text
key "cat"  →  hash function  →  312  →  312 % 7 = 4  →  bucket 4
```

To look the key up later, run the same arithmetic, land on the same bucket, and check only what is inside it.

## The Hash Function, By Hand

This lesson uses a deliberately simple hash so you can follow it: add up the character codes, then take the remainder after dividing by the number of buckets (7 here).

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

> **Key idea:** The same key always produces the same bucket. That is why lookups can skip the search: you calculate where the key must be.

```quiz
Q: Using the same hash and 7 buckets, which bucket does "act" go to?
- 0
- 2
* 4
Why: "act" has the same letters as "cat", so the sum is the same 312, and 312 % 7 = 4.
```

## Collisions

"act" and "cat" both want bucket 4. Two keys landing in the same bucket is a collision. Collisions are not bugs: there are far more possible keys than buckets, so they always happen.

The common fix is chaining: each bucket holds a short list, and colliding keys join it.

```text
bucket 4:  "cat" → "act"
```

A lookup for "act" goes to bucket 4, then checks the 2 keys there. Still far fewer than checking every key in the table.

> **Watch out:** A bad hash function puts many keys in one bucket, and the table quietly becomes a slow list. Real hash functions mix the bits far better than our letter sum.

Type a key and insert it. Look at the arithmetic, then find a word that collides with one already in the table.

```demo
```

## Load Factor and Growing

Load factor = keys ÷ buckets. As it rises, chains get longer and lookups slow down. Real hash tables watch it, and when it passes a limit (often about `0.75`) they make a bigger bucket array and re-insert every key. That resize is `O(n)`, but it happens rarely, so inserts still average `O(1)`.

```quiz
Q: A table has 8 buckets and 6 keys. What is its load factor?
- 1.33
* 0.75
- 6
Why: Load factor is keys divided by buckets: 6 ÷ 8 = 0.75.
```

## Brute Force vs Hash Table

Problem: given a list of numbers, is any number repeated?

- **Brute force:** compare every number with every other number. About `n × n` comparisons: `O(n²)`.
- **Hash table:** walk the list once. For each number, check "have I seen this?" in a set, then add it. `O(n)` total.

For 10,000 numbers that is about 100,000,000 comparisons versus 10,000 lookups.

> **When to use it:** "Have I seen this before?", "count how many times each thing appears", "find the pair that adds up to a target", "group things by a key". Almost any time you think "I need to search for this again and again".

## Cost Cheat Sheet

| Operation | Average | Worst case |
| --- | --- | --- |
| Insert | `O(1)` | `O(n)` |
| Look up | `O(1)` | `O(n)` |
| Remove | `O(1)` | `O(n)` |
| Keys in sorted order | not supported | use a tree instead |

> **Interview tip:** If your first idea has a loop inside a loop that searches for something, ask whether a hash map could remember it instead. That single move turns many `O(n²)` answers into `O(n)`.

## What To Remember

- A hash table is an array plus a function that turns keys into indexes.
- Equal keys must hash to the same bucket, so keys should not change after insertion.
- The `O(1)` promise depends on a good hash function and a low load factor.

## Practice Prompt

With 7 buckets and the letter-sum hash, find two other three-letter words that collide with "cat". What would happen to lookups if every stored word collided?

## Sources Checked

- [Open Data Structures: Hash Tables](https://opendatastructures.org/ods-java/5_Hash_Tables.html)
- [Java HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [Python dict](https://docs.python.org/3/library/stdtypes.html#mapping-types-dict)
