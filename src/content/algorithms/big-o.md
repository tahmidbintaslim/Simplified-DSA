# Big O

Big O is a way to talk about growth. It answers one question: when the input gets bigger, how fast does the work grow? It is the shared language every algorithm lesson (and every coding interview) uses. By the end of this lesson you will be able to look at a loop and name its growth shape, and explain why `100 × n` steps and `n` steps get the same label while `n × n` does not.

> **Analogy:** Three ways to find a friend's name. Looking at their name tag takes the same time in any crowd (constant). Asking every person in the room takes longer as the room fills (linear). Introducing every person to every other person explodes as the room fills (quadratic).

## The Core Idea

We do not time code with a stopwatch; seconds change with the computer, the language and what else is running. We count **steps** instead, and ask how that count changes with the size of the input, which we call `n`.

Here is the smallest example. Look for `8` in a list by checking one slot at a time. Step through it.

```cells
values: 5 12 3 9 8
highlight: 0
note: Check 1: is 5 the value we want? No. Move on.
```

```cells
values: 5 12 3 9 8
highlight: 1
dim: 0
note: Check 2: 12. No.
```

```cells
values: 5 12 3 9 8
highlight: 2
dim: 0 1
note: Check 3: 3. No.
```

```cells
values: 5 12 3 9 8
highlight: 3
dim: 0 1 2
note: Check 4: 9. No.
```

```cells
values: 5 12 3 9 8
found: 4
dim: 0 1 2 3
note: Check 5: 8. Found, in the last slot. Five values, five checks. That is the worst this search can do.
```

Five values cost up to 5 checks. Five million values cost up to 5 million. The exact number is not the interesting part. The interesting part is the **shape**: the work grows in step with `n`. We write that as `O(n)` and say "linear".

A handful of shapes cover almost all the code you will meet:

- **`O(1)`**: the work stays flat.
- **`O(log n)`**: the work grows very slowly; doubling the input adds one step.
- **`O(n)`**: the work grows in step with the input.
- **`O(n log n)`**: a little more than linear; what good sorting costs.
- **`O(n²)`**: the work grows with the square of the input.

## See It In Numbers

| n | `O(1)` | `O(log n)` | `O(n)` | `O(n log n)` | `O(n²)` |
| --- | --- | --- | --- | --- | --- |
| 10 | 1 | ~3 | 10 | ~33 | 100 |
| 100 | 1 | ~7 | 100 | ~664 | 10,000 |
| 1,000 | 1 | ~10 | 1,000 | ~9,966 | 1,000,000 |

Read the last row: at 1,000 items, quadratic work is a million steps while logarithmic work is ten. Now read down a column instead. Each row has 10 times more items than the one above: the `O(n)` column grows 10 times, and the `O(n²)` column grows 100 times.

Drag `n` and watch the bars. They share one scale, so the slow shapes take over quickly. The time column assumes one step takes a microsecond.

```demo
```

```quiz
Q: A function with a loop inside a loop takes about 1 second on 1,000 items. Roughly how long will it take on 10,000 items?
- About 10 seconds
  Why not: That would be linear growth: 10 times the items, 10 times the work. A loop inside a loop multiplies the two, so the growth is squared.
* About 100 seconds
- About 1,000 seconds
  Why not: That would be 10 × 10 × 10, the growth of three nested loops. Two nested loops give 10 × 10.
Why: The work is n × n. Ten times the items means 10 × 10 = 100 times the work, so 1 second becomes about 100.
```

## Spotting Each Shape In Code

**Constant: one direct step.**

```javascript
const first = numbers[0];
```

**Linear: one loop over the input.**

```javascript
for (const number of numbers) {
  console.log(number);
}
```

**Quadratic: a loop inside a loop over the same input.**

```javascript
for (const a of numbers) {
  for (const b of numbers) {
    console.log(a, b);
  }
}
```

**Logarithmic: the problem halves each step.**

```javascript
while (n > 1) {
  n = Math.floor(n / 2);
}
```

```quiz
Q: A function loops over an array once, and inside the loop does one hash-table lookup. What is its Big O?
- O(1)
  Why not: O(1) means the work stays the same at any size. The loop runs once per item, so a bigger array means more work.
* O(n)
- O(n²)
  Why not: O(n²) needs a loop inside a loop. The inside here is one hash lookup, which is O(1) on average, not a second loop.
Why: The loop runs n times and each hash lookup is O(1) on average, so the total is n × 1 = O(n).
```

## Two Rules That Simplify Everything

1. **Drop constants.** Two separate loops over the input is `2n` steps, still `O(n)`. Big O is about shape, not exact count.
2. **Keep the biggest term.** `n² + n` is `O(n²)`, because at large sizes the `n²` part dwarfs the rest.

The first rule is the one that feels like cheating. Surely a program that takes 100 steps per item is worse than one that takes 1? It is, by a factor of 100, and it stays exactly 100. A different shape is another matter. Give the linear program a huge handicap and race it against a quadratic one: start small, then drag `n` up, then change the handicap.

```widget
constant-race
```

On small inputs the quadratic program really was ahead. But there was always a crossover, and past it the linear program won by more and more. Making the constant bigger only pushed the crossover further right; it never removed it. That is why Big O ignores the constant: the constant says where the lines cross, the shape says who wins after that.

> **Key idea:** Big O keeps only the shape of the growth, because for big enough inputs the shape beats any constant.

```quiz
Q: Program A takes 50 × n steps. Program B takes n × n steps. For which input sizes does B do less work?
- Never, because O(n²) is always worse than O(n)
  Why not: Big O describes what happens as n grows large. At n = 10, A takes 500 steps and B only 100.
* Only when n is below 50
- Only when n is above 50
  Why not: That is backwards. Above 50, n × n is more than 50 × n: at n = 100, B takes 10,000 steps and A takes 5,000.
Why: n × n is less than 50 × n exactly when n is less than 50. At n = 50 they tie at 2,500 steps, and after that B falls further behind forever.
```

```quiz
Q: A function has one loop over the input, followed by a nested loop over the input. What is its Big O?
- O(n)
  Why not: The nested loop alone runs n × n times, so the total grows faster than n.
- O(n + n²), and you cannot simplify it
  Why not: Big O keeps only the term that grows fastest. For n = 1,000, n is 1,000 steps while n² is 1,000,000, so the small term barely matters.
* O(n²)
Why: The total is n + n² steps. Keep the biggest term: n² dominates, so it is O(n²).
```

> **Watch out:** Hidden loops count. JavaScript's `array.includes(x)` and Python's `x in some_list` and `some_list.index(x)` check items one by one, and taking a slice copies every item in it. A loop that calls `includes` is a nested loop in disguise: `O(n²)`.

## Time And Space

Big O describes memory too. Making a copy of the input costs `O(n)` extra space; using a few variables costs `O(1)`. Interviewers usually ask for both: "time `O(n)`, space `O(1)`".

The two often trade against each other. Remembering what you have already seen in a hash set costs `O(n)` space, and in return a slow `O(n²)` search for pairs can drop to `O(n)` time.

> **When to use it:** Before you write the code, to compare two plans; and when something is slow, to find the part that will get worse as the data grows. For small, fixed sizes (a list of 10 settings) the shape hardly matters and the simplest code wins.

## Cost Cheat Sheet

| Shape | Name | If `n` doubles, the work... | Why (a typical cause) |
| --- | --- | --- | --- |
| `O(1)` | Constant | stays the same | One direct step, like reading `array[i]` |
| `O(log n)` | Logarithmic | grows by one step | Each step throws away half, like binary search |
| `O(n)` | Linear | doubles | One pass over the input |
| `O(n log n)` | Linearithmic | a little more than doubles | Good sorting: about `log n` passes over `n` items |
| `O(n²)` | Quadratic | becomes 4 times as much | Every item paired with every item |

```deep-dive
title: Deep dive: is Big O the same as "worst case"?
Not quite; they answer two different questions.

**Big O is an upper bound on growth.** Saying "the work is `O(n)`" means: past some input size, the work is never more than some fixed constant times `n`. You watched both of those numbers in the widget: the constant was A's steps per item, and the "past some size" was the crossover.

**Best, worst and average case say which input you are talking about.** Take the scan from the top of this lesson. Best case, the value is in the first slot: 1 check. Worst case, it is last or missing: `n` checks. On average, when the value is equally likely to be anywhere, about `n / 2` checks, which is still `O(n)` once the constant is dropped.

So the full sentence is "linear search is `O(n)` in the worst case". When people leave the last part out, they almost always mean the worst case, because it is the promise you can rely on.
```

> **Interview tip:** State the brute-force Big O first, then improve it. "Checking every pair is `O(n²)`; with a hash set I can do it in `O(n)` time and `O(n)` space" shows exactly the reasoning interviewers look for.

## What To Remember

- Big O describes how work grows, not exact time.
- Find the shape: one step, halving, one loop, sorting, or nested loops.
- Drop constants and keep the biggest term: a constant only moves the crossover.
- Watch for library calls that hide a loop.

## Practice Prompt

You have 100 names. How many checks does it take to print each name once? To compare every name with every other name? What about 1,000 names?

```answer
Printing each name once is 100 checks, one per name: `O(n)`.

Comparing every name with every other name with a loop inside a loop is 100 × 100 = 10,000 checks (4,950 if each pair is compared only once): `O(n²)`.

With 1,000 names, printing takes 1,000 checks, but comparing takes 1,000,000 (499,500 unique pairs). Ten times the names means ten times the printing work, and a hundred times the comparing work.
```

## Sources Checked

- [OpenDSA: Asymptotic Analysis and Upper Bounds](https://opendsa-server.cs.vt.edu/ODSA/Books/CS3/html/AnalAsymptotic.html)
- [Python: Time complexity of operations on built-in types](https://docs.python.org/3/builtins/time-complexity.html)
- [MDN: Array.prototype.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
- [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp)
