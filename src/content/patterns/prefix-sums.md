# Prefix Sums

A prefix sum array is a list of running totals: entry `i` holds the sum of the first `i` values. You build it once, and from then on the sum of any stretch of the list is a single subtraction. By the end of this lesson you will be able to say which two running totals to subtract, why one of them is at `r + 1` and not `r`, and when the trick stops working.

> **Analogy:** A car's odometer. To know how far you drove between two towns, you do not drive the road again and count. You read the odometer at both towns and subtract.

## The Problem

You have a list and many questions of the form "what is the sum from index `l` to index `r`?".

```cells
values: 3 -1 4 1 5 9
note: How much is a[2] + a[3] + a[4]? And a[0..5]? And a[1..2]? Imagine a thousand such questions.
```

## Brute Force First

Add up the values in the range, once per question. A range can be the whole list, so one question costs up to `n` additions, and `q` questions cost `O(n · q)`. With 1,000 values and 1,000 questions, that can be a million additions.

Most of that work is repeated. The questions `a[0..4]` and `a[0..5]` add the same five values, and nothing is kept from one question to the next.

> **Key idea:** The sum from `l` to `r` is "everything up to `r`" minus "everything before `l`". If those running totals are already written down, every question is one subtraction.

## Worked Example

Write the running totals for `[3, -1, 4, 1, 5, 9]` into a new array called `prefix`. It starts with a `0` (the total before anything has been added), so it has one more slot than the list.

```cells
values: 0 _ _ _ _ _ _
highlight: 0
note: Start with prefix[0] = 0: the sum of no values at all.
```

```cells
values: 0 3 _ _ _ _ _
done: 0
highlight: 1
note: prefix[1] = prefix[0] + a[0] = 0 + 3 = 3. Each new entry is the entry before it plus one value.
```

```cells
values: 0 3 2 _ _ _ _
done: 0 1
highlight: 2
note: prefix[2] = prefix[1] + a[1] = 3 + (-1) = 2. A negative value just makes the total go down.
```

```cells
values: 0 3 2 6 7 12 21
done: 0 1 2 3 4 5 6
note: Keep going: 2+4 = 6, 6+1 = 7, 7+5 = 12, 12+9 = 21. Six additions, and prefix is finished.
```

So `prefix[i]` is the sum of the first `i` values, the ones at indexes `0` to `i − 1`. Now ask for `a[2..4]` (the values 4, 1 and 5).

```cells
values: 0 3 2 6 7 12 21
pointers: l=2 r+1=5
highlight: 2 5
note: sum(2..4) = prefix[5] - prefix[2] = 12 - 2 = 10. Check: 4 + 1 + 5 = 10.
```

Building took 6 additions, once. After that, every question is a single subtraction, whether the range has 1 value or a million.

```quiz
Q: With prefix = [0, 3, 2, 6, 7, 12, 21], what is the sum of a[0..1]?
* 2
- 3
  Why not: That is a[0] alone, which is prefix[1]. The range 0..1 also includes a[1], which is -1.
- 6
  Why not: That is prefix[3], the sum of a[0..2]. It also counts a[2] = 4, which is outside the range.
Why: sum(0..1) = prefix[2] - prefix[0] = 2 - 0 = 2. Check: 3 + (-1) = 2.
```

## Why It Is r + 1

The formula is short, and the `+ 1` in it is where almost everyone slips. A picture fixes it better than a rule.

Think of a wall between every two values, and one at each end. `prefix[i]` sits on the wall just before `a[i]`, and holds the sum of everything to the left of that wall. Click two values below to choose a range, and see which two walls it lies between. Then switch on the bug.

```widget
range-subtract
```

A range from `l` to `r` lies between two walls. Its left wall is the one before `a[l]`, which is `prefix[l]`. Its right wall is the one **after** `a[r]`, and that wall belongs to the next index: `prefix[r + 1]`. Use `prefix[r]` instead and you stop one wall early, so the last value of the range is left out.

The picture also shows what the `0` at the front is for. A range that starts at index 0 has the very first wall as its left wall, and nothing is to the left of it.

```quiz
Q: With prefix = [0, 3, 2, 6, 7, 12, 21], what is the sum of a[3..5]?
- 6
  Why not: That is prefix[5] - prefix[3]. prefix[5] stops before a[5], so the 9 at the end of the range is missing.
- 14
  Why not: That is prefix[6] - prefix[4]. prefix[4] already includes a[3], so subtracting it removes the first value of the range.
* 15
Why: sum(3..5) = prefix[6] - prefix[3] = 21 - 6 = 15. Check: 1 + 5 + 9 = 15.
```

```quiz
Q: Why does `prefix` have n + 1 entries instead of n?
- To leave room for the answer
  Why not: Answers are not stored in `prefix`. Each one is worked out by a subtraction when you ask.
* So prefix[0] = 0 lets ranges that start at index 0 use the same formula
- Because arrays start at 1
  Why not: Arrays in this lesson start at index 0, like a[0] = 3. The extra slot is about the formula, not about where counting starts.
Why: sum(0..r) = prefix[r+1] - prefix[0] = prefix[r+1] - 0. Without the leading 0 you would need a special case for every range that starts at the beginning.
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
Q: A list has 1,000 values and its prefix array is already built. You are asked 500 range-sum questions. How many subtractions do they take in total?
* 500
- 1,000
  Why not: That is the length of the list, which is what building prefix cost. Once it is built, the length no longer matters.
- 500,000
  Why not: That is 500 questions × 1,000 values, the brute-force cost. With prefix, a question does not walk through its range.
Why: Each question is one subtraction, however long its range is. 500 questions, 500 subtractions.
```

> **When to use it:** Many sum or count questions over ranges of the same list, and the list does not change between questions. Also "find a subarray that adds up to k".

> **Watch out:** If values change between questions, a plain prefix array goes stale: changing one value changes every running total after it, so each update costs `O(n)`. Then reach for a Fenwick tree or a segment tree. And mind the off-by-one: the range `l..r` uses `prefix[r+1]`, not `prefix[r]`.

## Cost Cheat Sheet

| Approach | Build | Each question | Extra space | Why |
| --- | --- | --- | --- | --- |
| Add the range every time | none | `O(n)` | `O(1)` | A range can be as long as the whole list |
| Prefix sums | `O(n)` | `O(1)` | `O(n)` | One addition per value to build, then one subtraction per question |

```deep-dive
title: Deep dive: why does this work for sums, but not for the biggest value in a range?
The whole trick rests on being able to **undo**. "Everything up to `r`" contains the part before `l` that you do not want, and subtraction takes it back out exactly.

Anything that can be undone works the same way. Counts work, because a count is a sum of ones and zeros. XOR works, because XOR-ing with the same value twice cancels it.

A maximum cannot be undone. If the biggest value up to index 5 is 9, and the biggest value before index 2 is 3, that tells you nothing about the biggest value in `a[2..5]`: the 9 might be inside the range or before it. Range-maximum questions need a different structure, such as a sparse table or a segment tree.

You rarely write the build loop by hand, either. In Python, `itertools.accumulate(a, initial=0)` produces exactly this array, leading `0` included.
```

> **Interview tip:** When you hear "many queries" or "sum of a subarray", say "I can precompute running totals in `O(n)`, then each range is `prefix[r+1] - prefix[l]` in `O(1)`". Then mention the off-by-one before the interviewer has to.

## What To Remember

- `prefix[0] = 0`, `prefix[i+1] = prefix[i] + a[i]`. So `prefix[i]` is the sum of everything before index `i`.
- `sum(l..r) = prefix[r+1] - prefix[l]`: everything up to `r`, minus everything before `l`.
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
- [Python docs: itertools.accumulate](https://docs.python.org/3/library/itertools.html#itertools.accumulate)
