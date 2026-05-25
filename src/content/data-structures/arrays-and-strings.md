# Arrays and Strings

Arrays are the first data structure worth understanding because many other structures build on the same idea: keep values in a predictable order, then use positions to reach them.

## The Core Idea

An array-like structure is a numbered row of values. The number is called an index. In many programming languages, the first index is `0`, not `1`.

```text
numbers: [10, 20, 30, 40]
index:    0   1   2   3
```

The important promise is direct access. If you know the index, the computer can often jump to that position without checking every earlier value.

## Why Access Is Fast

Classic arrays store same-sized values in nearby memory slots. When values are packed in order, the address of an item can be calculated from the array start, the item size, and the index.

That is why reading `array[i]` is usually described as `O(1)`: one direct lookup, no scan.

## How The Computer Sees It

RAM is a long set of addressable memory locations. A CPU reads and writes values from those addresses.

For a low-level array of integers, the computer can calculate an item address like this:

```text
item_address = start_address + index * item_size
```

High-level languages add layers on top. Python lists store references to objects. JavaScript arrays are objects optimized by the engine. Rust vectors own a buffer. Go slices point into backing arrays. The core idea stays the same, but each language gives you a different interface and different safety rules.

## Why Insert and Delete Can Be Slow

Arrays stay useful because the order is stable. That order has a cost.

If you insert into the middle, every item after that point must shift right to make space. If you delete from the middle, every later item must shift left to close the gap.

That shifting makes middle insert and delete operations `O(n)`.

## Strings Behave Like Ordered Data

A string is text, but many algorithm problems treat it like ordered data that can be scanned.

Strings are not identical across languages. Some store bytes, some store Unicode scalar values, some expose characters through iterators, and many make strings immutable. The shared lesson is that text has order and indexes can be tricky because human characters and memory bytes are not always the same thing.

## Language Differences

Use the language tabs after this lesson to compare how popular languages create and use array-like structures.

Focus on these questions:

- Is the structure fixed-size or growable?
- Does it store raw values or references to objects?
- Does the language check bounds?
- Is memory freed manually, by ownership rules, or by garbage collection?
- Does the code compile to machine code, bytecode, or run through an interpreter?

## What To Remember

- Access by index is fast when memory layout supports direct address calculation.
- Appending to a growable array is usually fast, but sometimes triggers a copy.
- Inserting or deleting near the front is expensive because later values shift.
- Strings are ordered, but character indexing can be more complex than array indexing.
- Language syntax changes, but the memory and complexity questions stay similar.

## Practice Prompt

Given `[4, 8, 15, 16]`, insert `23` at index `2`. Which values have to move? Which languages below use a fixed-size structure, and which use a growable one?

## Sources Checked

- [OpenDSA: Array-Based List Implementation](https://opendsa.cs.vt.edu/OpenDSA/Books/Catalog/html/ListArray.html)
- [Open Data Structures](https://opendatastructures.org/)
- [MDN: JavaScript Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Python Data Structures](https://docs.python.org/3/tutorial/datastructures.html)
- [Go Slices: usage and internals](https://go.dev/blog/slices-intro)
- [Rust Vec](https://doc.rust-lang.org/std/vec/struct.Vec.html)
