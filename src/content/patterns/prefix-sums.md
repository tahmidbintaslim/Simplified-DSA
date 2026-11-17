# Prefix Sums

A prefix sum array stores running totals: `prefix[i]` is the sum of the first `i` values. Build it once in `O(n)`, and then the sum of any stretch `a[l..r]` is one subtraction: `prefix[r+1] - prefix[l]`. Many questions about ranges stop costing `O(n)` each.

> **Analogy:** A car's odometer. To know how far you drove between two towns, you do not re-drive the road and count. You read the odometer at both towns and subtract.

## The Problem

You have a list and many questions of the form "what is the sum from index `l` to index `r`?".

```cells
values: 3 -1 4 1 5 9
note: How much is a[2] + a[3] + a[4]? And a[0..5]? And a[1..2]? Imagine a thousand such questions.
```

## Brute Force First

Add the values in the range for every question. A range can be the whole list, so one question costs up to `n` additions, and `q` questions cost `O(n · q)`.

> **Key idea:** The sum from `l` to `r` is "everything up to `r`" minus "everything before `l`". If those running totals are already written down, every question is one subtraction.

## Worked Example

Build the running totals for `[3, -1, 4, 1, 5, 9]`. `prefix` has one more slot than the list, starting at `0`.

```cells
values: 0 3 2 6 7 12 21
done: 1 2 3 4 5 6
note: prefix = [0, 3, 2, 6, 7, 12, 21]. Each entry is the one before plus the next value: 0+3, 3-1, 2+4, 6+1, 7+5, 12+9.
```

Now ask for `a[2..4]` (the values 4, 1 and 5).

```cells
values: 0 3 2 6 7 12 21
pointers: l=2 r+1=5
highlight: 2 5
note: sum(2..4) = prefix[5] - prefix[2] = 12 - 2 = 10. Check: 4 + 1 + 5 = 10.
```

Building took 6 additions once. After that, every question is a single subtraction, whether the range has 1 value or a million.

```quiz
Q: With prefix = [0, 3, 2, 6, 7, 12, 21], what is the sum of a[0..1]?
* 2
- 3
  Why not: That is a[0] alone, which is prefix[1]. The range 0..1 also includes a[1], which is -1.
- 6
  Why not: That is prefix[3], the sum of a[0..2]. It also counts a[2] = 4, which is outside the range.
Why: sum(0..1) = prefix[2] - prefix[0] = 2 - 0 = 2. Check: 3 + (-1) = 2.
```

## Try It

Step through the build, one running total at a time. Then change `l` and `r` and ask again: only the last step changes. Type your own list to try negative numbers.

```demo
```

## Other Shapes Of The Pattern

- **Count instead of add:** prefix counts answer "how many vowels / ones / even numbers are in `a[l..r]`?" the same way.
- **Subarray sum equals k:** walk once, keep each prefix total in a hash map, and ask "have I seen `total - k` before?". That finds every range adding up to `k` in `O(n)`.
- **2D grids:** a prefix table over rows and columns answers "sum of this rectangle" with four lookups.

```quiz
Q: Why does `prefix` have n + 1 entries instead of n?
- To leave room for the answer
  Why not: Answers are not stored in `prefix`. Each one is worked out by a subtraction when you ask.
* So prefix[0] = 0 lets ranges that start at index 0 use the same formula
- Because arrays start at 1
  Why not: Arrays in this lesson start at index 0, like a[0] = 3. The extra slot is about the formula, not about where counting starts.
Why: sum(0..r) = prefix[r+1] - prefix[0] = prefix[r+1] - 0. Without the leading 0 you would need a special case for every range that starts at the beginning.
```

> **When to use it:** Many sum or count questions over ranges of the same list, and the list does not change between questions. Also "find a subarray that adds up to k".

> **Watch out:** If values change between questions, a plain prefix array goes stale: every update forces an `O(n)` rebuild. Then reach for a Fenwick tree or a segment tree. And mind the off-by-one: the range `l..r` uses `prefix[r+1]`, not `prefix[r]`.

## Cost Cheat Sheet

| Approach | Build | Each question | Extra space |
| --- | --- | --- | --- |
| Add the range every time | none | `O(n)` | `O(1)` |
| Prefix sums | `O(n)` | `O(1)` | `O(n)` |

> **Interview tip:** When you hear "many queries" or "sum of a subarray", say "I can precompute running totals in `O(n)`, then each range is `prefix[r+1] - prefix[l]` in `O(1)`". Then mention the off-by-one before the interviewer has to.

## What To Remember

- `prefix[0] = 0`, `prefix[i+1] = prefix[i] + a[i]`.
- `sum(l..r) = prefix[r+1] - prefix[l]`.
- Pay `O(n)` once, then every range question is `O(1)`, as long as the list does not change.

## Practice Prompt

For `[2, 7, 1, 8, 2, 8]`, write the prefix array, then use it to find `sum(1..3)` and `sum(3..5)`.

```answer
prefix = [0, 2, 9, 10, 18, 20, 28].

sum(1..3) = prefix[4] - prefix[1] = 18 - 2 = 16. Check: 7 + 1 + 8 = 16.

sum(3..5) = prefix[6] - prefix[3] = 28 - 10 = 18. Check: 8 + 2 + 8 = 18.
```

## Sources Checked

- [USACO Guide: Introduction to Prefix Sums](https://usaco.guide/silver/prefix-sums)
- [LeetCode 303: Range Sum Query - Immutable](https://leetcode.com/problems/range-sum-query-immutable/)
