# Fast and Slow Pointers

Fast and slow pointers walk the same linked list at two speeds: slow moves one node per step, fast moves two. If the list loops back on itself, fast catches slow from behind and they land on the same node. If it does not, fast runs off the end while slow is standing in the middle. By the end of this lesson you will be able to explain why they are certain to meet on a loop, and why all of this needs only two pointers of memory.

> **Analogy:** Two runners on a track. If the track is a loop, the faster runner always comes up behind the slower one again. If the track is a straight road with an end, the fast runner just reaches the finish, and the slow one is halfway there.

## The Problem

Each node in a linked list points to the next one. Usually the last node points to nothing. But if a bug makes it point back to an earlier node, walking "to the end" never ends.

```cells
values: A B C D E F
pointers: head=0
note: Six nodes. Here F (index 5) points back to D (index 3), so A → B → C → D → E → F → D → E → F … forever.
```

The question: **does this list have a loop?** You cannot answer it by walking until you reach the end, because if there is a loop you will never get there.

## Brute Force First

Walk the list and write down every node you have seen, in a set. If you reach a node that is already in the set, there is a loop. If you reach the end, there is not.

That takes `O(n)` time, which is fine. The cost is the notebook: the set grows to hold every node, so it needs `O(n)` extra memory. For a list of a million nodes you store a million entries just to answer yes or no.

> **Key idea:** Send two pointers instead of keeping a notebook. On a loop, fast gains exactly one node on slow every step (it moves 2, slow moves 1). A gap that shrinks by one each step must reach zero, so they always meet.

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
found: 3
note: Step 3: slow moves to D. Fast goes E → F → back to D. They meet on D, so the list has a loop.
```

Three steps, and nothing was stored except the two pointers.

## Why They Must Meet

It is fair to be suspicious here. Fast jumps two nodes at a time, so could it not hop right over slow and keep missing it, lap after lap?

Look at the loop from fast's point of view. Slow is some number of nodes ahead of it: call that the **gap**. Put fast anywhere on the loop below, guess how many steps it will need, then press Step and watch the number in the middle.

```widget
gap-closer
```

Every step, slow moves 1 node away and fast moves 2 nodes closer, so the gap shrinks by exactly 1. It goes 5, 4, 3, 2, 1, 0 and cannot skip a number. When the gap is 1, slow steps one node on and fast lands right on top of it. Jumping over slow would mean the gap dropping by 2 in one step, and that never happens.

```quiz
Q: Slow has just entered a loop of 6 nodes. Fast is already in the loop, 4 nodes behind slow. How many more steps until they meet?
- 2
  Why not: That would be right if slow stood still while fast closed 2 nodes a step. Slow keeps moving 1, so fast only gains 1 per step.
* 4
- 6
  Why not: Fast does not need a full lap of the loop. It only has to close the gap that is there now, which is 4 nodes.
Why: The gap shrinks by exactly 1 each step: 4, 3, 2, 1, 0. A gap of 4 takes 4 steps.
```

This is also why the whole thing is `O(n)`. Slow needs at most `n` steps to enter the loop. Once it is inside, the gap is smaller than the loop, so fast closes it before slow can finish one lap.

```quiz
Q: Why can't fast jump over slow on a loop and miss it?
- Because fast moves only one node at a time
  Why not: Fast moves two nodes each step, not one. The question is why those two-node jumps still never skip past slow.
* Because the gap between them shrinks by exactly one node each step
- Because slow waits for fast
  Why not: Slow never stops. Both pointers move on every step; slow just moves one node while fast moves two.
Why: Fast moves 2 and slow moves 1, so the distance from fast to slow (going forward around the loop) drops by 1 every step. It goes 3, 2, 1, 0 and cannot skip 0.
```

## When There Is No Loop

On a plain list nothing is wasted either. Fast covers two nodes for each one that slow covers, so when fast reaches the end, slow has covered half the distance.

```cells
values: 0 1 2 3 4
pointers: slow=0 fast=0
highlight: 0
note: A plain list of 5 nodes. Both pointers start on node 0.
```

```cells
values: 0 1 2 3 4
pointers: slow=1 fast=2
highlight: 1 2
note: Step 1: slow is on node 1, fast is on node 2.
```

```cells
values: 0 1 2 3 4
pointers: slow=2 fast=4
found: 2
highlight: 4
note: Step 2: fast is on the last node and has nowhere to jump. Slow is on node 2, the middle.
```

So one walk gives two answers: "no loop", and "here is the middle".

```quiz
Q: A plain list of 7 nodes (no loop). Slow and fast start at node 0. Where is slow when fast can no longer move two steps?
- Node 2
  Why not: Slow is on node 2 when fast is on node 4. From node 4, fast can still take two steps to node 6.
* Node 3, the middle
- Node 6, the end
  Why not: Node 6 is where fast stops. Slow moves only one step for every two that fast takes, so it covers half the distance.
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

> **When to use it:** A linked list or a "next" function, and the question is about a loop or the middle, especially when the problem asks for `O(1)` extra memory. (For the k-th node from the end, use the cousin of this idea: two pointers at the same speed, k nodes apart.)

> **Watch out:** Check `fast` and `fast.next` before jumping two steps. On a plain list, `fast.next.next` on the last node is the classic crash. And with an even number of nodes there are two middle nodes: this check stops slow on the second one.

## Cost Cheat Sheet

| Approach | Time | Extra space | Why |
| --- | --- | --- | --- |
| Visited set | `O(n)` | `O(n)` | One walk, but every node seen is written down |
| Fast and slow pointers | `O(n)` | `O(1)` | Fast catches slow before slow finishes one lap, and only two pointers are kept |
| Count the length, then walk to the middle | `O(n)` | `O(1)` | Two walks instead of one, and it only works when there is no loop |

```deep-dive
title: Deep dive: why does going back to the head find where the loop starts?
Take a list of 5 nodes, 0 to 4, where node 4 points back to node 1. The loop is 1 → 2 → 3 → 4 and it has 4 nodes. Slow and fast meet on node 4 after 4 steps.

At that moment slow has walked 4 nodes and fast has walked 8. Fast's extra 4 nodes were spent going round the loop and ending on the same node, so they are a whole number of laps. That is always true: **when they meet, the number of steps slow has taken is a multiple of the loop length.**

Now call the walk from the head to the start of the loop `a` nodes (here `a = 1`). A pointer that starts at the head reaches the loop start after `a` steps. A pointer that starts at the meeting point and takes `a` steps has travelled `a` plus whole laps from the head in total, and whole laps change nothing, so it is at the loop start too.

Check it: one pointer goes back to node 0, the other stays on node 4. One step each: 0 → 1 and 4 → 1. They meet on node 1, the first node of the loop.
```

> **Interview tip:** Name the brute force ("a set of visited nodes, `O(n)` memory"), then the upgrade ("two pointers at different speeds: if there is a loop the gap shrinks by one each step, so they must meet"). That reasoning is what turns a memorised trick into an answer you can defend.

## What To Remember

- Slow moves 1, fast moves 2.
- On a loop the gap shrinks by exactly 1 per step, so they must meet and fast cannot jump over slow.
- Fast hits the end: no loop, and slow is in the middle.
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
- [CP-Algorithms: Tortoise and Hare Algorithm (linked list cycle detection)](https://cp-algorithms.com/others/tortoise_and_hare.html)
