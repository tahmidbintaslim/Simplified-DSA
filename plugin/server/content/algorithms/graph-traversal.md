# Graph Traversal: BFS and DFS

A graph is a set of points (nodes) joined by connections (edges). Maps, social networks, web links, mazes and course prerequisites are all graphs. Traversal means visiting every reachable node in a planned order, and there are two classic plans: breadth-first search (BFS) and depth-first search (DFS).

> **Analogy:** You lost your keys in a building. BFS checks every room on your floor, then every room one floor away, then two floors away: it spreads like a ripple. DFS walks down one corridor as far as it goes, and only backs up at a dead end.

## A Small Graph

```text
A ─── B ─── D
│           │
C ───────── E
```

A is connected to B and C. B to A and D. C to A and E. D to B and E.

## The Shared Recipe

Both searches use the same loop. Only the waiting list differs.

1. Put the start node in the waiting list.
2. Take a node out. If it was already visited, skip it.
3. Mark it visited.
4. Put its unvisited neighbours in the waiting list.
5. Repeat until the waiting list is empty.

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
note: Take B from the front and visit it. Its unvisited neighbour D joins the back.
```

```cells
values: D E
pointers: front=0 back=1
note: Take C and visit it. Its neighbour E joins. Next come D, then E.
```

Visit order: **A, B, C, D, E**. Everything one step away (B, C) comes before anything two steps away (D, E). That is why BFS finds the **shortest path** when every edge costs the same.

```quiz
Q: In BFS from A, why is D visited before E?
- D comes first in the alphabet
* D joined the queue first, because B (D's neighbour) was visited before C (E's neighbour)
- DFS and BFS always visit in the same order
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
note: Pop C and visit it. Push its neighbour E.
```

```cells
values: B D
pointers: top=1
note: Pop E and visit it. Push its neighbour D. Then pop D, and finally B.
```

Visit order: **A, C, E, D, B**. DFS went deep along one route (A, C, E, D) before coming back for B.

```quiz
Q: Which data structure turns BFS into DFS?
- A hash table
* A stack instead of a queue
- A sorted array
Why: The algorithm is the same loop. Taking the newest waiting node (stack) instead of the oldest (queue) makes it go deep first.
```

Same grid, same start and goal. Switch between breadth-first and depth-first and watch the numbers: they are the visit order. Click cells to build walls.

```demo
```

## Finding The Path

To draw the route, record where each node was discovered from (its parent). When you reach the goal, follow the parents back to the start.

> **Watch out:** Mark nodes as visited, or the search walks in circles forever on any graph with a loop. In BFS, marking a node when it joins the queue (not when it leaves) also stops it from being queued twice.

> **When to use it:** BFS for "fewest steps", "shortest path in an unweighted grid" and "process level by level". DFS for "is everything connected?", "find every path", "detect a cycle" and puzzles where you explore a choice fully before trying the next.

## Cost Cheat Sheet

| Search | Waiting list | Time | Finds the shortest path? |
| --- | --- | --- | --- |
| BFS | Queue | `O(V + E)` | Yes, when every edge costs the same |
| DFS | Stack (or recursion) | `O(V + E)` | No |

`V` is the number of nodes and `E` the number of edges: each node is visited once and each edge checked a constant number of times.

> **Interview tip:** Grid problems ("number of islands", "rotting oranges", "shortest path in a maze") are graph problems in disguise: each cell is a node and its four neighbours are its edges. When edges have different costs, such as roads with distances, BFS is not enough; use Dijkstra's algorithm, which swaps the queue for a priority queue.

## What To Remember

- Same loop, different waiting list: a queue for BFS, a stack for DFS.
- BFS spreads in rings and finds the shortest path in steps.
- DFS goes deep first; recursion uses the call stack as its stack.

## Practice Prompt

In the demo, build a wall with a single gap. Run BFS and DFS. Do they find the same path? Which one visited more cells before reaching the goal?

## Sources Checked

- [Open Data Structures: Graphs](https://opendatastructures.org/ods-java/12_Graphs.html)
- [CP-Algorithms: Breadth-first search](https://cp-algorithms.com/graph/breadth-first-search.html)
- [CP-Algorithms: Depth-first search](https://cp-algorithms.com/graph/depth-first-search.html)
