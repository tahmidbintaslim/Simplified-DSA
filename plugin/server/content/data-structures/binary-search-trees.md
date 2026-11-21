# Binary Search Trees

A binary search tree keeps values sorted while still letting you add and remove them cheaply. Its whole personality comes from one rule about where a value is allowed to sit. That rule lets every comparison throw away a whole branch, so a search visits only a handful of nodes. By the end of this lesson you will be able to say why searching one is fast, why the very same tree can become as slow as a list, and what decides which of the two you get.

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

Check the rule at 30: 20 is on its left (smaller), 40 on its right (larger). Now check it at 50, and notice the word **everything**. The whole left branch of 50 (30, 20 and 40) is smaller than 50, not only its child 30.

That word matters. The rule is about whole branches, so a value has to agree with every node above it, all the way up to the root. (To keep things simple, this lesson assumes no value appears twice.)

```quiz
Q: Someone hangs 35 under 60 as its left child. 35 is smaller than 60, so that spot looks fine. Is the tree still a binary search tree?
- Yes, because 35 is smaller than its parent 60
  Why not: Checking only the parent is the classic mistake. The rule covers whole branches, so 35 also has to agree with 70 and with 50 above it.
* No, because 35 now sits in the right branch of 50, where everything must be larger than 50
- No, because 60 is a leaf and leaves cannot have children
  Why not: Any node may get a child. That is exactly how a tree grows: new values are always attached under a leaf or a node with a free side.
Why: A search for 35 starts at 50, sees that 35 is smaller and goes left. It would never look in the right branch, so the 35 hanging under 60 could never be found.
```

## Searching, Step By Step

The rule tells a search which way to go. Find `60`:

1. Start at the top node, called the root: `50`. `60` is larger, so go **right**. The entire left branch (30, 20, 40) is ruled out without looking at it.
2. At `70`. `60` is smaller, so go **left**. Now 80 is ruled out too.
3. At `60`. Found, after 3 comparisons out of 7 values.

A search only ever walks downward, one comparison per level. If it reaches an empty spot, the value is not in the tree: there is nowhere else it could legally be.

```quiz
Q: In the tree above, which nodes do you visit when searching for 40?
- 50, 70, 40
  Why not: 40 is smaller than 50, so the search goes left, not right. Every value under 70 is larger than 50.
* 50, 30, 40
- 20, 30, 40
  Why not: A search always starts at the root, 50. 20 is a leaf at the bottom, so you never start there.
Why: 40 is smaller than 50 (go left to 30), then larger than 30 (go right to 40).
```

## Inserting

Search for the new value. Where you fall off the tree is exactly where it belongs. Attach it there as a new leaf; nothing else moves.

Insert `45`: 50 (go left) → 30 (go right) → 40 (go right) → empty spot, so `45` becomes the right child of `40`.

Compare that with an array, where inserting in the middle shifts every later value. Here nothing shifts. The price is hidden somewhere else: a tree never picks where a value goes. The values that arrived earlier pick for it.

## Height Is Everything

Search and insert both cost one comparison per level, so the cost of everything is the tree's **height**: the number of levels from the root down to the deepest node. (This course counts levels, so a single node has height 1. Some books count the links between levels instead, which gives one less.)

So what decides the height? Try it. The same seven values go into an empty tree, and the only thing you control is the order they arrive in. Build the shortest tree you can, then the tallest.

```widget
arrival-order
```

You just built two very different trees from the same data. When a middle value arrives first, it splits the rest into two equal halves, and the tree stays short. When each arrival is larger (or smaller) than everything before it, every node gets one child and the tree is a list wearing a costume.

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

> **Key idea:** A binary search tree costs its height per operation, and a plain one does not control its height. The order the values arrive in does.

```quiz
Q: You insert 10, 20, 30, 40 into an empty BST in that order. What is the height?
- 2
  Why not: Two levels hold at most 3 nodes, so 4 values can never fit in a tree of height 2.
- 3
  Why not: Three levels would need some node with two children. Each value here is larger than all before it, so no node ever gets a left child.
* 4
Why: Each value is larger than the last, so each becomes the right child of the previous one: a straight line of 4 levels.
```

> **Watch out:** Already-sorted input is the worst input for a plain binary search tree, and sorted input is common in real life (ids, dates, names from a file). If you cannot trust the arrival order, use a self-balancing tree, which fixes its own shape after every insert.

## Removing

Removing has to leave the rule intact, and how hard that is depends on how many children the node has.

- **No children:** just detach it. Removing `20` leaves a free spot under `30`.
- **One child:** the child moves up into its place. Everything under that child was already on the correct side.
- **Two children:** the hard case. Take the **smallest value in its right branch**, put it where the removed value was, and remove that smallest node from its old spot instead. It is larger than everything on the left and smaller than everything else on the right, so the rule still holds.

Finding that replacement is one more walk down the tree, so removing also costs the height.

```quiz
Q: You remove the root, 50, from the first tree in this lesson. Using the rule above, which value takes its place?
- 30
  Why not: Promoting the left child feels natural, but 30 already has two children of its own (20 and 40), and it cannot also hold 70 as a child.
* 60
- 70
  Why not: 70 is the right child, not the smallest value of the right branch. If 70 moved up, 60 would sit in the right branch of 70, where everything must be larger than 70.
Why: The right branch of 50 holds 60, 70 and 80. The smallest is 60. It is larger than the whole left branch and smaller than 70 and 80, so it can sit at the root.
```

## Reading In Order

Here is something a hash table cannot do. Visit the left branch, then the node itself, then the right branch, and do the same thing inside every branch. This "in-order walk" lists the values in sorted order, without sorting anything. Step through it on the first tree.

```cells
values: 20 _ _ _ _ _ _
highlight: 0
note: Start at 50, but its left branch comes first. So does the left branch of 30. That leads to 20, which has nothing on its left: write 20.
```

```cells
values: 20 30 _ _ _ _ _
highlight: 1
done: 0
note: The left branch of 30 is finished, so now 30 itself is written.
```

```cells
values: 20 30 40 _ _ _ _
highlight: 2
done: 0 1
note: Then the right branch of 30, which is just 40. The whole left branch of 50 is now written.
```

```cells
values: 20 30 40 50 _ _ _
highlight: 3
done: 0 1 2
note: Only now is 50 written: after everything smaller than it, before everything larger.
```

```cells
values: 20 30 40 50 60 70 80
done: 0 1 2 3 4 5 6
note: The right branch of 50 goes the same way: 60, then 70, then 80. Every node was visited once, so the walk is O(n).
```

The walk comes out sorted because of the rule: at every node, everything smaller is written before it and everything larger after it.

## Try It

Now drive a real tree. Insert a few values and search for them; the teal path is every comparison made. Search for a value that is not there and watch where the search stops. Then press "Insert sorted 1-7" and compare the two shapes.

```demo
```

## When To Use A Binary Search Tree

> **When to use it:** You need data kept sorted while it changes: "smallest or largest so far", "all values between 10 and 20", "the next bigger value". If you only need lookups by key, a hash table is simpler and faster.

## Cost Cheat Sheet

| Operation | Balanced | Worst case (a line) | Why |
| --- | --- | --- | --- |
| Search | `O(log n)` | `O(n)` | One comparison per level |
| Insert | `O(log n)` | `O(n)` | A search, then attach one leaf |
| Remove | `O(log n)` | `O(n)` | A search, plus one more walk down for the replacement |
| Smallest or largest | `O(log n)` | `O(n)` | Keep going left (or right) until there is no child |
| In-order walk (sorted output) | `O(n)` | `O(n)` | Every node is visited exactly once |

```deep-dive
title: Deep dive: how real libraries keep the tree short
Values that arrive in a random order usually build a reasonable tree: on average a search takes about `1.39 × log₂ n` comparisons, only around 40% more than a perfectly balanced tree. The trouble is that nobody can promise random order.

So library trees repair themselves. A **self-balancing** tree (AVL and red-black are the famous ones) checks its shape after every insert and remove, and when one side gets too deep it performs a **rotation**: a small local re-hang of two or three nodes that keeps left-smaller, right-larger true while making the tree shorter. That guarantees a height close to `log₂ n` whatever the arrival order.

Java's `TreeMap` is a red-black tree, and C++'s `std::map` usually is too. Rust's `BTreeMap` goes a step further and uses a B-tree, where each node holds many values in a small array. Fewer, fatter nodes mean fewer jumps around memory, which matters on modern hardware.
```

> **Interview tip:** Many tree problems are short recursive functions: "solve it for the left branch, solve it for the right branch, combine the answers". Validating a BST, finding the height and in-order traversal all follow that shape.

## What To Remember

- Left is smaller, right is larger, at every node, for the whole branch and not only the children.
- Each comparison rules out a whole branch, so an operation costs the tree's height.
- Insertion order decides the shape of a plain binary search tree: sorted input makes a line.
- An in-order walk reads the values in sorted order in `O(n)`.

## Practice Prompt

Insert `40, 20, 60, 10, 30, 50, 70` and draw the tree. Then insert the same values in sorted order and draw that one. How many comparisons does it take to find `70` in each?

```answer
In the given order, 40 is the root, 20 and 60 are its children, and 10, 30, 50 and 70 are the leaves: a balanced tree of height 3. Finding 70 takes 3 comparisons: 40, then 60, then 70.

In sorted order (10, 20, 30, 40, 50, 60, 70), every value goes right of the last one, so the tree is a straight line of height 7. Finding 70 takes 7 comparisons, one per node.
```

## Sources Checked

- [Open Data Structures: BinarySearchTree, an unbalanced binary search tree](https://opendatastructures.org/ods-java/6_2_BinarySearchTree_Unbala.html)
- [Princeton Algorithms, 4th edition: Binary Search Trees](https://algs4.cs.princeton.edu/32bst/)
- [Java TreeMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html)
- [cppreference: std::map](https://en.cppreference.com/w/cpp/container/map)
- [Rust BTreeMap](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html)
