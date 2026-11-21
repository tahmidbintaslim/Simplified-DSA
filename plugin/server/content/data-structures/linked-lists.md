# Linked Lists

A linked list keeps values in order without keeping them side by side in memory. Each value sits in its own little box, called a node, and every node remembers where the next one is. That is the opposite of the decision an array makes, and it flips the costs: the things an array finds slow become instant, and the thing an array does instantly becomes a walk. By the end of this lesson you will be able to say which is which, and why.

> **Analogy:** A treasure hunt. Each clue tells you where the next clue is hidden. To reach clue 5 you must follow clues 1, 2, 3 and 4. But adding a new first clue is easy: write it, point it at the old first clue, done.

## The Core Idea

A node holds two things: a value, and a pointer (the location of the next node). The list itself only remembers the first node, called the head. The last node points to nothing, written `null`.

```text
 head
  ↓
┌───┬───┐   ┌───┬───┐   ┌───┬───┐
│ 7 │ ●─┼──→│ 3 │ ●─┼──→│ 9 │ ●─┼──→ null
└───┴───┘   └───┴───┘   └───┴───┘
 value next
```

Compare that with an array. An array is one block of lockers in a row; a linked list is boxes scattered around a room, joined by string. The order lives in the string, not in where the boxes happen to sit.

## Walking The List

An array finds item `i` with arithmetic, because every item is the same distance from the one before it. Scattered nodes have no such pattern, so there is nothing to calculate. The only way to learn where the third node is, is to ask the second node, and the only way to find the second is to ask the first.

So reaching any position means walking from the head, one pointer at a time. Here is a search for `4`. Step through it with Next.

```cells
values: 7 3 9 4
pointers: at=0
highlight: 0
note: Start at the head. 7 is not 4, so follow its pointer. (The small numbers only count hops. A linked list has no indexes.)
```

```cells
values: 7 3 9 4
pointers: at=1
highlight: 1
done: 0
note: Hop 1. 3 is not 4. Its pointer is the only way to know where the next node is.
```

```cells
values: 7 3 9 4
pointers: at=2
highlight: 2
done: 0 1
note: Hop 2. 9 is not 4. Keep following.
```

```cells
values: 7 3 9 4
pointers: at=3
found: 3
done: 0 1 2
note: Hop 3. Found 4 after looking at all 4 nodes. A value that is not in the list costs the same: you only know once you reach null.
```

The work grows in step with the list, so reading or searching is `O(n)`.

```quiz
Q: A linked list has 1,000 nodes. How many nodes do you visit to reach the last one?
- 1, by jumping straight there
  Why not: Linked list nodes are scattered in memory, so there is no formula for an address. Each node only knows where the next one is.
* 1,000, by walking from the head
- About 10, by halving
  Why not: Halving needs a jump to the middle, and a linked list cannot jump. It can only follow one pointer at a time.
Why: Nodes are not side by side, so there is no address formula. You must follow every pointer from the head.
```

## Where Linked Lists Win: Inserting At The Front

Now the good news. In an array, a new first value forces every other value to shift one slot right. In a linked list nothing sits "next to" anything, so nothing has to move. Adding a new head is just pointer surgery:

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

Two pointers were written, and that is all. It is `O(1)` whether the list has 3 nodes or 3 million.

> **Key idea:** A linked list changes its order by rewriting pointers, never by moving values. Any change costs `O(1)` once you are standing at the right node.

## Inserting In The Middle

The same surgery works anywhere, but there is a trap in it. To put `5` between `7` and `3`, two pointers must change: the new node must point at `3`, and `7` must point at the new node. The trap is that `7` holds the **only** record of where `3` lives.

Try both orders below. In the code, `seven` is the node holding 7 and `new` is the node holding 5. Run `seven.next = new` first and see what happens to 3 and 9.

```widget
pointer-order
```

You just saw the rule every linked list function follows: **hook the new node onto the rest of the list first, then cut over.** In the safe order, `5` grabs `3` while `7` is still holding it, so the rest of the list is never unreachable. In the other order, `7` lets go first, and a node that nothing points at cannot be found again.

```quiz
Q: A list is 10 → 20 → 30. To insert 15 after 10 you run `ten.next = new` first, and only then `new.next = ten.next`. Which nodes can a walk from the head still reach?
- 10, 15, 20, 30
  Why not: That is the result of the safe order. Here 10 stopped pointing at 20 before anything else was pointing at it.
* Only 10 and 15
- 10, 20, 30
  Why not: The first line already changed 10's pointer to the new node, so the walk can no longer step from 10 to 20.
Why: After the first line, 10 points at 15 and nothing points at 20. The second line copies 10's pointer, which is now 15 itself, so 15 points at 15 and 20 and 30 are lost.
```

## Removing A Node

To remove `3`, point the node before it (`7`) past it, straight at `9`. Nothing points at the `3` node any more, so it is out of the list. A garbage-collected language (Python, Java, JavaScript, Go) frees its memory for you, and in C you free it yourself.

```text
7 ──→ 3 ──→ 9     becomes     7 ─────────→ 9
```

> **Watch out:** Unlinking is `O(1)`, but first you have to find the node before the one you are removing, and that is a walk: `O(n)`. Beginners often quote only the cheap half. "Linked lists delete in `O(1)`" is only true when you are already holding the right node.

## Try It

Insert at the head, then at the tail, then search for a value. Teal nodes are the ones the operation had to walk past. Count them each time.

```demo
```

```quiz
Q: Which is cheaper in a singly linked list without a tail pointer?
* Inserting at the head
- Inserting at the tail
  Why not: Without a tail pointer, the list does not know where the tail is. You must walk all n nodes to find it first.
- They cost the same
  Why not: One end is already known and the other must be found. Finding it means walking the whole list.
Why: The head is already known, so inserting there is O(1). Reaching the tail means walking every node first, which is O(n).
```

## Variations

Each variation spends a little extra memory to remove one walk.

- **Singly linked:** each node points to the next one (the demo).
- **Tail pointer:** the list also remembers its last node, so appending becomes `O(1)`. Removing the last node is still `O(n)`, because the new last node is the one before it, and a singly linked list cannot step backwards.
- **Doubly linked:** each node also points to the previous one. You can walk backwards, and you can remove a node you already hold in `O(1)`, because it knows its own neighbours.

```quiz
Q: A singly linked list of 500 nodes keeps a head pointer and a tail pointer. How many nodes do you walk past to remove the last node?
- 0, because the tail pointer is already there
  Why not: The tail pointer finds the last node, but removing it means changing the node before it, and nothing points backwards to that one.
* 499
- 250
  Why not: There is no shortcut to the middle or the end. The walk starts at the head and passes every node up to the new last one.
Why: The node before the tail must become the new tail. The only way to reach it is from the head, past the 499 nodes that stay in the list.
```

> **When to use it:** You add and remove at the front a lot, or you remove nodes you already hold (an "undo" history, a cache that drops the oldest item). If you mostly read by position, an array is faster.

## Cost Cheat Sheet

| Operation | Linked list | Array | Why |
| --- | --- | --- | --- |
| Read position `i` | `O(n)` | `O(1)` | A list must walk; an array calculates the address |
| Insert or remove at the front | `O(1)` | `O(n)` | A list rewrites pointers; an array shifts every value |
| Insert or remove at a node you hold | `O(1)`, doubly linked | `O(n)` | The node knows its neighbours, so no walk is needed |
| Append at the end | `O(1)` with a tail pointer | `O(1)` usually | Without a tail pointer the list walks to the end first |
| Search for a value | `O(n)` | `O(n)` | Either way you may have to look at everything |

```deep-dive
title: Deep dive: if inserting is O(1), why do real programs mostly use arrays?
Big O counts steps, but not every step takes the same time. Two hidden costs work against linked lists.

**Memory.** Every node carries a pointer as well as its value. On a typical 64-bit machine a pointer is 8 bytes, so a list of small numbers can spend more memory on pointers than on the numbers.

**The cache.** A processor reads memory in chunks and keeps recently used chunks in a small, very fast cache. Array values sit together, so reading one usually brings its neighbours along for free. List nodes can be anywhere, so each hop may be a fresh, slow trip to main memory.

This is why Rust's own documentation says it is almost always better to use an array-based container than its `LinkedList`. Linked lists still earn their place when you hold a node and must unlink it instantly, and as a building block inside other structures: hash table chains, queues and LRU caches.
```

> **Interview tip:** Many linked list problems are solved by moving two pointers at different speeds, such as finding the middle node or detecting a loop.

## What To Remember

- A node is a value plus a pointer to the next node. The order lives in the pointers.
- There is no address formula, so reaching position `i` is a walk: `O(n)`.
- Changing the list is `O(1)` once you are at the right node. Finding that node is the expensive part.
- When inserting, hook the new node onto the rest of the list first, then cut over.

## Practice Prompt

Draw the list `2 → 4 → 6`. Insert `1` at the head and `8` at the tail (there is no tail pointer). How many pointers changed for each insert, and how many nodes did you walk past?

```answer
Insert 1 at the head: make the node, point it at 2, and make it the head. 2 pointers change and you walk past 0 nodes: `1 → 2 → 4 → 6`.

Insert 8 at the tail: walk 1, 2, 4 and 6 to find the last node (4 nodes), then point 6 at the new node. Only 1 pointer changes, but the walk makes it `O(n)`: `1 → 2 → 4 → 6 → 8`.
```

## Sources Checked

- [Open Data Structures: SLList, a singly-linked list](https://opendatastructures.org/ods-java/3_1_SLList_Singly_Linked_Li.html)
- [Open Data Structures: DLList, a doubly-linked list](https://opendatastructures.org/ods-java/3_2_DLList_Doubly_Linked_Li.html)
- [Rust std::collections::LinkedList](https://doc.rust-lang.org/std/collections/struct.LinkedList.html)
- [Shafaet's Planet: লিংকড লিস্ট (Bangla terms)](https://www.shafaetsplanet.com/?p=2689)
