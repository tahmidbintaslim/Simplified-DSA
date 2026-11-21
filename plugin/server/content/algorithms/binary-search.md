# Binary Search

Binary search finds a value in a sorted list by looking at the middle, throwing away the half that cannot contain it, and repeating. It finds any value among a million in about 20 checks. By the end of this lesson you will be able to say why it needs so few, why it only works on sorted data, and which two small mistakes break it. Before any of that, though, let's play a game.

```widget
guess-game
cards: 16
```

How did you do? Most people start somewhere sensible, then drift to the edges. The cards were **sorted**, so every card you turned over told you more than just "not this one": it told you which side the answer was on. The best strategy, every single time, is to turn over the card in the **middle** of whatever is left. Press "Watch binary search play" to see it.

> **Analogy:** Looking up a word in a paper dictionary. You open near the middle, see that your word comes later, and ignore the whole first half. Then you split the rest. You never read page by page.

## The Core Idea

That game is binary search. To write it as code, we keep track of the part of the list that could still hold the target, using two positions:

- `lo`: the first index still in play,
- `hi`: the last index still in play,
- `mid`: the index halfway between them, the one you check.

> **Key idea:** It only works on **sorted** data. Sorting is what tells you which half to throw away. On a shuffled list, turning over a card tells you nothing about its neighbours.

## Worked Example

Find `30` in `[3, 9, 14, 21, 30, 42, 57]`. Step through it with Next, or drag the slider.

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
found: 4
dim: 0 1 2 3 5 6
note: Check 3: lo=4, hi=4, so mid=4. The value is 30. Found it in 3 checks out of 7 values.
```

```quiz
Q: Same list. You search for 10, which is not in it. After checking 21 (go left) and 9 (go right), lo=2 and hi=2. What happens next?
- Return index 1, because 9 is close to 10
  Why not: Binary search only reports an exact match. 9 is not 10, and index 1 was already ruled out when lo moved to 2.
* Check 14: it is larger than 10, so hi becomes 1, lo passes hi, and the answer is "not found"
- The loop runs forever
  Why not: Every check shrinks the range by at least one index. Once lo passes hi, the loop has nothing left and stops.
Why: With lo=2 and hi=2, mid is 2 (value 14). 14 > 10, so hi = mid - 1 = 1. Now lo (2) is greater than hi (1), so nothing is left to check.
```

## Why It Is So Fast

Here is the part that feels like a magic trick. Every check throws away **half** of what is left. Halving is brutal: drag the slider up to a million and count how few rows it takes to get down to one value.

```widget
halving
```

That is what `O(log n)` means: the number of steps grows with the number of times you can halve `n`, not with `n` itself. Double the list, and binary search needs just **one** more check.

| Values | Linear search (worst) | Binary search (worst) |
| --- | --- | --- |
| 16 | 16 | 5 |
| 1,000 | 1,000 | 10 |
| 1,000,000 | 1,000,000 | 20 |

```quiz
Q: About how many checks does binary search need for a sorted list of 1,000,000 values?
- 1,000
  Why not: That is far too many. Each check halves the range, and halving a million just 10 times already leaves fewer than 1,000 values.
- 500,000
  Why not: That is half the list, about what a plain scan needs. Binary search throws away half of what is left with every check.
* 20
Why: Each check halves the range. 2 to the power 20 is just over a million, so about 20 halvings leave one value.
```

## Try It

Now drive the real thing. Step through a search and watch the code and the variables change together. Switch on "Predict first" to guess each `mid` before it is revealed, try a target that is missing, or type your own list.

```demo
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

Eleven lines, and two of them are famous for breaking. Binary search is easy to describe and surprisingly easy to get wrong: the bugs hide in the tiny details at the edges. So let's break it on purpose. Flip a switch, pick a target, and watch what happens.

```widget
bug-lab
```

Search for `30` with the first switch on: the loop stops while `30` is the only value left, before ever looking at it. Then turn that switch off, turn the second one on, and search for `10`: `hi` lands on a value that is too big and never moves again. Both bugs pass most tests, which is exactly why they survive into interviews.

> **Watch out:** Use `lo <= hi` (not `<`), or you skip the last candidate. Use `mid + 1` and `mid - 1` (not `mid`), or the range can stop shrinking and loop forever.

## When A Value Appears Twice

The code returns as soon as it lands on a match. If the value appears more than once, that is the first match it happens to hit, which is not always the first one in the list.

```quiz
Q: You run the code above on `[2, 4, 4, 4, 9]` and search for 4. Which index does it return?
- 1, the first 4 in the list
  Why not: The code never looks for the leftmost match. It returns the moment values[mid] equals the target, and the first mid is not index 1.
* 2
- 3, the last 4 in the list
  Why not: The search does not scan to the right either. The very first check already lands on a 4 and returns.
Why: lo=0 and hi=4 give mid=2. values[2] is 4, so the function returns 2 straight away, without ever seeing the 4s on either side.
```

That is fine when you only ask "is it here?". When you need the **first** position, do not stop on a match: remember it, set `hi = mid - 1`, and keep searching the left part. Library functions say which behaviour they give. Python's `bisect_left` returns the position before any equal values, while Java's `Arrays.binarySearch` promises nothing about which equal value it finds.

```deep-dive
title: Deep dive: why some code writes `lo + (hi - lo) // 2`
In Python, integers grow as big as they need to, so `(lo + hi) // 2` is always fine. In languages with fixed-size integers (Java, C, C++), `lo + hi` can be larger than the biggest number an `int` can hold when the list has more than about a billion items. The sum wraps around to a negative number, and `mid` points at nonsense.

`lo + (hi - lo) // 2` gives the same middle without ever adding two big numbers together. This exact bug sat in Java's own library binary search for nearly a decade before anyone noticed.
```

> **When to use it:** The data is sorted (or can be sorted once and searched many times), or the problem asks for "the first position where something becomes true". Binary search also works on answers: "what is the smallest speed that finishes in time?"

## Cost Cheat Sheet

| Operation | Cost | Why |
| --- | --- | --- |
| Binary search, time | `O(log n)` | Each check halves what is left |
| Binary search, extra memory | `O(1)` | It only stores `lo`, `hi` and `mid` |
| Linear search | `O(n)` | It may have to check every value |
| Sorting first | `O(n log n)` | Paid once, before the first search |
| Inserting into a sorted array | `O(n)` | Finding the spot is `O(log n)`, but later values still shift |

## What To Remember

- Sorted data plus "throw away half" equals `O(log n)`.
- Track `lo` and `hi` carefully; stop when `lo` passes `hi`.
- If you must sort first, that costs `O(n log n)`, so it pays off when you search many times.
- With repeated values, a plain binary search returns some match, not necessarily the first.

## Practice Prompt

In `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`, write `lo`, `mid` and `hi` for each step of a search for `23`. Then do it for `60`, which is missing.

```answer
Indexes run from 0 to 9.

Search for `23`:

1. `lo=0`, `hi=9`, `mid=4`: 16 is smaller than 23, so `lo=5`.
2. `lo=5`, `hi=9`, `mid=7`: 56 is larger than 23, so `hi=6`.
3. `lo=5`, `hi=6`, `mid=5`: 23. Found at index 5 in 3 checks.

Search for `60`:

1. `lo=0`, `hi=9`, `mid=4`: 16 is smaller, so `lo=5`.
2. `lo=5`, `hi=9`, `mid=7`: 56 is smaller, so `lo=8`.
3. `lo=8`, `hi=9`, `mid=8`: 72 is larger, so `hi=7`.
4. Now `lo` (8) is greater than `hi` (7): not found, after 3 checks.
```

## Sources Checked

- [CP-Algorithms: Binary Search](https://cp-algorithms.com/num_methods/binary_search.html)
- [Python bisect](https://docs.python.org/3/library/bisect.html)
- [Java Arrays.binarySearch](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html)
- [Google Research: Nearly All Binary Searches and Mergesorts are Broken (2006)](https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/)
