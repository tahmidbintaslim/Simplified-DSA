# Arrays and Strings

An array is a row of values kept in order, where every value has a number called its index. Almost every other data structure is built on this idea, so it is the best place to start.

> **Analogy:** Picture a row of numbered lockers in a school hallway. If you know the locker number, you walk straight to it. You never open lockers 0, 1 and 2 to find locker 3.

## The Core Idea

Each slot in an array has an index. In most programming languages the first index is `0`, not `1`.

```cells
values: 10 20 30 40
note: Four values. The small numbers underneath are the indexes: the first value is at index 0, the last at index 3.
```

> **Key idea:** If you know the index, you can read the value in one step, no matter how long the array is. That is called `O(1)`, or "constant time".

```quiz
Q: In the array `[10, 20, 30, 40]`, what is at index 2?
- 20
* 30
- 40
Why: Indexes start at 0, so index 0 is 10, index 1 is 20 and index 2 is 30.
```

## Why Reading Is Fast

A classic array keeps its values side by side in memory, all the same size. So the computer can work out where any value lives with one small calculation:

```text
address of item i = start address + i × size of one item
```

No searching is needed: one multiplication, one addition, and the computer jumps straight there.

## Why Inserting In The Middle Is Slow

Order is the array's promise, and keeping that promise costs work. To insert in the middle, every value after that spot has to move one slot to the right first.

Let's insert `23` at index `2` in `[4, 8, 15, 16]`, step by step.

```cells
values: 4 8 15 16
pointers: insert=2
highlight: 2
note: Start. We want 23 at index 2, but 15 is sitting there.
```

```cells
values: 4 8 15 16 16
done: 4
note: Step 1: copy the last value, 16, one slot right. Always start from the end so nothing is overwritten.
```

```cells
values: 4 8 15 15 16
done: 3 4
note: Step 2: copy 15 one slot right. Index 2 is now free to reuse.
```

```cells
values: 4 8 23 15 16
highlight: 2
done: 3 4
note: Step 3: write 23 into index 2. Two values had to move.
```

In a list of a million values, inserting at the front would move a million values. That is why middle inserts and deletes are `O(n)`: the work grows with the size of the array.

```quiz
Q: You delete the first value of a 1,000-item array. About how many values have to move?
- 1
- 500
* 999
Why: Every value after the deleted one shifts one slot left to close the gap, so 999 values move.
```

Read a value, then insert and delete at different indexes. Watch the teal cells: those are the values that had to move.

```demo
```

## Strings Are Ordered Too

A string is text, but many problems treat it like an array of characters you can scan from left to right.

```cells
values: c o d e
pointers: first=0 last=3
note: The string "code" as four characters. Index 0 is "c".
```

> **Watch out:** In many languages strings cannot be changed in place (they are immutable). "Changing" one creates a new string, which costs `O(n)`. And one human character is not always one byte: emoji and many alphabets take several bytes.

## When To Use An Array

> **When to use it:** You need to read values by position, scan everything in order, or add to the end. Reach for something else when you constantly insert or delete at the front or in the middle.

## Cost Cheat Sheet

| Operation | Cost | Why |
| --- | --- | --- |
| Read or write `array[i]` | `O(1)` | One address calculation |
| Append to the end | `O(1)` usually | Sometimes the array grows and copies itself |
| Insert or delete in the middle | `O(n)` | Later values shift |
| Search for a value | `O(n)` | You may have to check every slot |

## Language Differences

The language tabs below show how 10 popular languages create array-like structures. As you compare, ask:

- Is the structure fixed-size or growable?
- Does it store raw values or references to objects?
- Does the language check that the index is in range?
- Is memory freed by hand, by ownership rules, or by a garbage collector?

## What To Remember

- An index is a position number, starting at 0.
- Reading by index is `O(1)` because the address is calculated, not searched.
- Inserting or deleting near the front is `O(n)` because later values shift.
- Strings are ordered like arrays, but characters and bytes are not always the same thing.

## Practice Prompt

Given `[3, 6, 9, 12, 15]`, delete the value at index 1. Write the array after each shift. How many values moved?

## Sources Checked

- [OpenDSA: Array-Based List Implementation](https://opendsa.cs.vt.edu/OpenDSA/Books/Catalog/html/ListArray.html)
- [Open Data Structures](https://opendatastructures.org/)
- [MDN: JavaScript Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Python Data Structures](https://docs.python.org/3/tutorial/datastructures.html)
- [Go Slices: usage and internals](https://go.dev/blog/slices-intro)
- [Rust Vec](https://doc.rust-lang.org/std/vec/struct.Vec.html)
