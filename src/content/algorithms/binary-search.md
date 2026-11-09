# Binary Search

Binary search finds a value in a sorted list by looking at the middle, throwing away the half that cannot contain it, and repeating. It finds any value among a million in about 20 checks.

> **Analogy:** Looking up a word in a paper dictionary. You open near the middle, see that your word comes later, and ignore the whole first half. Then you split the rest. You never read page by page.

## The Core Idea

Keep track of the part of the list that could still hold the target, using two positions:

- `lo`: the first index still in play,
- `hi`: the last index still in play,
- `mid`: the index halfway between them, the one you check.

> **Key idea:** It only works on **sorted** data. Sorting is what tells you which half to throw away.

## Worked Example

Find `30` in `[3, 9, 14, 21, 30, 42, 57]`.

```cells
values: 3 9 14 21 30 42 57
pointers: lo=0 mid=3 hi=6
highlight: 3
note: Check 1: lo=0, hi=6, so mid=3. The value 21 is smaller than 30, so 30 must be to the right. Drop indexes 0 to 3.
```

```cells
values: 3 9 14 21 30 42 57
pointers: lo=4 mid=5 hi=6
highlight: 5
dim: 0 1 2 3
note: Check 2: lo=4, hi=6, so mid=5. The value 42 is larger than 30, so drop index 5 and everything to its right.
```

```cells
values: 3 9 14 21 30 42 57
pointers: lo=4 hi=4 mid=4
highlight: 4
dim: 0 1 2 3 5 6
note: Check 3: lo=4, hi=4, so mid=4. The value is 30. Found it in 3 checks out of 7 values.
```

```quiz
Q: Same list. You search for 10, which is not in it. After checking 21 (go left) and 9 (go right), lo=2 and hi=2. What happens next?
- Return index 1, because 9 is close to 10
* Check 14: it is larger than 10, so hi becomes 1, lo passes hi, and the answer is "not found"
- The loop runs forever
Why: With lo=2 and hi=2, mid is 2 (value 14). 14 > 10, so hi = mid - 1 = 1. Now lo (2) is greater than hi (1), so nothing is left to check.
```

Step through a search and watch the code on the left and the variables on the right change together. Try a target that is missing, or type your own list.

```demo
```

## Brute Force vs Binary Search

- **Linear search** checks values one by one: up to `n` checks.
- **Binary search** halves the range each time: about `log₂ n` checks.

| Values | Linear search (worst) | Binary search (worst) |
| --- | --- | --- |
| 16 | 16 | 5 |
| 1,000 | 1,000 | 10 |
| 1,000,000 | 1,000,000 | 20 |

```quiz
Q: About how many checks does binary search need for a sorted list of 1,000,000 values?
- 1,000
- 500,000
* 20
Why: Each check halves the range. 2 to the power 20 is just over a million, so about 20 halvings leave one value.
```

## The Code

```python
def binary_search(values, target):
    lo, hi = 0, len(values) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if values[mid] == target:
            return mid
        if values[mid] < target:
            lo = mid + 1   # throw away the left half
        else:
            hi = mid - 1   # throw away the right half
    return -1              # lo passed hi: not found
```

> **Watch out:** Most binary search bugs live at the edges. Use `lo <= hi` (not `<`) or you skip the last candidate. Use `mid + 1` and `mid - 1` (not `mid`) or the range can stop shrinking and loop forever.

> **When to use it:** The data is sorted (or can be sorted once and searched many times), or the problem asks for "the first position where something becomes true". Binary search also works on answers: "what is the smallest speed that finishes in time?"

## What To Remember

- Sorted data plus "throw away half" equals `O(log n)`.
- Track `lo` and `hi` carefully; stop when `lo` passes `hi`.
- If you must sort first, that costs `O(n log n)`, so it pays off when you search many times.

## Practice Prompt

In `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`, write `lo`, `mid` and `hi` for each step of a search for `23`. Then do it for `60`, which is missing.

## Sources Checked

- [CP-Algorithms: Binary Search](https://cp-algorithms.com/num_methods/binary_search.html)
- [Python bisect](https://docs.python.org/3/library/bisect.html)
