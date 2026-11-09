# Binary Search Trees

A binary search tree keeps values sorted while still letting you add and remove them cheaply. Every comparison throws away a whole branch, so a search only visits a handful of nodes.

> **Analogy:** The "higher or lower" guessing game. You guess 50; "lower"; you guess 25; "higher"; you guess 37. Each answer rules out a whole range. A binary search tree stores the guesses in advance, so finding a value follows the same path.

## The Core Idea

Each node has a value and up to two children: left and right. One rule holds at every node:

- everything in the **left** branch is **smaller**,
- everything in the **right** branch is **larger**.

```text
          50
        /    \
      30      70
     /  \    /  \
   20   40  60   80
```

Check the rule at 30: 20 is on its left (smaller), 40 on its right (larger). And the whole left branch of 50 (30, 20, 40) is smaller than 50.

## Searching, Step By Step

Find `60`:

1. Start at the root, `50`. `60` is larger, so go **right**.
2. At `70`. `60` is smaller, so go **left**.
3. At `60`. Found, after 3 comparisons out of 7 values.

```quiz
Q: In the tree above, which nodes do you visit when searching for 40?
- 50, 70, 40
* 50, 30, 40
- 20, 30, 40
Why: 40 is smaller than 50 (go left to 30), then larger than 30 (go right to 40).
```

## Inserting

Search for the new value. Where you fall off the tree is exactly where it belongs. Attach it there as a new leaf; nothing else moves.

Insert `45`: 50 (go left) → 30 (go right) → 40 (go right) → empty spot, so `45` becomes the right child of `40`.

Insert a few values and search for them. The teal path is every comparison made. Then press "Insert sorted 1-7" and compare.

```demo
```

## Height Is Everything

Every operation costs one comparison per level, so the cost is the tree's height.

- **Balanced:** with `n` values the height is about `log₂ n`. A million values fit in about 20 levels.
- **Degenerate:** insert `1, 2, 3, 4, 5` in order and every node goes right. The tree becomes a line, and search is `O(n)`, no better than a list.

```text
balanced (height 3)      degenerate (height 5)
      3                   1
    /   \                  \
   2     4                  2
  /       \                  \
 1         5                  3 ...
```

> **Watch out:** A plain binary search tree is only fast if values arrive in a mixed-up order. Self-balancing trees (AVL, red-black) rotate nodes after inserts to keep the height near `log n`. Java `TreeMap`, C++ `std::map` and Rust `BTreeMap` all use balanced trees.

```quiz
Q: You insert 10, 20, 30, 40 into an empty BST in that order. What is the height?
- 2
- 3
* 4
Why: Each value is larger than the last, so each becomes the right child of the previous one: a straight line of 4 levels.
```

## Reading In Order

Visit the left branch, then the node, then the right branch. This "in-order walk" lists every value in sorted order, for free, because of the left-smaller, right-larger rule.

> **When to use it:** You need data kept sorted while it changes: "smallest or largest so far", "all values between 10 and 20", "the next bigger value". If you only need lookups by key, a hash table is simpler and faster.

## Cost Cheat Sheet

| Operation | Balanced | Degenerate |
| --- | --- | --- |
| Search | `O(log n)` | `O(n)` |
| Insert | `O(log n)` | `O(n)` |
| Remove | `O(log n)` | `O(n)` |
| In-order walk (sorted output) | `O(n)` | `O(n)` |

> **Interview tip:** Many tree problems are short recursive functions: "solve it for the left branch, solve it for the right branch, combine the answers". Validating a BST, finding the height and in-order traversal all follow that shape.

## What To Remember

- Left is smaller, right is larger, at every node.
- Each comparison rules out a whole branch, but only when the tree is balanced.
- Insertion order decides the shape of a plain binary search tree.

## Practice Prompt

Insert `40, 20, 60, 10, 30, 50, 70` and draw the tree. Then insert the same values in sorted order and draw that one. How many comparisons does it take to find `70` in each?

## Sources Checked

- [Open Data Structures: Binary Trees](https://opendatastructures.org/ods-java/6_Binary_Trees.html)
- [Rust BTreeMap](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html)
