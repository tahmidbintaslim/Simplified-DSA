# Big O

Big O is a way to talk about growth. It answers one question: when the input gets bigger, how fast does the work grow? It is the shared language every algorithm lesson (and every coding interview) uses.

> **Analogy:** Three ways to find a friend's name. Looking at their name tag takes the same time in any crowd (constant). Asking every person in the room takes longer as the room fills (linear). Introducing every person to every other person explodes as the room fills (quadratic).

## The Core Idea

We do not count exact steps or seconds; those change with the computer. We describe the shape of growth, using `n` for the size of the input.

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

Read the last row: at 1,000 items, quadratic work is a million steps while logarithmic work is ten.

Drag `n` and watch the bars. They share one scale, so the slow shapes take over quickly. The time column assumes one step takes a microsecond.

```demo
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
* O(n)
- O(n²)
Why: The loop runs n times and each hash lookup is O(1) on average, so the total is n × 1 = O(n).
```

## Two Rules That Simplify Everything

1. **Drop constants.** Two separate loops over the input is `2n` steps, still `O(n)`. Big O is about shape, not exact count.
2. **Keep the biggest term.** `n² + n` is `O(n²)`, because at large sizes the `n²` part dwarfs the rest.

```quiz
Q: A function has one loop over the input, followed by a nested loop over the input. What is its Big O?
- O(n)
- O(n + n²), and you cannot simplify it
* O(n²)
Why: The total is n + n² steps. Keep the biggest term: n² dominates, so it is O(n²).
```

> **Watch out:** Hidden loops count. `array.includes(x)`, `list.index(x)` and slicing a string all scan. A loop that calls `includes` is a nested loop in disguise: `O(n²)`.

## Time And Space

Big O describes memory too. Making a copy of the input costs `O(n)` extra space; using a few variables costs `O(1)`. Interviewers usually ask for both: "time `O(n)`, space `O(1)`".

> **Interview tip:** State the brute-force Big O first, then improve it. "Checking every pair is `O(n²)`; with a hash set I can do it in `O(n)` time and `O(n)` space" shows exactly the reasoning interviewers look for.

## What To Remember

- Big O describes how work grows, not exact time.
- Find the shape: one step, halving, one loop, sorting, or nested loops.
- Drop constants and keep the biggest term.
- Watch for library calls that hide a loop.

## Practice Prompt

You have 100 names. How many checks does it take to print each name once? To compare every name with every other name? What about 1,000 names?

## Sources Checked

- [OpenDSA: Introduction to Data Structures and Algorithms](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20221201150129/html/IntroDSA.html)
- [CP-Algorithms](https://cp-algorithms.com/)
- [Open Data Structures](https://opendatastructures.org/)
