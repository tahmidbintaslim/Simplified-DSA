# Stacks and Queues

Stacks and queues are not new ways to store memory. They are rules about which value comes out next. Two tiny rules, and they show up everywhere: undo buttons, printers, web servers and maze solvers. By the end of this lesson you will be able to predict what comes out of each one, pick the right one for a problem, and explain why a queue needs one clever trick that a stack does not.

> **Analogy:** A stack is a pile of plates: you add and take from the top, so the last plate in is the first out. A queue is a line at a shop: you join at the back and leave from the front, so the first person in is the first out.

## The Core Idea

Both structures hold values in the order they arrived. Both let you add one value and remove one value, and nothing else. The only difference is **which end you remove from**.

```cells
values: 3 8 12
pointers: queue-out=0 stack-out=2
highlight: 0 2
note: 3 arrived first and 12 arrived last. A stack hands back 12, the newest. A queue hands back 3, the oldest.
```

Giving up the freedom to reach into the middle sounds like a loss. It is the point: because only the ends are ever touched, every operation can be `O(1)`, and the code that uses the structure can never take things in the wrong order.

## Stack: Last In, First Out (LIFO)

Two operations: `push` adds on top, `pop` removes from the top. `peek` reads the top without removing it. Step through three pushes and a pop.

```cells
values: 3 _ _
pointers: top=0
highlight: 0
note: push 3. The stack was empty, so 3 is both the bottom and the top.
```

```cells
values: 3 8 _
pointers: top=1
highlight: 1
note: push 8. It lands on top of 3. Nothing below it moved.
```

```cells
values: 3 8 12
pointers: top=2
highlight: 2
note: push 12. The top is always the newest value.
```

```cells
values: 3 8 _
pointers: top=1
highlight: 1
note: pop. 12 left first, even though 3 has waited longest. 8 is the top again.
```

Notice that every push and pop happened at the right-hand end. That detail will matter when we build these.

```quiz
Q: You push A, then B, then C onto an empty stack, then pop once. What is on top now?
- A
  Why not: A was pushed first, so it sits at the bottom. One pop removes only the top item.
* B
- C
  Why not: C was pushed last, so C is exactly what the pop removes. Think about what is left underneath it.
Why: C was pushed last, so pop removes C. That leaves B on top.
```

## Where Stacks Show Up

A stack fits any job where the most recent unfinished thing must be dealt with first.

- **Undo:** every action is pushed; undo pops the most recent one.
- **Function calls:** the computer pushes each call and pops it when it returns, which is how it knows where to continue. Recursion that never stops keeps pushing until the space runs out: a "stack overflow". Python stops earlier, at a depth limit, and raises `RecursionError`.
- **Matching brackets:** push every opening bracket; on every closing bracket, pop and check that the two are a pair. The text is balanced if every pop found its partner and the stack ends empty.
- **Depth-first search:** go as deep as possible, then back up to the most recent turning.

## Queue: First In, First Out (FIFO)

Two operations: `enqueue` joins at the back, `dequeue` leaves from the front. Step through three enqueues and a dequeue.

```cells
values: 3 _ _
pointers: front=0
highlight: 0
note: enqueue 3. It is the only value, so it is at the front.
```

```cells
values: 3 8 _
pointers: front=0 back=1
highlight: 0
note: enqueue 8. It joins behind 3. The front does not change.
```

```cells
values: 3 8 12
pointers: front=0 back=2
highlight: 0
note: enqueue 12. The front is still the oldest value, 3.
```

```cells
values: _ 8 12
pointers: front=1 back=2
highlight: 1
note: dequeue. 3 left first, because it waited longest. 8 is the front now, and it is not at slot 0 any more.
```

Look at that last picture again. A queue works at **both** ends: values come in on the right and leave on the left. Hold on to that empty slot on the left; it is the whole problem of the next section.

## Try It

Push and enqueue the same values, then remove one from each. Same input, different output. Before each removal, say out loud which value you expect.

```demo
```

```quiz
Q: A printer gets three jobs in this order: report, photo, letter. Which structure prints them fairly?
- A stack, so the letter prints first
  Why not: A stack hands back the newest job first. The report arrived first but would wait longest, which is not fair.
* A queue, so the report prints first
- Either one prints in the same order
  Why not: A stack reverses the order: letter, photo, then report. The two structures give back jobs in opposite orders.
Why: Fair means first come, first served. A queue releases the oldest job first; a stack would print the newest first.
```

## How They Are Built

A stack fits a growable array perfectly. Push and pop both happen at the end, and the end of an array is the one place where adding and removing never shifts anything.

A queue is harder, because it also removes from the front, and the front of an array is the expensive end.

> **Watch out:** Building a queue on a plain array and removing from index 0 shifts every remaining value one slot left: `O(n)` per dequeue. With 10,000 waiting values, one dequeue moves 9,999 of them.

The fix is to stop moving the values and move the **front** instead. Keep an index that says where the front is. To dequeue, take the value there and add 1 to the index. To enqueue, write into the slot just past the last value. When an index walks off the end of the array, it wraps round to slot 0 and reuses the slots that earlier dequeues left empty. This is a ring buffer, also called a circular queue.

```text
slot for the next value = (front + how many are waiting) % number of slots
```

Try it. Dequeue twice, then enqueue until the back goes past slot 5, and watch where the next value lands.

```widget
ring-queue
```

No value ever changed slot. Each operation wrote one slot and changed one index, which is `O(1)` however long the queue is. The `%` (remainder) is what bends the straight array into a ring: slot 5 is followed by slot 0.

> **Key idea:** A queue stays `O(1)` at both ends by moving its indexes, not its values.

```quiz
Q: A ring buffer has 6 slots, numbered 0 to 5. The front is at slot 4 and 3 values are waiting. Which slot does the next enqueue write to?
- 7
  Why not: 4 + 3 is 7, but there is no slot 7. Take the remainder after dividing by the 6 slots.
* 1
- 0
  Why not: The 3 waiting values sit in slots 4, 5 and 0, so slot 0 already holds the newest one. The next free slot is the one after it.
Why: (4 + 3) % 6 = 1. The waiting values fill slots 4, 5 and 0, so the next one goes into slot 1.
```

> **When to use it:** Use a stack when the most recent thing matters most (undo, nesting, backtracking). Use a queue when order of arrival matters (tasks, messages, breadth-first search).

## Cost Cheat Sheet

| Operation | Stack | Queue | Why |
| --- | --- | --- | --- |
| Add | push `O(1)` | enqueue `O(1)` | One slot is written at an end that is already known |
| Remove | pop `O(1)` | dequeue `O(1)` | A stack drops its last slot; a ring buffer moves its front index |
| Look at the next one out | peek `O(1)` | peek `O(1)` | It is always at a known end |
| Search inside | `O(n)` | `O(n)` | Neither structure is built for it; you would check every value |

Add is `O(1)` "usually", for the same reason as appending to any growable array: when the slots run out, everything is copied into a bigger block, which is rare enough to average out.

```deep-dive
title: Deep dive: what should I actually type for a queue?
Most languages ship one structure that is fast at both ends, called a deque (said "deck", short for double-ended queue). It can act as a stack or as a queue.

- **Python:** `collections.deque`. Its documentation says appends and pops are about `O(1)` at either end, while a plain `list` pays `O(n)` for `pop(0)` and `insert(0, v)` because the rest of the data has to move. So `list.append` and `list.pop()` make a good stack, but `list.pop(0)` makes a slow queue.
- **Java:** `ArrayDeque`, a resizable array used as a ring. Its documentation says it is likely to be faster than the old `Stack` class as a stack, and faster than `LinkedList` as a queue.
- **A linked list** with head and tail pointers also gives `O(1)` at both ends: enqueue at the tail, dequeue at the head.

The trade for a deque's fast ends is the middle: reading by position in a Python `deque` slows towards `O(n)` away from the ends.
```

> **Interview tip:** "Valid parentheses", "next greater element" and "evaluate an expression" are stack problems. "Process in levels" and "shortest path in steps" are queue problems.

## What To Remember

- A stack answers "what happened most recently?" A queue answers "what has waited longest?"
- Both only ever touch their ends, which is why add and remove are `O(1)`.
- A stack sits on the end of an array. A queue needs a ring buffer or a linked list, because removing from index 0 of a plain array is `O(n)`.
- Swapping a queue for a stack is the core difference between breadth-first and depth-first search.

## Practice Prompt

Check `( [ ] ( ) )` with a stack: write the stack after each character. Then try `( ]` and find the exact character where it fails.

```answer
For `( [ ] ( ) )`, the stack after each character is:

1. `(` → `(`
2. `[` → `( [`
3. `]` matches the top `[`, pop → `(`
4. `(` → `( (`
5. `)` matches the top `(`, pop → `(`
6. `)` matches the top `(`, pop → empty

Every closing bracket found its partner and the stack ends empty, so the brackets match.

For `( ]`, the stack holds `(` after the first character. The second character, `]`, does not match the `(` on top, so the check fails right there.
```

## Sources Checked

- [Open Data Structures: ArrayQueue, an array-based queue](https://opendatastructures.org/ods-java/2_3_ArrayQueue_Array_Based_.html)
- [Open Data Structures: SLList (stack and queue on a linked list)](https://opendatastructures.org/ods-java/3_1_SLList_Singly_Linked_Li.html)
- [Python collections.deque](https://docs.python.org/3/library/collections.html#collections.deque)
- [Python sys.setrecursionlimit](https://docs.python.org/3/library/sys.html#sys.setrecursionlimit)
- [Java ArrayDeque](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html)
- [Shafaet's Planet: কিউ এবং সার্কুলার কিউ (Bangla terms)](https://www.shafaetsplanet.com/?p=2911)
