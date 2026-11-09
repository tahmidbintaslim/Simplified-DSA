# Two Pointers

Two pointers is a way to search through ordered data by keeping two positions and moving them toward each other (or in the same direction) based on what you see. It turns many "check every pair" problems from `O(n²)` into `O(n)`.

> **Analogy:** Two people searching a bookshelf sorted by height, one starting from each end. If the pair of books they hold together is too short for the gap, the person at the short end moves inward to a taller book. Too tall? The person at the tall end moves inward. They never need to go back.

## The Problem

Given a **sorted** list, find two values that add up to a target.

```cells
values: 1 3 4 6 8 11
note: Find two values that add up to 10.
```

## Brute Force First

Try every pair: 1+3, 1+4, 1+6, … then 3+4, 3+6, … For 6 values that is 15 pairs. For 10,000 values it is about 50 million. That is `O(n²)`.

> **Key idea:** Sorted order tells you which way to move. If the sum is too small, the only way to grow it is to raise the smaller value. If the sum is too big, the only way to shrink it is to lower the bigger value.

## Worked Example

Start with `L` at the smallest value and `R` at the largest.

```cells
values: 1 3 4 6 8 11
pointers: L=0 R=5
highlight: 0 5
note: Step 1: 1 + 11 = 12, too big. 11 is too big with any partner (1 is the smallest), so move R left.
```

```cells
values: 1 3 4 6 8 11
pointers: L=0 R=4
highlight: 0 4
dim: 5
note: Step 2: 1 + 8 = 9, too small. 1 is too small with any remaining partner (8 is the largest left), so move L right.
```

```cells
values: 1 3 4 6 8 11
pointers: L=1 R=4
highlight: 1 4
dim: 0 5
note: Step 3: 3 + 8 = 11, too big. Move R left.
```

```cells
values: 1 3 4 6 8 11
pointers: L=1 R=3
highlight: 1 3
dim: 0 4 5
note: Step 4: 3 + 6 = 9, too small. Move L right.
```

```cells
values: 1 3 4 6 8 11
pointers: L=2 R=3
done: 2 3
dim: 0 1 4 5
note: Step 5: 4 + 6 = 10. Found it in 5 steps instead of up to 15 pairs.
```

Each step rules out one value for good, so the pointers meet after at most `n - 1` steps: `O(n)` time and `O(1)` extra space.

```quiz
Q: In `[2, 4, 7, 9]` you want a sum of 13. `L` is on 2 and `R` is on 9, so the sum is 11. What do you do?
* Move L right, to 4
- Move R left, to 7
- Stop: there is no answer
Why: 11 is too small. Moving R left would only pick a smaller value and shrink the sum. Moving L right picks a bigger value: 4 + 9 = 13.
```

## Try It

Step through the search and read the pseudocode alongside. Change the target, or type your own list (it gets sorted for you). The line under the array compares the steps with a brute-force search.

```demo
```

## Other Shapes Of The Pattern

- **From both ends:** pair sums, "is this word a palindrome?" (compare the first and last letters, then move both inward), reversing an array in place, "container with most water".
- **Same direction, different speeds:** a slow pointer marks where to write and a fast pointer reads ahead. Used to remove duplicates from a sorted array in place, or to move all zeros to the end.
- **Fast and slow on a linked list:** one pointer moves two steps for every one step of the other. When the fast one reaches the end, the slow one is in the middle; if they ever meet, the list has a loop.

```quiz
Q: Why does pair-sum with two pointers need a sorted list?
- Sorting makes the list shorter
* So moving a pointer reliably makes the sum bigger or smaller
- Two pointers only works on numbers that are all different
Why: On a sorted list, moving L right can only raise the sum and moving R left can only lower it. Without order, a move tells you nothing, and you would have to check every pair again.
```

> **When to use it:** The input is sorted (or sorting it first is fine), and the question is about pairs, a range or two ends: "two values that add up to", "closest pair", "is it a palindrome", "remove duplicates in place". Also any time a brute force would compare every pair.

> **Watch out:** If the list is not sorted and you must not sort it (for example, you need the original positions), use a hash set instead: walk once and ask "have I seen target minus this value?".

## Cost Cheat Sheet

| Approach | Time | Extra space |
| --- | --- | --- |
| Brute force: every pair | `O(n²)` | `O(1)` |
| Hash set (unsorted input) | `O(n)` | `O(n)` |
| Two pointers (sorted input) | `O(n)` | `O(1)` |
| Sort first, then two pointers | `O(n log n)` | depends on the sort |

> **Interview tip:** Say the brute force out loud first ("checking every pair is `O(n²)`"), then the observation that unlocks the pattern ("because it is sorted, a too-small sum means the left value can never work"). That one sentence is what interviewers listen for.

## What To Remember

- Two positions, each move rules something out for good.
- Sorted order is what tells you which pointer to move.
- From both ends for pairs and palindromes; same direction for in-place rewriting.

## Practice Prompt

Check whether `racecar` and `rocket` are palindromes with two pointers. Write the two letters you compare at each step, and the step where `rocket` fails.

## Sources Checked

- [USACO Guide: Two Pointers](https://usaco.guide/silver/two-pointers)
