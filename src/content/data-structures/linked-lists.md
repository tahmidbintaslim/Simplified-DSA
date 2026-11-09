# Linked Lists

A linked list keeps values in order without keeping them next to each other in memory. Each value lives in its own small box called a node, and each node remembers where the next node is.

## The Core Idea

A node has two parts: the value, and a pointer (a reference) to the next node. The list itself only remembers the first node, called the head. The last node points to nothing, usually written `null`.

```text
head
 ↓
[7 | •]──→[3 | •]──→[9 | •]──→ null
```

To reach the third value, you start at the head and follow two pointers. There is no address formula like the one arrays use, because the nodes can be anywhere in memory.

## What It Is Good At

Adding or removing a node is just pointer surgery. To insert at the head, make a new node, point it at the old head, and call it the new head. No other value moves.

```text
insert 5 at head:

[5 | •]──→[7 | •]──→[3 | •]──→[9 | •]──→ null
```

Compare that with an array, where inserting at the front shifts every value one slot to the right.

## What It Pays For That

Because nodes are scattered, reading position `i` means walking `i` pointers from the head. That makes access and search `O(n)`.

Each node also stores a pointer on top of its value, so a linked list uses more memory than an array of the same values. Scattered nodes are also harder for the CPU cache to predict, so walking a list is often slower in practice than scanning an array, even when both are `O(n)`.

## Variations

- **Singly linked:** each node points to the next one. This is the version in the demo.
- **Doubly linked:** each node also points to the previous one, so you can walk backwards and remove a node you already hold in `O(1)`.
- **With a tail pointer:** the list remembers its last node too, so appending is `O(1)` instead of a walk.

## Cost Summary

- Insert or remove at the head: `O(1)`.
- Insert or remove after a node you already hold: `O(1)`.
- Find a value or reach position `i`: `O(n)`.
- Append without a tail pointer: `O(n)`; with one: `O(1)`.

## What To Remember

- Arrays win at reading by position. Linked lists win at changing the front.
- "Finding" and "unlinking" are separate costs. Unlinking is cheap; finding usually is not.
- Many real programs use dynamic arrays by default and reach for linked lists only when they need cheap inserts and removals at known positions.

## Practice Prompt

You keep a list of the 10 most recent songs played, adding each new song to the front and dropping the oldest from the back. Which version of linked list makes both operations `O(1)`?

## Sources Checked

- [Open Data Structures: Linked Lists](https://opendatastructures.org/ods-java/3_Linked_Lists.html)
- [Rust std::collections::LinkedList](https://doc.rust-lang.org/std/collections/struct.LinkedList.html)
