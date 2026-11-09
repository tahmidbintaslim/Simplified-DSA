# Binary Search Trees

A binary search tree keeps values sorted while still letting you insert and remove them cheaply. It takes the "halve the search space" idea from binary search and builds it into the shape of the data.

## The Core Idea

Each node has a value and up to two children, left and right. One rule holds everywhere:

- Every value in the left subtree is smaller than the node.
- Every value in the right subtree is larger than the node.

```text
        50
       /  \
     30    70
    /  \  /  \
   20  40 60  80
```

## Searching

Start at the root. If the target is smaller, go left; if larger, go right. Each comparison throws away a whole subtree.

To find `60`: compare with `50` (go right), compare with `70` (go left), found. Three comparisons for seven values.

## Inserting

Search for the value. When you fall off the tree, that empty spot is exactly where the value belongs. Attach it there as a new leaf. Nothing else moves.

## Reading In Order

Visit the left subtree, then the node, then the right subtree. This in-order walk prints every value in sorted order, for free, because of the left-smaller, right-larger rule.

## Height Is Everything

Search, insert and remove all cost one comparison per level, so their cost is the height of the tree.

- A **balanced** tree with `n` nodes has a height around `log₂ n`. A million values fit in about 20 levels.
- A **degenerate** tree has a height of `n`. Insert `1, 2, 3, 4, 5` in that order and every node becomes a right child. The tree is now a linked list with extra steps.

Self-balancing trees (AVL trees, red-black trees) add rotations after inserts and removals to keep the height near `log n`. Java `TreeMap`, C++ `std::map` and Rust `BTreeMap` all use balanced trees for this reason.

## Cost Summary

- Search, insert, remove: `O(h)`, where `h` is the height.
- Balanced: `O(log n)`. Degenerate: `O(n)`.
- In-order traversal: `O(n)`, and the output is sorted.

## What To Remember

- The ordering rule makes every comparison rule out half of what is left, but only when the tree is balanced.
- Insertion order decides the shape of a plain binary search tree.
- Pick a tree over a hash table when you need sorted order, ranges ("all keys between 10 and 20") or the smallest and largest keys.

## Practice Prompt

Insert `40, 20, 60, 10, 30, 50, 70` into an empty tree. Draw it. Now insert the same values in sorted order. How many comparisons does it take to find `70` in each tree?

## Sources Checked

- [Open Data Structures: Binary Trees](https://opendatastructures.org/ods-java/6_Binary_Trees.html)
- [Rust BTreeMap](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html)
