# Graph Traversal: BFS and DFS

A graph is a set of points (nodes) joined by connections (edges). Maps, social networks, web links, mazes and course prerequisites are all graphs. Traversal means visiting every node you can reach, in a planned order. There are two classic plans, breadth-first search (BFS) and depth-first search (DFS), and by the end of this lesson you will be able to trace both by hand, say what single choice separates them, and explain why only one of them finds the shortest route.

> **Analogy:** You lost your keys in a building. BFS checks every room on your floor, then every room one floor away, then two floors away: it spreads like a ripple. DFS walks down one corridor as far as it goes, and only backs up at a dead end.

## The Core Idea

An array has an obvious order: index 0, then 1, then 2. A graph has none. From one node you may be able to step to several others, and some paths lead back to where you started.

So a traversal needs two things: a **waiting list** of nodes it has found but not visited yet, and a **mark** on every node it has already found, so it never walks in circles.

## A Small Graph

```text
A ─── B ─── D
│           │
C ───────── E
```

A is connected to B and C. B to A and D. C to A and E. D to B and E. The nodes a node is connected to are its **neighbours**.

## The Shared Recipe

Both searches use the same loop. Only the waiting list differs.

1. Put the start node in the waiting list and mark it as seen.
2. Take a node out of the waiting list and visit it.
3. Look at its neighbours. Each one that is not marked yet gets marked as seen and joins the waiting list.
4. Repeat from step 2 until the waiting list is empty.

## BFS Uses A Queue

A queue gives back the node that has waited longest. Start at A:

```cells
values: B C
pointers: front=0 back=1
note: Visit A. Its neighbours B and C join the queue.
```

```cells
values: C D
pointers: front=0 back=1
note: Take B from the front and visit it. Its unseen neighbour D joins the back.
```

```cells
values: D E
pointers: front=0 back=1
note: Take C and visit it. Its unseen neighbour E joins the back.
```

```cells
values: E _
pointers: front=0
note: Take D and visit it. Its neighbours B and E are both marked already, so nothing joins.
```

```cells
values: _ _
note: Take E and visit it. The queue is empty, so the search is over.
```

Visit order: **A, B, C, D, E**.

```quiz
Q: In BFS from A, why is D visited before E?
- D comes first in the alphabet
  Why not: BFS never looks at the names. The order comes from when each node joined the waiting list.
* D joined the queue first, because B (D's neighbour) was visited before C (E's neighbour)
- DFS and BFS always visit in the same order
  Why not: They use different waiting lists, so their orders usually differ. In this lesson, DFS from A visits A, C, E, D, B, while BFS visits A, B, C, D, E.
Why: A queue is first-in, first-out. B was taken out before C, so B's neighbour D joined the queue before C's neighbour E.
```

## DFS Uses A Stack

A stack gives back the node added most recently. Start at A again:

```cells
values: B C
pointers: top=1
note: Visit A. Push B, then C. C is on top.
```

```cells
values: B E
pointers: top=1
note: Pop C and visit it. Push its unseen neighbour E.
```

```cells
values: B D
pointers: top=1
note: Pop E and visit it. Push its unseen neighbour D.
```

```cells
values: B _
pointers: top=0
note: Pop D and visit it. Its neighbours B and E are both marked already, so nothing is pushed.
```

```cells
values: _ _
note: Pop B and visit it. The stack is empty, so the search is over.
```

Visit order: **A, C, E, D, B**. DFS went deep along one route (A, C, E, D) before coming back for B, which had been waiting since the very first step.

```quiz
Q: Which data structure turns BFS into DFS?
- A hash table
  Why not: A hash table can remember which nodes were seen, but it does not decide which waiting node comes out next. That choice is what changes the order.
* A stack instead of a queue
- A sorted array
  Why not: A sorted array would hand out nodes by value, not by when they joined the waiting list. Going deep depends on arrival order.
Why: The algorithm is the same loop. Taking the newest waiting node (stack) instead of the oldest (queue) makes it go deep first.
```

## Why Only The Waiting List Differs

Now run the loop yourself on a bigger graph. Marking and adding neighbours is done for you; your only job is to choose which end of the waiting list the next node comes from. Play it through taking only the oldest, reset, then only the newest.

```widget
waiting-list
```

Nothing else changed between your two runs: same graph, same start, same loop. Taking the oldest node means finishing everyone who was found early before touching anyone found late, so the search spreads out row by row. Taking the newest means following the node you found a moment ago, so the search runs down one route and leaves older nodes waiting.

> **Key idea:** BFS and DFS are one algorithm with one choice. Take the oldest waiting node and you get BFS. Take the newest and you get DFS.

## Why BFS Finds The Shortest Path

Look at the BFS order again: A, then B and C, then D and E. B and C are one step from A. D and E are two steps away. BFS visits nodes in rings: everything 1 step away, then everything 2 steps away, and so on.

It has to. The nodes one step away join the queue first, and a queue never lets a later node overtake an earlier one. So the first time BFS reaches a node, it has reached it by the fewest steps possible.

DFS makes no such promise. In the small graph it reaches D by the route A, C, E, D: three steps, when A, B, D takes two.

```quiz
Q: On the small graph, BFS starts at D instead of A. Which nodes are in the second ring, two steps from D?
- B and E
  Why not: Those are D's own neighbours, one step away. They form the first ring.
* A and C
- Only A
  Why not: A is two steps away through B, but C is also two steps away, through E. A ring holds every node at that distance.
Why: D's neighbours B and E are one step away. From B you reach A, and from E you reach C, so A and C are two steps away.
```

## Finding The Path

Visiting tells you that a node can be reached, not how. To draw the route, record where each node was found from (its parent) at the moment you mark it. When you reach the goal, follow the parents back to the start.

## Try It

Same grid, same start and goal. Switch between breadth-first and depth-first and watch the numbers: they are the visit order. Click cells to build walls.

```demo
```

> **Watch out:** Mark a node the moment it joins the waiting list. Without marks, the search walks in circles forever on any graph with a loop. If you mark late, only when a node is taken out, the same node can join the list several times, and you must skip the repeats as they come out (the depth-first mode of the demo above works this way).

> **When to use it:** BFS for "fewest steps", "shortest path in an unweighted grid" and "process level by level". DFS for "is everything connected?", "find every path", "detect a cycle" and puzzles where you explore a choice fully before trying the next.

## Cost Cheat Sheet

| Search | Waiting list | Time | Finds the shortest path? | Why |
| --- | --- | --- | --- | --- |
| BFS | Queue | `O(V + E)` | Yes, when every edge costs the same | It visits in rings, nearest first |
| DFS | Stack (or recursion) | `O(V + E)` | No | It follows one route as deep as it goes |

`V` is the number of nodes and `E` the number of edges. Each node joins the waiting list once, and each edge is looked at once from each of its two ends, so the work is the nodes plus the edges. Both searches also need `O(V)` memory for the marks and the waiting list.

```deep-dive
title: Deep dive: where is the stack in recursive DFS?
DFS is often written without any visible stack: a function marks its node, then calls itself on each unmarked neighbour. The stack is still there. Every call that has not finished is remembered by the language on its **call stack**, and returning from a call is the same as popping. Two things to know. First, a very long route means very deep recursion, and languages limit that depth: Python raises `RecursionError`, and others crash with a stack overflow. An explicit stack avoids this. Second, the explicit-stack version in this lesson always goes deep first, but on some graphs its exact visit order differs from the recursive one. When the exact order matters, as in cycle detection, the recursive form is the safer one to copy.
```

> **Interview tip:** Grid problems ("number of islands", "rotting oranges", "shortest path in a maze") are graph problems in disguise: each cell is a node and its four neighbours are its edges. When edges have different costs, such as roads with distances, BFS is not enough; use Dijkstra's algorithm, which swaps the queue for a priority queue.

## What To Remember

- Same loop, different waiting list: a queue for BFS, a stack for DFS.
- Mark nodes as seen, or a loop in the graph traps the search.
- BFS visits in rings, so the first time it reaches a node is by the fewest steps.
- DFS goes deep first; recursion uses the call stack as its stack.
- Both cost `O(V + E)`: every node once, every edge from both ends.

## Practice Prompt

In the demo, build a wall with a single gap. Run BFS and DFS. Do they find the same path? Which one visited more cells before reaching the goal?

```answer
BFS always finds a shortest path through the gap, because it reaches every cell in order of distance. DFS also finds a path, but it is often longer and winding, because it follows one direction as far as it can before backing up.

Which one visits more cells depends on your walls. On an open grid BFS usually visits more, since it spreads out in rings; in a narrow corridor they visit about the same. Watch the visit numbers in the cells to compare.
```

## Sources Checked

- [Open Data Structures: Graph Traversal](https://opendatastructures.org/ods-java/12_3_Graph_Traversal.html)
- [CP-Algorithms: Breadth-first search](https://cp-algorithms.com/graph/breadth-first-search.html)
- [CP-Algorithms: Depth-first search](https://cp-algorithms.com/graph/depth-first-search.html)
- [Python: sys.setrecursionlimit](https://docs.python.org/3/library/sys.html#sys.setrecursionlimit)
