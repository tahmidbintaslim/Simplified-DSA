# Sorting

Sorting puts values in order. It matters on its own, and it unlocks faster algorithms like binary search. Comparing a few sorting algorithms is also the best way to feel the difference between `O(n²)` and `O(n log n)`.

## Bubble Sort

Walk through the list comparing neighbours. Whenever a pair is out of order, swap it. After one full pass the largest value has "bubbled" to the end. Repeat on the rest.

It is simple and slow: about `n²/2` comparisons. It stops early if a pass makes no swaps, so an already sorted list takes one pass.

## Selection Sort

Find the smallest value in the unsorted part, swap it to the front, and grow the sorted part by one. Repeat.

It always makes about `n²/2` comparisons, even on sorted input, but it makes at most `n` swaps. That can matter when writing is much more expensive than reading.

## Insertion Sort

Keep the left part sorted, like a hand of cards. Take the next value and slide it left until it sits in the right place.

On random data it is `O(n²)`. On nearly sorted data each value slides only a step or two, so it runs close to `O(n)`. That is why real sorting libraries switch to insertion sort for small or nearly sorted pieces.

## Merge Sort

Split the list in half, sort each half, then merge the two sorted halves by repeatedly taking the smaller front value.

```text
[38, 27, 43, 3]
[38, 27]   [43, 3]
[27, 38]   [3, 43]
[3, 27, 38, 43]
```

Splitting gives about `log₂ n` levels, and merging each level touches all `n` values, so merge sort is `O(n log n)` every time. The cost is an extra `O(n)` of memory for the merge.

## Stability

A sort is stable if equal values keep their original order. That matters when you sort records by one field after sorting by another. Bubble, insertion and merge sort are stable; selection sort, as usually written, is not.

## What Languages Actually Use

You will rarely write a sort by hand. Python and Java (for objects) use Timsort, a merge sort and insertion sort hybrid. C++ `std::sort` uses introsort, a quicksort hybrid. Rust offers both a stable and an unstable sort. They all run in `O(n log n)`.

## What To Remember

- `O(n²)` sorts are fine for tiny lists and teach the ideas.
- Insertion sort is the fast choice for nearly sorted data.
- Merge sort guarantees `O(n log n)` by splitting and merging.
- In real code, call the language's built-in sort.

## Practice Prompt

In the demo, run bubble sort and merge sort on 20 shuffled values and note the step counts. Then press "Nearly sorted" and run insertion sort. What changed?

## Sources Checked

- [Open Data Structures: Sorting Algorithms](https://opendatastructures.org/ods-java/11_Sorting_Algorithms.html)
- [Python Sorting HOW TO](https://docs.python.org/3/howto/sorting.html)
- [C++ std::sort](https://en.cppreference.com/w/cpp/algorithm/sort)
- [Rust slice::sort](https://doc.rust-lang.org/std/primitive.slice.html#method.sort)
