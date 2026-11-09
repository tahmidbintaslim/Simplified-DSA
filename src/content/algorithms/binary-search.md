# Binary Search

Binary search finds a value in a sorted list by repeatedly cutting the search range in half. It is the first algorithm where `O(log n)` stops being a symbol and starts feeling like magic.

## The Core Idea

Think of looking up a word in a paper dictionary. You do not start at page one. You open near the middle, see whether your word comes before or after, and throw away the half that cannot contain it.

Binary search does exactly that with three positions:

- `lo`: the first index that might still hold the target.
- `hi`: the last index that might still hold the target.
- `mid`: the index halfway between them.

## The Steps

```text
while lo <= hi:
    mid = (lo + hi) // 2
    if list[mid] == target: found it
    if list[mid] < target:  lo = mid + 1   # throw away the left half
    else:                   hi = mid - 1   # throw away the right half
not found
```

When `lo` passes `hi`, the range is empty and the target is not in the list.

## Why It Is So Fast

Each step halves the range. Starting from `n` values, after `k` steps about `n / 2ᵏ` values remain. The search ends when one value remains, so `k` is about `log₂ n`.

- 16 values: at most 5 checks.
- 1,000 values: at most 10 checks.
- 1,000,000 values: at most 20 checks.

Linear search on a million values might check all million.

## The Catch: It Needs Sorted Data

Binary search only works because the list is sorted. If you have to sort first, sorting costs `O(n log n)`, which is more than a single linear scan. Binary search pays off when you sort once and search many times, or when the data arrives already sorted.

## Common Bugs

- **Off by one:** using `lo < hi` instead of `lo <= hi` skips the last candidate.
- **Infinite loop:** writing `lo = mid` instead of `lo = mid + 1` can leave the range unchanged.
- **Overflow:** in fixed-size integer languages, `lo + hi` can overflow. `lo + (hi - lo) / 2` avoids it.

## What To Remember

- Sorted input plus "throw away half" equals `O(log n)`.
- Track `lo` and `hi` carefully; most binary search bugs live at the edges.
- The same idea powers binary search trees, database indexes, and `git bisect`.

## Practice Prompt

In the sorted list `[3, 9, 14, 21, 30, 42, 57]`, write down `lo`, `mid` and `hi` for each step of a search for `30`. Then do it for `10`, which is missing.

## Sources Checked

- [CP-Algorithms: Binary Search](https://cp-algorithms.com/num_methods/binary_search.html)
- [Python bisect](https://docs.python.org/3/library/bisect.html)
