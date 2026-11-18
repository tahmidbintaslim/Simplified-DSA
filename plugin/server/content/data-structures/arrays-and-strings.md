# Arrays and Strings

An array is a row of values kept in order, each with a number called its index. It is the simplest data structure there is, and almost every other one is built on top of it. Its whole personality comes from one decision: the values sit **right next to each other** in memory. That one decision makes some things instant and other things slow, and by the end of this lesson you will be able to say exactly which, and why.

> **Analogy:** Picture a row of numbered lockers in a school hallway, all the same width. If you know the locker number, you walk straight to it. You never open lockers 0, 1 and 2 to find locker 3.

## The Core Idea

Every slot has an index, and in most languages the first index is `0`, not `1`.

```cells
values: 10 20 30 40
note: Four values. The small numbers underneath are the indexes: 10 is at index 0, 40 is at index 3.
```

Starting at 0 feels odd at first. It will make sense in a minute, once you see what an index really means to the computer.

```quiz
Q: In the array `[10, 20, 30, 40]`, what is at index 2?
- 20
  Why not: That is index 1. Counting starts at 0, so 10 sits at index 0 and 20 at index 1.
* 30
- 40
  Why not: That is index 3, the last slot. Four values use indexes 0 to 3, so count again from 0.
Why: Indexes start at 0, so index 0 is 10, index 1 is 20 and index 2 is 30.
```

## Why Reading Is Fast

Memory is one very long street of numbered boxes, called addresses. When you make an array, the computer reserves a stretch of that street and puts the values in it one after another, every value the same size.

So to find value number `i`, the computer does not search. It calculates. Pick an index below and watch the arrow: it flies straight to the right box.

```widget
memory-lane
```

That calculation is the whole secret:

```text
address of item i = start address + i × size of one item
```

Notice what the index really is: **how many slots to skip** from the start. Index 0 skips nothing, so it is the start address itself. That is why counting starts at 0.

One multiplication and one addition take the same time whether the array holds six values or six million. We call that `O(1)`, or "constant time".

> **Key idea:** Reading or writing `array[i]` is `O(1)` because the address is calculated, not searched for.

## Why Inserting In The Middle Is Slow

Here is the price of keeping everything side by side with no gaps. To insert a value in the middle, there is no empty box waiting there. Every value after that spot has to move one box to the right first.

Try it: click a gap to insert `99`. Try the very front, then the very end.

```widget
shift-cost
```

The bars tell the story. Inserting at index `k` in an array of `n` values moves `n − k` values. At the end, nothing moves. At the front, everything does. In the worst case the work grows in step with the array, so we call it `O(n)`.

Now the same idea, slowed right down. Insert `23` at index `2` in `[4, 8, 15, 16]`. Step through it with Next, or drag the slider.

```cells
values: 4 8 15 16 _
pointers: insert=2
highlight: 2
note: Start. We want 23 at index 2, but 15 is sitting there. The array grows by one empty slot at the end.
```

```cells
values: 4 8 15 16 16
done: 4
note: Step 1: copy the last value, 16, one slot right. Always start from the end, so nothing gets overwritten.
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

Deleting is the same story in reverse: everything after the deleted value slides one box left to close the gap.

```quiz
Q: You delete the first value of a 1,000-item array. About how many values have to move?
- 1
  Why not: Arrays keep their values side by side with no gaps, so more than the deleted slot is affected. Think about every value after it.
- 500
  Why not: That would be half the array. Deleting at the very front leaves every remaining value one slot out of place, not just half of them.
* 999
Why: Every value after the deleted one shifts one slot left to close the gap, so 999 values move.
```

## Try It

Now drive a real array. Read a value, then insert and delete at different indexes, and watch the teal cells: those are the values that had to move. Turn on "Predict first" to guess before each step.

```demo
```

## Strings Are Ordered Too

A string is text, and for many problems you can treat it exactly like an array of characters: index into it, scan it from left to right, compare two positions.

```cells
values: c o d e
pointers: first=0 last=3
note: The string "code" as four characters. Index 0 is "c", index 3 is "e".
```

But there is a catch hiding in that word "character". What you see on screen is not always one slot in memory. Type some English, then try `বাংলা` or the waving hand.

```widget
string-bytes
```

English letters are the easy case: one character, one code point, one byte. Bangla is not. The `বা` you see is two code points joined together (`ব` and the vowel sign `া`), the `ং` attaches to them too, and each code point takes 3 bytes in UTF-8. So `বাংলা` is 2 clusters on screen (`বাং` and `লা`), Python's `len()` says 5, and it is stored as 15 bytes.

> **Watch out:** Slicing a string by position can cut a character in half. `"বাংলা"[0]` in Python is `ব`, not `বা`. And in many languages strings cannot be changed in place (they are immutable), so "changing" one builds a new string, which costs `O(n)`.

```quiz
Q: Python's `len("বাংলা")` returns 5. Why not 3, the letters you might count by eye?
- Python counts bytes
  Why not: In UTF-8 that word is 15 bytes. Python's len() counts code points, not bytes.
* Some letters you see are two code points joined, like ব plus the vowel sign া
- Bangla letters are always 2 code points each
  Why not: Then the answer would be 6. Only some letters carry a vowel sign; ং is a single code point.
Why: len() counts code points: ব, া, ং, ল and া. The vowel signs and ং are separate code points that join onto the letter before them.
```

## When To Use An Array

> **When to use it:** You read values by position, scan everything in order, or mostly add to the end. Reach for something else when you constantly insert or delete at the front or in the middle.

## Cost Cheat Sheet

| Operation | Cost | Why |
| --- | --- | --- |
| Read or write `array[i]` | `O(1)` | One address calculation |
| Append to the end | `O(1)` usually | Sometimes a growable array copies itself into a bigger block |
| Insert or delete in the middle | `O(n)` | Later values shift |
| Search for a value | `O(n)` | You may have to check every slot |

```deep-dive
title: Deep dive: how can appending be O(1) if the array sometimes copies itself?
A growable array (Python's `list`, JavaScript's `Array`, Java's `ArrayList`, Go's slice, Rust's `Vec`) reserves more boxes than it needs. Appending just fills the next spare box. When the spares run out, it grabs a block about twice as big and copies everything over. That copy is `O(n)`, but it happens so rarely that, averaged over many appends, each one costs `O(1)`. This is called **amortized** constant time.
```

## Language Differences

The language tabs below show how 10 popular languages create array-like structures. As you compare, ask:

- Is the structure fixed-size or growable?
- Does it store raw values or references to objects?
- Does the language check that the index is in range?
- Is memory freed by hand, by ownership rules, or by a garbage collector?

## What To Remember

- An index is how many slots to skip from the start, so it begins at 0.
- Reading by index is `O(1)`: the address is calculated, not searched.
- Inserting or deleting near the front is `O(n)`: every later value shifts.
- A string is ordered like an array, but one visible character can be several code points and many bytes.

## Practice Prompt

Given `[3, 6, 9, 12, 15]`, delete the value at index 1. Write the array after each shift. How many values moved?

```answer
Deleting index 1 removes the 6. Every later value shifts one slot left:

1. Copy 9 left: `[3, 9, 9, 12, 15]`
2. Copy 12 left: `[3, 9, 12, 12, 15]`
3. Copy 15 left: `[3, 9, 12, 15, 15]`
4. Drop the last slot: `[3, 9, 12, 15]`

3 values moved.
```

## Sources Checked

- [OpenDSA: Array-Based List Implementation](https://opendsa.cs.vt.edu/OpenDSA/Books/Catalog/html/ListArray.html)
- [Open Data Structures](https://opendatastructures.org/)
- [Python: Unicode HOWTO](https://docs.python.org/3/howto/unicode.html)
- [MDN: JavaScript Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Go Slices: usage and internals](https://go.dev/blog/slices-intro)
- [Rust Vec](https://doc.rust-lang.org/std/vec/struct.Vec.html)
