# Sliding Window

A sliding window is a stretch of neighbouring values that you move along a list one step at a time. The trick is in how you move it: one value enters, one value leaves, and you fix up the answer you already had instead of working it out again. By the end of this lesson you will be able to say exactly how much work that saves, and why a window that grows and shrinks is still fast.

> **Analogy:** You are on a train, looking out of a window that shows three houses at a time. When the train moves on by one house, a new house appears on the right and one slips away on the left. The house in the middle has not changed, so you do not need to look at it again.

## The Problem

Find the largest sum of `k` values in a row. Here, `k = 3`:

```cells
values: 2 1 5 1 3 2
note: Which three neighbouring values have the biggest total?
```

Each stretch of 3 neighbours is called a **window**. This list has 4 of them: one starting at index 0, one at index 1, one at 2 and one at 3. In general a list of `n` values has `n − k + 1` windows of size `k`.

## Brute Force First

The obvious plan is to add up every window from scratch: `2+1+5`, then `1+5+1`, then `5+1+3`, then `1+3+2`.

Count the work. Recomputing one window means adding its `k` values, so each window costs `O(k)`. There are about `n` windows, so all of them together cost `O(n · k)`. Here that is 4 windows × 3 values = 12 values added.

Twelve is nothing. But look at what you did along the way: you added the `5` three times and the first `1` twice. The bigger the window, the more of that repeated work there is.

> **Key idea:** Two neighbouring windows share every value except two. So the new sum is the old sum, plus the value that enters, minus the value that leaves. That is 2 operations per step, however big the window is: `O(1)`.

## Worked Example

Here is the same search, done by sliding. Step through it with Next.

```cells
values: 2 1 5 1 3 2
pointers: start=0 end=2
done: 0 1 2
note: First window: 2 + 1 + 5 = 8. This one has to be added up in full. Best so far: 8.
```

```cells
values: 2 1 5 1 3 2
pointers: start=1 end=3
done: 1 2
highlight: 3
note: Slide: add 1 (entering), subtract 2 (leaving). 8 + 1 - 2 = 7. Best is still 8.
```

```cells
values: 2 1 5 1 3 2
pointers: start=2 end=4
done: 2 3
highlight: 4
note: Slide: add 3, subtract 1. 7 + 3 - 1 = 9. New best: 9.
```

```cells
values: 2 1 5 1 3 2
pointers: start=3 end=5
done: 3 4
highlight: 5
note: Slide: add 2, subtract 5. 9 + 2 - 5 = 6. Best stays 9, from the window 5, 1, 3.
```

The teal cells in the middle are the point: they were already inside the sum, so nobody touched them. Each slide costs `O(1)`, and there are fewer than `n` slides, so the whole scan is `O(n)`.

```quiz
Q: In `[4, 2, 7, 1]` with `k = 2`, the first window `[4, 2]` sums to 6. What is the sum after one slide?
- 8
  Why not: The new window holds 2 and 7, which do not add up to 8. Try adding the entering value and subtracting the leaving one.
* 9
- 13
  Why not: That is 6 + 7, which adds the entering 7 but forgets to remove the leaving 4.
Why: The window becomes [2, 7]. Add the entering 7 and subtract the leaving 4: 6 + 7 - 4 = 9.
```

With a small `k` the saving looks tiny. It is not, once the window is big.

```quiz
Q: A list has 1,000 values and the window size is `k = 100`. Recomputing a window adds 100 values. How many operations does one slide take?
* 2
- 100
  Why not: That is the cost of recomputing the window from scratch. A slide leaves the 99 values in the middle alone.
- 1,000
  Why not: That is the length of the whole list. A slide only touches the value that enters and the value that leaves.
Why: One addition for the value that enters, one subtraction for the value that leaves. The 901 windows cost about 90,000 additions when recomputed, and about 1,900 operations when slid.
```

## Try It

Change `k` or type your own list, then step through. Teal is inside the window, and gold is the value that just entered. The line under the array compares the additions with recomputing every window. Make `k` bigger and watch which of the two numbers grows.

```demo
```

## Windows That Grow And Shrink

Some problems give you a rule instead of a size. "Find the longest stretch with no repeated letter" is one. The window grows to the right while the rule holds, and shrinks from the left when the rule breaks.

```cells
values: a b c a b
pointers: start=0 end=2
done: 0 1 2
note: "abc" has no repeated letter, so the window keeps growing. Longest so far: 3.
```

```cells
values: a b c a b
pointers: start=0 end=3
done: 1 2
highlight: 0 3
note: The next letter is a second "a". The rule is broken, so the window must shrink from the left.
```

```cells
values: a b c a b
pointers: start=1 end=3
done: 1 2 3
dim: 0
note: Drop the left "a". The window "bca" is fine again, and the left edge stays at index 1. It never goes back.
```

This looks like it could be slow: a loop that grows the window, with another loop inside it that shrinks. Drive one yourself and count. Take letters until the rule breaks, drop from the left until it is fixed, and keep an eye on the two bars.

```widget
window-stretch
```

Both bars only ever fill up. A letter enters the window once, and it can leave at most once, because neither edge ever moves left. For `n` letters that is at most `n` moves of the right edge plus `n` moves of the left edge: `2n` in total, which is `O(n)`. The inner loop does not multiply the work; it just spends from the same budget.

```quiz
Q: A grow-and-shrink window has scanned a list of 10 values, so its right edge moved 10 times. What is the most its left edge can have moved?
- 45
  Why not: That counts every possible pair of start and end. The window never tries them all, because its left edge does not go back.
* 10
- 100
  Why not: That would be 10 shrinks for each of the 10 grows. But a value that has left the window is gone for good, so the shrinks add up to at most 10 over the whole scan.
Why: The left edge only moves right, and it cannot pass the right edge. So it moves at most 10 times in total, however those moves are spread out.
```

```quiz
Q: Which problem is a sliding-window problem?
* The longest run of days whose total rainfall stays under 50 mm
- Two numbers anywhere in a list that add up to a target
  Why not: The two numbers can be far apart, with other values between them. A window only covers values that sit next to each other.
- The shortest path through a maze
  Why not: A maze is a graph of paths, not a row of consecutive values. There is no window that slides along it.
Why: "A run of days" means consecutive values, and the rule ("total under 50") can be kept up to date as days enter and leave. Pairs from anywhere suit a hash set or two pointers; mazes suit BFS.
```

> **When to use it:** The words "subarray", "substring", "consecutive", "contiguous" or "in a row" appear, and you want a best, longest, shortest or count over those stretches.

> **Watch out:** A grow-and-shrink window needs a rule that shrinking always helps to fix. "Sum at most X" is such a rule only when no value is negative. With negative numbers it can give a wrong answer, and you need a different technique, such as prefix sums.

## Cost Cheat Sheet

| Approach | Time | Extra space | Why |
| --- | --- | --- | --- |
| Recompute every window | `O(n · k)` | `O(1)` | About `n` windows, and each one adds `k` values |
| Fixed-size sliding window | `O(n)` | `O(1)` | Each slide is one addition and one subtraction |
| Grow-and-shrink window | `O(n)` | `O(1)` for a running sum, up to `O(k)` for a set of what is inside | Each value enters once and leaves at most once |

```deep-dive
title: Deep dive: how do negative numbers break a grow-and-shrink window?
Look for the longest run with a sum of at most 5 in `[4, 3, -6, 2]`.

The window takes 4, then 3. The sum is 7, which is too big, so it drops the 4. Then it takes -6 and 2 and finishes with `[3, -6, 2]`, length 3.

But the whole list adds up to 4 + 3 - 6 + 2 = 3, which is allowed, and it has length 4. The window threw the 4 away too early. It assumed that a sum which is too big can only be fixed by shrinking. A negative number later on can also fix it, and the window has no way to know that one is coming.

Not every answer can be slid either. A sum can be fixed up when a value leaves, because subtraction undoes addition. A minimum cannot: when the smallest value leaves, nothing tells you what the next smallest is. A sliding minimum needs a helper structure (a queue that keeps its candidates in order), which still costs `O(n)` in total.
```

> **Interview tip:** Describe what your window "remembers" (a running sum, a count of letters, a set of seen values) and the exact moment it shrinks. Most window bugs are about when to shrink, not how to grow.

## What To Remember

- A window is a stretch of neighbouring values.
- Recomputing a window costs `O(k)`, so `n` windows cost `O(n · k)`. Sliding costs `O(1)` per step, so the whole scan is `O(n)`.
- Slide by adding what enters and removing what leaves; never recount the middle.
- A grow-and-shrink window is still `O(n)`: each value enters once and leaves at most once.

## Practice Prompt

For `[3, 8, 1, 9, 2, 7]` and `k = 2`, write every window sum using the slide rule. Then find the longest run of values that add up to at most 12.

```answer
The first window is 3 + 8 = 11. Then each slide adds the value that enters and subtracts the one that leaves:

- 11 + 1 − 3 = 9 for `[8, 1]`
- 9 + 9 − 8 = 10 for `[1, 9]`
- 10 + 2 − 1 = 11 for `[9, 2]`
- 11 + 7 − 9 = 9 for `[2, 7]`

The sums are 11, 9, 10, 11 and 9.

The longest run that adds up to at most 12 has 3 values: `[3, 8, 1]` (12) or `[1, 9, 2]` (12). Adding any neighbour to either goes over 12.
```

## Sources Checked

- [USACO Guide: Two Pointers (includes sliding windows)](https://usaco.guide/silver/two-pointers)
- [CP-Algorithms: Minimum stack / minimum queue (sliding window minimum)](https://cp-algorithms.com/data_structures/stack_queue_modification.html)
