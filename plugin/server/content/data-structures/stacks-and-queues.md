# Stacks and Queues

Stacks and queues are not new ways to store memory. They are rules about which value you are allowed to take out next. Those rules turn out to describe a lot of real problems.

## Stack: Last In, First Out

A stack works like a pile of plates. You add to the top and you take from the top. The newest value always leaves first.

```text
push 3, push 8, push 12

  12  ← top
  8
  3

pop → 12
```

The two operations are `push` (add on top) and `pop` (remove from the top). Most stacks also offer `peek`, which reads the top without removing it.

## Where Stacks Show Up

- **Undo:** every action is pushed; undo pops the most recent one.
- **Function calls:** the call stack remembers where to return to. A function that calls itself forever overflows it.
- **Matching brackets:** push every `(`, pop on every `)`, and the brackets match if the stack ends empty.
- **Depth-first search:** explore one path as deep as possible before backing up.

## Queue: First In, First Out

A queue works like a line at a shop. You join at the back and leave from the front. The oldest value always leaves first.

```text
enqueue 3, enqueue 8, enqueue 12

front → 3, 8, 12 ← back

dequeue → 3
```

The two operations are `enqueue` (add at the back) and `dequeue` (remove from the front).

## Where Queues Show Up

- **Task scheduling:** print jobs, web requests and messages are handled in arrival order.
- **Buffers:** keyboard input and network packets wait in a queue until the program reads them.
- **Breadth-first search:** explore everything one step away before anything two steps away.

## How They Are Built

A stack fits a dynamic array perfectly: push and pop both happen at the end, so nothing shifts.

A queue is trickier. Removing from the front of a plain array shifts every value left, which is `O(n)`. Real queues avoid that with a linked list (remove the head) or a ring buffer: an array where the front and back indexes wrap around to the start.

## Cost Summary

- Stack push, pop, peek: `O(1)`.
- Queue enqueue, dequeue: `O(1)` with a linked list or ring buffer.
- Searching inside either: `O(n)`, but if you need that often, a stack or queue is probably the wrong tool.

## What To Remember

- A stack answers "what happened most recently?"
- A queue answers "what has been waiting the longest?"
- Swapping a queue for a stack is the only difference between breadth-first and depth-first search.

## Practice Prompt

Push `1, 2, 3` onto a stack and enqueue `1, 2, 3` into a queue. Remove two values from each. What is left in each one?

## Sources Checked

- [Open Data Structures: Array-Based Lists (stacks, queues and deques)](https://opendatastructures.org/ods-java/2_Array_Based_Lists.html)
- [Python collections.deque](https://docs.python.org/3/library/collections.html#collections.deque)
