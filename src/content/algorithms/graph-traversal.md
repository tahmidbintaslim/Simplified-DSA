# Graph Traversal: BFS and DFS

A graph is a set of points (nodes) joined by connections (edges). Maps, social networks, web links, mazes and course prerequisites are all graphs. Traversal means visiting the nodes in a planned order, and the two classic plans are breadth-first and depth-first search.

## A Grid Is a Graph

The demo uses a grid because it is easy to see. Each open cell is a node. Each cell has an edge to its open neighbours above, right, below and left. Walls simply remove edges.

## The Shared Skeleton

Both searches use the same loop:

```text
put start in the waiting list
while the waiting list is not empty:
    take a cell out
    if it was visited already, skip it
    mark it visited
    if it is the goal, stop
    add its unvisited neighbours to the waiting list
```

The only difference is the waiting list.

## Breadth-First Search Uses a Queue

A queue hands back the cell that has waited longest. So BFS visits everything one step from the start, then everything two steps away, then three. It spreads out in rings, like a ripple in water.

Because it explores in order of distance, the first time BFS reaches the goal it has found a shortest path (in steps).

## Depth-First Search Uses a Stack

A stack hands back the cell added most recently. So DFS runs down one path as far as it can, and only backs up when it hits a dead end.

DFS uses less memory on wide graphs and is the natural fit for problems like "is everything connected?", cycle detection and topological sorting. But the path it finds first can be long and winding, not shortest.

## Cost

Each cell is visited once and each edge is checked a constant number of times, so both run in `O(V + E)`, where `V` is the number of nodes and `E` the number of edges.

## Remembering the Way Back

To draw the path, record where each cell was discovered from (its parent). When you reach the goal, follow the parents back to the start.

## What To Remember

- Same loop, different waiting list: queue for BFS, stack for DFS.
- BFS finds the shortest path when every step costs the same.
- DFS goes deep first and is often written with recursion, which uses the call stack as its stack.
- When steps have different costs (roads with distances), use Dijkstra's algorithm, which swaps the queue for a priority queue.

## Practice Prompt

In the demo, build a wall that leaves only one gap. Run BFS and DFS. Do they find the same path? Which one visited more cells before reaching the goal?

## Sources Checked

- [Open Data Structures: Graphs](https://opendatastructures.org/ods-java/12_Graphs.html)
- [CP-Algorithms: Breadth-first search](https://cp-algorithms.com/graph/breadth-first-search.html)
- [CP-Algorithms: Depth-first search](https://cp-algorithms.com/graph/depth-first-search.html)
