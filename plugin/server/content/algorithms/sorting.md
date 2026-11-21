# Sorting

Sorting puts values in order. It matters on its own (leaderboards, file lists), and it unlocks faster algorithms such as binary search. There are many ways to sort, and they do not cost the same: some need about `n²` steps, others about `n log n`. By the end of this lesson you will be able to sort a small list by hand in four ways, and say exactly why three of them slow down so badly on long lists while the fourth does not.

> **Analogy:** Sorting a hand of playing cards. Most people pick up one card at a time and slide it into the right spot among the cards already held. That is insertion sort, and you already know how to do it.

## The Core Idea

A list is sorted when no pair of values is in the wrong order. So sorting is really the job of fixing every wrong pair.

```cells
values: 5 1 4 2
highlight: 0
note: 5 sits before 1, before 4 and before 2: three wrong pairs. 4 sits before 2: one more. This list has 4 wrong pairs.
```

A computer cannot see the whole list at a glance the way you just did. It can only do two small things: **compare** two values, and **move** a value. Every sorting method is a plan for which two values to compare next. A good plan needs few comparisons. A poor plan needs many.

```quiz
Q: How many pairs are in the wrong order in `[3, 1, 2]`?
- 1
  Why not: 3 is before 1, but that is not the only problem. 3 is also before 2, and 3 is bigger than 2.
* 2
- 3
  Why not: That counts every pair. The pair 1 and 2 is already in the right order, so only the two pairs with 3 are wrong.
Why: 3 comes before 1 and before 2, and it is bigger than both. 1 and 2 are fine. Two wrong pairs.
```

## Bubble Sort: Swap Neighbours

Walk through the list comparing each pair of neighbours. If a pair is in the wrong order, swap it. After one full pass, the largest value has "bubbled" to the end.

Sort `[5, 1, 4, 2]`. Step through it with Next.

```cells
values: 5 1 4 2
highlight: 0 1
note: Pass 1: compare 5 and 1. 5 is bigger, so swap them.
```

```cells
values: 1 5 4 2
highlight: 1 2
note: Compare 5 and 4. Wrong order again, so swap.
```

```cells
values: 1 4 5 2
highlight: 2 3
note: Compare 5 and 2. Swap once more.
```

```cells
values: 1 4 2 5
done: 3
note: After pass 1 (three compares, three swaps): 5 has bubbled to the end and is in its final place.
```

```cells
values: 1 4 2 5
highlight: 1 2
done: 3
note: Pass 2: 1 and 4 are fine. 4 and 2 are not, so swap them.
```

```cells
values: 1 2 4 5
done: 2 3
note: After pass 2: 4 is in place. Pass 3 makes no swaps, so the list is sorted and we stop early.
```

Count the swaps: four. That is the number of wrong pairs we counted at the start, and it is no accident. Swapping two neighbours fixes exactly one wrong pair, never more.

```quiz
Q: After one full pass of bubble sort on `[3, 1, 2]`, what is the list?
* [1, 2, 3]
- [1, 3, 2]
  Why not: That is the list after only the first comparison. A full pass keeps going and also compares 3 with 2.
- [3, 1, 2]
  Why not: That is the starting list, unchanged. 3 is bigger than 1, so the very first comparison already swaps them.
Why: Compare 3 and 1, swap: [1, 3, 2]. Compare 3 and 2, swap: [1, 2, 3]. The largest value, 3, bubbled to the end.
```

## Selection Sort: Pick The Smallest

Find the smallest value in the unsorted part, swap it to the front of that part, and repeat.

```cells
values: 5 1 4 2
highlight: 1
note: Scan all four values. The smallest is 1. Swap it with the first value, 5.
```

```cells
values: 1 5 4 2
highlight: 3
done: 0
note: 1 is in place. Scan the other three: the smallest is 2. Swap it with 5.
```

```cells
values: 1 2 4 5
done: 0 1 2 3
note: Scan the last two: 4 is already the smaller one. Sorted with only 2 swaps, but 3 + 2 + 1 = 6 comparisons.
```

Selection sort moves very little: at most one swap per position. But to be sure which value is the smallest, it has to look at every unsorted value, every time. It makes about `n²/2` comparisons even on a list that is already sorted.

## Insertion Sort: Like A Hand Of Cards

Keep the left part sorted. Take the next value and slide it left until it fits.

```cells
values: 1 4 5 2
pointers: next=3
highlight: 3
done: 0 1 2
note: The first three values are sorted. Pick up 2 and slide it left past 5 and 4.
```

```cells
values: 1 2 4 5
done: 0 1 2 3
note: 2 stops after 1, because 1 is smaller. All four are sorted.
```

A value only slides past the bigger values in front of it, and it stops the moment it meets a smaller one. On random data that is still `O(n²)`. On nearly sorted data each value slides only a step or two, so the whole sort runs close to `O(n)`. Real sorting libraries use insertion sort for small or nearly sorted pieces for exactly this reason.

```quiz
Q: Insertion sort runs on `[1, 2, 4, 3, 5]`. How many times does a value slide one slot left?
* 1
- 4
  Why not: That would be one slide for every value after the first. A value that is already bigger than its left neighbour does not slide at all.
- 10
  Why not: 10 is the number of pairs in five values. Insertion sort only slides past wrong pairs, and this list has just one: 4 before 3.
Why: 2, 4 and 5 are already bigger than the value on their left, so they stay. Only 3 slides, one slot, past 4.
```

## Why The Simple Sorts Are Slow

All three methods so far fix the list one neighbour at a time. A list can hold a lot of wrong pairs: in the worst case, every pair. With `n` values there are `n × (n − 1) / 2` pairs.

| Values | Pairs |
| --- | --- |
| 10 | 45 |
| 1,000 | 499,500 |
| 1,000,000 | about 500 billion |

That is what `O(n²)` feels like: ten times more values, about a hundred times more work.

> **Key idea:** A sort that settles one pair per step can need about `n²/2` steps. To do better, one comparison has to settle many pairs at once.

## Merge Sort: Split, Then Merge

Split the list in half, sort each half, then merge the two sorted halves by repeatedly taking the smaller front value.

```text
[38, 27, 43, 3]
[38, 27]   [43, 3]        split
[27, 38]   [3, 43]        sort each half
[3, 27, 38, 43]           merge: 3, then 27, then 38, then 43
```

The merge is where the saving comes from. Try it: both halves below are already sorted, and you build the merged row. Click the wrong front once on purpose, and watch the comparison counter.

```widget
merge-fronts
```

You never had to look behind a front card. If a half is sorted, its front is its smallest value, so the smallest value of all must be one of the two fronts. One comparison tells you which, and that one comparison settles the winner against every card in both halves. That is the "many pairs at once" the simple sorts were missing. Merging `n` values takes at most `n − 1` comparisons.

How do the halves get sorted in the first place? The same way: split each half again, down to single values, which are sorted already. Halving `n` values down to 1 takes about `log₂ n` rounds, and merging one whole round back together touches all `n` values. So merge sort costs about `n × log₂ n`, written `O(n log n)`, on every input. For a million values that is about 20 million steps instead of 500 billion. The price is extra memory: the merge needs a second row to build into.

```quiz
Q: Merge the sorted halves `[2, 7]` and `[3, 4]`. Which value is taken second?
- 2
  Why not: 2 is taken first, because 2 is smaller than 3. The question asks what comes next, once 2 is gone.
* 3
- 7
  Why not: 7 is the largest of the four values, so it waits until the end. Both 3 and 4 are smaller.
Why: Compare the fronts: 2 vs 3, take 2. Then 7 vs 3, take 3. Then 7 vs 4, take 4, and finally 7.
```

## Try It

Pick an algorithm and step through it. The pseudocode highlights the line running right now, and the variables panel shows its values. Try the same values with bubble sort and merge sort and compare the step counts, then press "Nearly sorted" with insertion sort.

```demo
```

## Comparing Them

Speed is not the only difference. Suppose two values count as equal, like two orders for the same table. A sort is **stable** if equal values keep the order they came in.

```cells
values: 2a 2b 1
highlight: 0 2
note: Two 2s, labelled a and b so we can tell them apart. Selection sort finds the smallest value, 1, and swaps it with the first value, 2a.
```

```cells
values: 1 2b 2a
done: 0 1 2
note: Sorted, but 2b is now before 2a. That long swap jumped 2a over its twin. Selection sort is not stable.
```

Bubble, insertion and merge sort never jump a value over an equal one, so they are stable. This matters when you sort records twice: sort by name, then by city with a stable sort, and people in the same city are still in name order.

> **Watch out:** In JavaScript, `[10, 9, 1].sort()` gives `[1, 10, 9]`. With no compare function, it sorts values as text, and "10" comes before "9". Pass one for numbers: `sort((a, b) => a - b)`.

> **When to use it:** In real code, call your language's built-in sort; it is `O(n log n)` and heavily tuned. Write your own only to learn, or when an interview asks for it.

## Cost Cheat Sheet

| Algorithm | Usual cost | Best case | Extra memory | Stable? | Why |
| --- | --- | --- | --- | --- | --- |
| Bubble sort | `O(n²)` | `O(n)` when already sorted | `O(1)` | Yes | Each swap fixes one wrong pair |
| Selection sort | `O(n²)` | `O(n²)` | `O(1)` | No | It scans the whole unsorted part every time |
| Insertion sort | `O(n²)` | `O(n)` when nearly sorted | `O(1)` | Yes | A value slides only past bigger values |
| Merge sort | `O(n log n)` | `O(n log n)` | `O(n)` | Yes | About `log₂ n` rounds, `n` work in each |

```deep-dive
title: Deep dive: what does the built-in sort actually run?
Usually a mix of the ideas in this lesson. Python's sort is **Timsort**: it looks for stretches that are already in order, tidies short ones with insertion sort, then merges them, so nearly sorted data costs far less than `n log n`. It is stable. Java uses Timsort for arrays of objects and a quicksort variant for plain numbers, where stability cannot be seen. JavaScript leaves the method to the engine, but has required a stable sort since 2019. C++ `std::sort` and Rust's `sort_unstable` do not promise stability; `std::stable_sort` and Rust's `sort` do.
```

> **Interview tip:** Sorting first often unlocks a simpler solution: two pointers on a sorted array, merging intervals, or grouping anagrams by their sorted letters. Say the `O(n log n)` cost out loud when you do it.

## What To Remember

- Sorting means fixing every wrong pair. Bubble, selection and insertion sort settle one pair per step, so they are `O(n²)`.
- Insertion sort is fast on nearly sorted data, because values barely slide.
- Merging two sorted halves needs only their fronts, so merge sort is `O(n log n)` every time, for `O(n)` extra memory.
- A stable sort keeps equal values in their original order.

## Practice Prompt

Sort `[6, 3, 8, 1]` by hand with insertion sort. Write the list after each value is placed. How many single moves did it take in total?

```answer
1. Start: `[6, 3, 8, 1]`; the first value, 6, is already a sorted hand.
2. Place 3: it moves left past 6, giving `[3, 6, 8, 1]` (1 move).
3. Place 8: it is larger than 6, so it stays: `[3, 6, 8, 1]` (0 moves).
4. Place 1: it moves left past 8, 6 and 3, giving `[1, 3, 6, 8]` (3 moves).

That is 4 single moves in total, one for each wrong pair in the starting list: 6 before 3, and 6, 3 and 8 before 1.
```

## Sources Checked

- [Princeton Algorithms: Elementary Sorts](https://algs4.cs.princeton.edu/21elementary/)
- [Princeton Algorithms: Mergesort](https://algs4.cs.princeton.edu/22mergesort/)
- [Python Sorting Techniques](https://docs.python.org/3/howto/sorting.html)
- [Java: Arrays.sort](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html)
- [MDN: Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [C++ std::sort](https://en.cppreference.com/w/cpp/algorithm/sort)
- [Rust slice::sort](https://doc.rust-lang.org/std/primitive.slice.html#method.sort)
