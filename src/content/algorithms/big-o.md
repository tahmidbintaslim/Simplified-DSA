# Big O

Big O is a way to talk about growth. It asks one question: as the input gets bigger, how quickly does the work grow?

We do not use Big O to count every tiny computer step. We use it to compare shapes of growth.

## Constant Time: O(1)

Constant time means the work does not grow with the input.

```javascript
const first = numbers[0];
```

Reading the first item takes one direct lookup whether the array has 5 items or 5 million.

## Linear Time: O(n)

Linear time means the work grows with the input.

```javascript
for (const number of numbers) {
  console.log(number);
}
```

If the array doubles in size, the loop does about twice as much work.

## Quadratic Time: O(n²)

Quadratic time often appears when every item is compared with every other item.

```javascript
for (const a of numbers) {
  for (const b of numbers) {
    console.log(a, b);
  }
}
```

If the input grows from 10 to 100, the pair checks grow from 100 to 10,000.

## Logarithmic Time: O(log n)

Logarithmic time means each step throws away a large share of what is left, usually half. Doubling the input adds only one more step.

Binary search on a sorted list of 1,000,000 values needs about 20 checks, because 2²⁰ is just over a million.

## Linearithmic Time: O(n log n)

`O(n log n)` appears when you do `O(n)` work on each of `log n` levels. Good general-purpose sorting algorithms, like merge sort, live here. It grows a little faster than `O(n)` and far slower than `O(n²)`.

## Why Beginners Need It

Big O helps you choose between approaches before writing too much code. Two solutions can both work on small examples, but one may fall apart when the input grows.

For now, focus on these questions:

- Do I touch one item?
- Do I scan every item?
- Do I scan every item for every other item?
- Do I make a new copy of the data?

## What To Remember

- `O(1)` means the work stays flat.
- `O(log n)` means each step cuts the problem down, so the work barely grows.
- `O(n)` means the work grows with the input.
- `O(n log n)` is the usual cost of a good sort.
- `O(n²)` means nested growth, often from nested loops.
- Big O ignores small constants so we can focus on the growth pattern.

## Practice Prompt

You have a list of 100 names. How many names do you inspect if you print every name once? What if you compare every name with every other name?

## Sources Checked

- [OpenDSA: Introduction to Data Structures and Algorithms](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20221201150129/html/IntroDSA.html)
- [CP-Algorithms](https://cp-algorithms.com/)
- [Open Data Structures](https://opendatastructures.org/)
