# Stacks and Queues

Stacks and queues are not new ways to store memory. They are rules about which value comes out next. Two tiny rules, and they show up everywhere: undo buttons, printers, web servers and maze solvers.

> **Analogy:** A stack is a pile of plates: you add and take from the top, so the last plate in is the first out. A queue is a line at a shop: you join at the back and leave from the front, so the first person in is the first out.

## Stack: Last In, First Out (LIFO)

Two operations: `push` adds on top, `pop` removes from the top. `peek` reads the top without removing it.

```cells
values: 3 8 12
pointers: top=2
highlight: 2
note: After push 3, push 8, push 12. The top is the newest value, 12.
```

```cells
values: 3 8
pointers: top=1
highlight: 1
note: After pop. 12 left first, even though 3 has waited longest.
```

```quiz
Q: You push A, then B, then C onto an empty stack, then pop once. What is on top now?
- A
* B
- C
Why: C was pushed last, so pop removes C. That leaves B on top.
```

## Where Stacks Show Up

- **Undo:** every action is pushed; undo pops the most recent one.
- **Function calls:** the computer pushes each call and pops it when it returns. Infinite recursion fills it up: a "stack overflow".
- **Matching brackets:** push every `(`, pop on every `)`. The brackets match if the stack ends empty.
- **Depth-first search:** go as deep as possible, then back up.

## Queue: First In, First Out (FIFO)

Two operations: `enqueue` joins at the back, `dequeue` leaves from the front.

```cells
values: 3 8 12
pointers: front=0 back=2
highlight: 0
note: After enqueue 3, enqueue 8, enqueue 12. The front is the oldest value, 3.
```

```cells
values: 8 12
pointers: front=0 back=1
highlight: 0
note: After dequeue. 3 left first, because it waited longest.
```

Push and enqueue the same values, then remove one from each. Same input, different output.

```demo
```

```quiz
Q: A printer gets three jobs in this order: report, photo, letter. Which structure prints them fairly?
- A stack, so the letter prints first
* A queue, so the report prints first
- Either one prints in the same order
Why: Fair means first come, first served. A queue releases the oldest job first; a stack would print the newest first.
```

## How They Are Built

A stack fits a dynamic array perfectly: push and pop both happen at the end, so nothing shifts.

> **Watch out:** Building a queue on a plain array and removing from index 0 shifts every value left: `O(n)` per dequeue. Real queues use a linked list or a ring buffer (an array whose front and back indexes wrap around), which keeps dequeue `O(1)`.

> **When to use it:** Use a stack when the most recent thing matters most (undo, nesting, backtracking). Use a queue when order of arrival matters (tasks, messages, breadth-first search).

## Cost Cheat Sheet

| Operation | Stack | Queue |
| --- | --- | --- |
| Add | push `O(1)` | enqueue `O(1)` |
| Remove | pop `O(1)` | dequeue `O(1)` |
| Look at the next one out | peek `O(1)` | peek `O(1)` |
| Search inside | `O(n)` | `O(n)` |

> **Interview tip:** "Valid parentheses", "next greater element" and "evaluate an expression" are stack problems. "Process in levels" and "shortest path in steps" are queue problems.

## What To Remember

- A stack answers "what happened most recently?"
- A queue answers "what has waited longest?"
- Swapping a queue for a stack is the only difference between breadth-first and depth-first search.

## Practice Prompt

Check `( [ ] ( ) )` with a stack: write the stack after each character. Then try `( ]` and find the exact character where it fails.

## Sources Checked

- [Open Data Structures: Array-Based Lists (stacks, queues and deques)](https://opendatastructures.org/ods-java/2_Array_Based_Lists.html)
- [Python collections.deque](https://docs.python.org/3/library/collections.html#collections.deque)
