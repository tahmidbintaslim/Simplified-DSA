# Fast and Slow Pointers

Fast and slow pointers walk the same linked list at two speeds: slow moves one node per step, fast moves two. If the list loops back on itself, fast laps slow and they land on the same node. If it does not, fast falls off the end, and slow is standing in the middle. Both answers take `O(n)` time and only two pointers of memory.

> **Analogy:** Two runners on a track. If the track is a loop, the faster runner always catches up and passes the slower one. If the track is a straight road with an end, the fast runner just reaches the finish, and the slow one is halfway there.

## The Problem

Each node in a linked list points to the next one. Usually the last node points to nothing. But if a bug makes it point back to an earlier node, walking "to the end" never ends.

```cells
values: A B C D E F
pointers: head=0
note: Six nodes. Here F (index 5) points back to D (index 3), so A → B → C → D → E → F → D → E → F … forever.
```

The question: **does this list have a loop?**

## Brute Force First

Walk the list and remember every node you have seen in a set. If you reach a node that is already in the set, there is a loop. If you reach the end, there is not. That is `O(n)` time, but it also needs `O(n)` extra memory for the set.

> **Key idea:** On a loop, fast gains exactly one node on slow every step (it moves 2, slow moves 1). A gap that shrinks by one each step must reach zero, so they always meet, and they never jump past each other.

## Worked Example

Same six nodes, F pointing back to D. Both pointers start at A.

```cells
values: A B C D E F
pointers: slow=0 fast=0
highlight: 0
note: Start: slow and fast are both on A (index 0).
```

```cells
values: A B C D E F
pointers: slow=1 fast=2
highlight: 1 2
note: Step 1: slow moves to B, fast jumps two to C.
```

```cells
values: A B C D E F
pointers: slow=2 fast=4
highlight: 2 4
note: Step 2: slow moves to C, fast jumps to E.
```

```cells
values: A B C D E F
pointers: slow=3 fast=3
done: 3
note: Step 3: slow moves to D. Fast goes E → F → back to D. They meet on D, so the list has a loop.
```

Three steps, and nothing was stored except the two pointers.

```quiz
Q: A plain list of 7 nodes (no loop). Slow and fast start at node 0. Where is slow when fast can no longer move two steps?
- Node 2
* Node 3, the middle
- Node 6, the end
Why: Fast moves 0 → 2 → 4 → 6 while slow moves 0 → 1 → 2 → 3. Fast is on the last node and cannot take two more steps, so the loop stops with slow on node 3, the middle of 7 nodes.
```

## Try It

Choose how many nodes the list has and where the last node points. Pick "nothing" for a plain list and watch slow stop in the middle. The line under the picture compares the memory with the "visited set" approach.

```demo
```

## Other Shapes Of The Pattern

- **Middle of a list:** run fast to the end; slow is in the middle. Used to split a list in half for merge sort, or to check a palindrome list.
- **Where the loop starts:** after they meet, move one pointer back to the head and step both one node at a time. They meet again at the first node of the loop.
- **Numbers that repeat:** "is this number happy?" or "find the duplicate" problems treat each value as a pointer to the next one, and use the same chase.

```quiz
Q: Why can't fast jump over slow on a loop and miss it?
- Because fast moves only one node at a time
* Because the gap between them shrinks by exactly one node each step
- Because slow waits for fast
Why: Fast moves 2 and slow moves 1, so the distance from fast to slow (going forward around the loop) drops by 1 every step. It goes 3, 2, 1, 0 and cannot skip 0.
```

> **When to use it:** A linked list or a "next" function, and the question is about a loop, the middle, or the k-th node from the end, especially when the problem asks for `O(1)` extra memory.

> **Watch out:** Check `fast` and `fast.next` before jumping two steps. On a plain list, `fast.next.next` on the last node is the classic crash.

## Cost Cheat Sheet

| Approach | Time | Extra space |
| --- | --- | --- |
| Visited set | `O(n)` | `O(n)` |
| Fast and slow pointers | `O(n)` | `O(1)` |
| Count the length, then walk to the middle | `O(n)` | `O(1)`, but two passes |

> **Interview tip:** Name the brute force ("a set of visited nodes, `O(n)` memory"), then the upgrade ("two pointers at different speeds: if there is a loop the gap shrinks by one each step, so they must meet"). That reasoning is what turns a memorised trick into an answer you can defend.

## What To Remember

- Slow moves 1, fast moves 2.
- They meet: there is a loop. Fast hits the end: no loop, and slow is in the middle.
- `O(n)` time, `O(1)` space; always check `fast` and `fast.next` first.

## Practice Prompt

A list has 5 nodes, 0 to 4, and node 4 points back to node 1. Write where slow and fast are after each step, and the step where they meet.

```answer
Start: slow 0, fast 0.

Step 1: slow 1, fast 2.

Step 2: slow 2, fast 4.

Step 3: slow 3. Fast goes 4 → 1 → 2, so fast is on 2.

Step 4: slow 4. Fast goes 2 → 3 → 4, so fast is on 4. They meet on node 4 after 4 steps.
```

## Sources Checked

- [Wikipedia: Cycle detection, Floyd's tortoise and hare](https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare)
- [LeetCode 141: Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
