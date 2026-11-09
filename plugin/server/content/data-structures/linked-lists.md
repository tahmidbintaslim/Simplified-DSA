# Linked Lists

A linked list keeps values in order without keeping them side by side in memory. Each value sits in its own little box, called a node, and every node remembers where the next one is.

> **Analogy:** A treasure hunt. Each clue tells you where the next clue is hidden. To reach clue 5 you must follow clues 1, 2, 3 and 4. But adding a new first clue is easy: write it, point it at the old first clue, done.

## The Core Idea

A node holds two things: a value, and a pointer (the location of the next node). The list only remembers the first node, called the head. The last node points to nothing, written `null`.

```text
 head
  ↓
┌───┬───┐   ┌───┬───┐   ┌───┬───┐
│ 7 │ ●─┼──→│ 3 │ ●─┼──→│ 9 │ ●─┼──→ null
└───┴───┘   └───┴───┘   └───┴───┘
 value next
```

Compare that with an array. An array is one block of lockers in a row; a linked list is boxes scattered around a room, joined by string.

## Walking The List

There is no index formula, so reaching a position means walking from the head, one pointer at a time.

```text
find 9:   7 → 3 → 9   found after visiting 3 nodes
find 5:   7 → 3 → 9 → null   not found after visiting all 3
```

```quiz
Q: A linked list has 1,000 nodes. How many nodes do you visit to reach the last one?
- 1, by jumping straight there
* 1,000, by walking from the head
- About 10, by halving
Why: Nodes are not side by side, so there is no address formula. You must follow every pointer from the head.
```

## Where Linked Lists Win: Inserting At The Front

Adding a new head is just pointer surgery. Nothing else moves.

1. Make a new node holding `5`.
2. Point its `next` at the current head (`7`).
3. Call the new node the head.

```text
 head
  ↓
┌───┬───┐   ┌───┬───┐   ┌───┬───┐   ┌───┬───┐
│ 5 │ ●─┼──→│ 7 │ ●─┼──→│ 3 │ ●─┼──→│ 9 │ ●─┼──→ null
└───┴───┘   └───┴───┘   └───┴───┘   └───┴───┘
  new
```

That is `O(1)` whether the list has 3 nodes or 3 million. An array would have to shift every value right.

## Removing A Node

To remove `3`, point the node before it (`7`) past it, straight at `9`. The `3` node is no longer reachable, and the language frees it.

```text
7 ──→ 3 ──→ 9     becomes     7 ─────────→ 9
```

> **Watch out:** Unlinking is `O(1)`, but first you have to find the node before it, which is a walk: `O(n)`. Beginners often quote only the cheap half.

Insert at the head, then at the tail, then search. Teal nodes are the ones the operation had to walk past.

```demo
```

```quiz
Q: Which is cheaper in a singly linked list without a tail pointer?
* Inserting at the head
- Inserting at the tail
- They cost the same
Why: The head is already known, so inserting there is O(1). Reaching the tail means walking every node first, which is O(n).
```

## Variations

- **Singly linked:** each node points to the next one (the demo).
- **Doubly linked:** each node also points to the previous one, so you can walk backwards and remove a node you already hold in `O(1)`.
- **Tail pointer:** the list also remembers its last node, so appending becomes `O(1)`.

> **When to use it:** You add and remove at the front a lot, or remove nodes you already hold (an "undo" history, a cache that drops the oldest item). If you mostly read by position, an array is faster.

## Cost Cheat Sheet

| Operation | Linked list | Array |
| --- | --- | --- |
| Read position `i` | `O(n)` | `O(1)` |
| Insert or remove at the front | `O(1)` | `O(n)` |
| Append at the end | `O(1)` with a tail pointer | `O(1)` usually |
| Search for a value | `O(n)` | `O(n)` |

> **Interview tip:** Many linked list problems are solved by moving two pointers at different speeds, such as finding the middle node or detecting a loop.

## What To Remember

- A node is a value plus a pointer to the next node.
- Linked lists win at changing the front; arrays win at reading by position.
- Finding and unlinking are separate costs. Finding is the expensive one.

## Practice Prompt

Draw the list `2 → 4 → 6`. Insert `1` at the head and `8` at the tail. How many pointers changed for each insert, and how many nodes did you walk past?

## Sources Checked

- [Open Data Structures: Linked Lists](https://opendatastructures.org/ods-java/3_Linked_Lists.html)
- [Rust std::collections::LinkedList](https://doc.rust-lang.org/std/collections/struct.LinkedList.html)
