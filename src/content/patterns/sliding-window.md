# Sliding Window

A sliding window looks at a stretch of consecutive values and moves it along the data, updating the answer as one value enters and one leaves. Instead of recounting every stretch from scratch, you adjust what you already know.

> **Analogy:** A train passing a platform, looking through a window that shows three carriages. As the train moves one carriage forward, one new carriage appears on the right and one disappears on the left. You do not need to look at the middle carriage again; it is still there.

## The Problem

Find the largest sum of `k` values in a row. Here, `k = 3`:

```cells
values: 2 1 5 1 3 2
note: Which three neighbouring values have the biggest total?
```

## Brute Force First

Add up every window of 3 separately: `2+1+5`, then `1+5+1`, then `5+1+3`, then `1+3+2`. That is 4 windows × 3 additions = 12 additions. For `n` values and window size `k` it is about `n × k` work, which gets slow when both are large.

> **Key idea:** Two neighbouring windows share all but two values. Moving one step right, the new sum is the old sum, plus the value that enters, minus the value that leaves.

## Worked Example

```cells
values: 2 1 5 1 3 2
pointers: start=0 end=2
done: 0 1 2
note: First window: 2 + 1 + 5 = 8. Best so far: 8.
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

Every slide is 2 operations, no matter how big `k` is, so the whole scan is `O(n)`.

```quiz
Q: In `[4, 2, 7, 1]` with `k = 2`, the first window `[4, 2]` sums to 6. What is the sum after one slide?
- 8
* 9
- 13
Why: The window becomes [2, 7]. Add the entering 7 and subtract the leaving 4: 6 + 7 - 4 = 9.
```

## Try It

Change `k` or type your own list, then step through. Teal is inside the window, and gold is the value that just entered. The line under the array compares the additions with recomputing every window.

```demo
```

## Windows That Grow And Shrink

Some problems have no fixed size. "Longest stretch with no repeated letter" grows the window to the right while it is valid, and shrinks it from the left when it breaks a rule.

```cells
values: a b c a
pointers: start=0 end=3
done: 0 1 2
highlight: 3
note: "abc" has no repeats. Adding the second "a" breaks the rule, so drop letters from the left until the window is valid again: "bca".
```

Each letter enters once and leaves at most once, so this is still `O(n)`.

```quiz
Q: Which problem is a sliding-window problem?
* The longest run of days whose total rainfall stays under 50 mm
- Two numbers anywhere in a list that add up to a target
- The shortest path through a maze
Why: "A run of days" means consecutive values, and the rule ("total under 50") can be kept up to date as days enter and leave. Pairs from anywhere suit a hash set or two pointers; mazes suit BFS.
```

> **When to use it:** The words "subarray", "substring", "consecutive", "contiguous" or "in a row" appear, and you want a best, longest, shortest or count over those stretches.

> **Watch out:** A plain window that only grows and shrinks to the right needs a rule that stays valid as it shrinks. With negative numbers, "sum at most X" can break that, and a different technique (such as prefix sums) is needed.

## Cost Cheat Sheet

| Approach | Time | Extra space |
| --- | --- | --- |
| Recompute every window | `O(n × k)` | `O(1)` |
| Fixed-size sliding window | `O(n)` | `O(1)` |
| Variable window with a hash set of what is inside | `O(n)` | `O(k)` for the set |

> **Interview tip:** Describe what your window "remembers" (a running sum, a count of letters, a set of seen values) and the exact moment it shrinks. Most window bugs are about when to shrink, not how to grow.

## What To Remember

- A window is a stretch of consecutive values.
- Slide it by adding what enters and removing what leaves; never recount the middle.
- Fixed windows move both ends together; flexible windows grow right and shrink left.

## Practice Prompt

For `[3, 8, 1, 9, 2, 7]` and `k = 2`, write every window sum using the slide rule. Then find the longest run of values that add up to at most 12.

## Sources Checked

- [USACO Guide: Two Pointers (includes sliding windows)](https://usaco.guide/silver/two-pointers)
- [CP-Algorithms: Minimum stack / minimum queue (sliding window minimum)](https://cp-algorithms.com/data_structures/stack_queue_modification.html)
