# Sorting

Sorting puts values in order. It matters on its own (leaderboards, file lists), it unlocks faster algorithms such as binary search, and comparing a few sorting methods is the clearest way to feel the difference between `O(n²)` and `O(n log n)`.

> **Analogy:** Sorting a hand of playing cards. Most people pick up one card at a time and slide it into the right spot among the cards already held. That is insertion sort, and you already know how to do it.

## Bubble Sort: Swap Neighbours

Walk through the list comparing each pair of neighbours. If a pair is in the wrong order, swap it. After one full pass, the largest value has "bubbled" to the end.

Sort `[5, 1, 4, 2]`:

```cells
values: 5 1 4 2
highlight: 0 1
note: Pass 1: compare 5 and 1. 5 is bigger, so swap them.
```

```cells
values: 1 4 2 5
done: 3
note: After pass 1 (three compares, three swaps): 5 has bubbled to the end and is in its final place.
```

```cells
values: 1 2 4 5
done: 2 3
note: After pass 2: 4 is in place. Pass 3 makes no swaps, so the list is sorted and we stop early.
```

```quiz
Q: After one full pass of bubble sort on `[3, 1, 2]`, what is the list?
* [1, 2, 3]
- [1, 3, 2]
- [3, 1, 2]
Why: Compare 3 and 1, swap: [1, 3, 2]. Compare 3 and 2, swap: [1, 2, 3]. The largest value, 3, bubbled to the end.
```

## Selection Sort: Pick The Smallest

Find the smallest value in the unsorted part, swap it to the front of that part, and repeat. It always makes about `n²/2` comparisons, even on a sorted list, but at most `n` swaps.

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

On random data insertion sort is `O(n²)`. On nearly sorted data each value slides only a step or two, so it runs close to `O(n)`. Real sorting libraries use it for small or nearly sorted pieces for exactly this reason.

## Merge Sort: Split, Then Merge

Split the list in half, sort each half, then merge the two sorted halves by repeatedly taking the smaller front value.

```text
[38, 27, 43, 3]
[38, 27]   [43, 3]        split
[27, 38]   [3, 43]        sort each half
[3, 27, 38, 43]           merge: 3, then 27, then 38, then 43
```

Splitting gives about `log₂ n` levels, and merging each level touches all `n` values, so merge sort is `O(n log n)` every time. The price is extra memory for the merge.

```quiz
Q: Merge the sorted halves `[2, 7]` and `[3, 4]`. Which value is taken second?
- 2
* 3
- 7
Why: Compare the fronts: 2 vs 3, take 2. Then 7 vs 3, take 3. Then 7 vs 4, take 4, and finally 7.
```

Pick an algorithm and step through it. The pseudocode highlights the line running right now, and the variables panel shows its values. Try the same values with bubble sort and merge sort and compare the step counts, then press "Nearly sorted" with insertion sort.

```demo
```

## Comparing Them

| Algorithm | Typical cost | Best case | Extra memory | Stable? |
| --- | --- | --- | --- | --- |
| Bubble sort | `O(n²)` | `O(n)` when already sorted | `O(1)` | Yes |
| Selection sort | `O(n²)` | `O(n²)` | `O(1)` | No |
| Insertion sort | `O(n²)` | `O(n)` when nearly sorted | `O(1)` | Yes |
| Merge sort | `O(n log n)` | `O(n log n)` | `O(n)` | Yes |

A sort is **stable** if equal values keep their original order. That matters when you sort records by one field after sorting by another.

> **When to use it:** In real code, call your language's built-in sort; it is `O(n log n)` and heavily tuned (Python and Java use Timsort, a merge and insertion sort hybrid). Write your own only to learn, or when an interview asks for it.

> **Interview tip:** Sorting first often unlocks a simpler solution: two pointers on a sorted array, merging intervals, or grouping anagrams by their sorted letters. Say the `O(n log n)` cost out loud when you do it.

## What To Remember

- `O(n²)` sorts compare many pairs; they are fine for tiny lists and teach the ideas.
- Insertion sort is fast on nearly sorted data.
- Merge sort guarantees `O(n log n)` by splitting and merging.

## Practice Prompt

Sort `[6, 3, 8, 1]` by hand with insertion sort. Write the list after each value is placed. How many single moves did it take in total?

## Sources Checked

- [Open Data Structures: Sorting Algorithms](https://opendatastructures.org/ods-java/11_Sorting_Algorithms.html)
- [Python Sorting HOW TO](https://docs.python.org/3/howto/sorting.html)
- [C++ std::sort](https://en.cppreference.com/w/cpp/algorithm/sort)
- [Rust slice::sort](https://doc.rust-lang.org/std/primitive.slice.html#method.sort)
