# Language Comparison Guide

The platform teaches core CS concepts first. Language syntax comes second.

## Current Language Set

For now, use these 10 languages:

1. JavaScript
2. Python
3. C
4. C++
5. Java
6. Go
7. Rust
8. C#
9. Kotlin
10. Swift

## How To Explain A Concept

Use this order:

1. **Core idea:** The language-neutral concept.
2. **Memory idea:** What RAM stores and why layout matters.
3. **Language view:** How each language lets you create or use the structure.
4. **Runtime view:** What compiler, interpreter, VM, garbage collector, or ownership system may do.
5. **Tradeoff:** What becomes easy or expensive.

## Arrays Example

Core idea:

> An array-like structure stores ordered values and lets you access values by index.

Memory idea:

> Classic arrays store same-sized values next to each other in memory. Dynamic arrays use extra capacity and sometimes copy values into a larger memory block.

Language view:

- C has fixed arrays close to raw memory.
- C++ usually uses `std::vector` for dynamic arrays.
- Java has fixed arrays and `ArrayList` for dynamic arrays.
- Python lists and JavaScript arrays are high-level dynamic containers.
- Go slices point into backing arrays.
- Rust `Vec<T>` owns a growable buffer.

Runtime view:

- C, C++, Go, Rust, and Swift commonly compile to native machine code.
- Java, Kotlin, and C# usually compile to bytecode or intermediate language first, then run on a VM/runtime.
- Python and JavaScript usually run through an interpreter or JIT-enabled runtime.

Beginner explanation:

> Syntax is what the programmer writes. Runtime behavior is what the language system does while the program runs. Hardware behavior is what CPU and RAM do underneath.

## How To Add Language Examples

Language examples live in:

```text
src/content/languageExamples.js
```

Each lesson can reference examples from the lesson registry:

```javascript
{
  id: 'arrays-and-strings',
  title: 'Arrays and Strings',
  languageExamples: arrayLanguageExamples,
}
```

Each language example should include:

```javascript
{
  id: 'python',
  language: 'Python',
  runtime: 'Interpreted by CPython or another Python implementation',
  dataStructure: 'list',
  memoryNote: 'Python lists are dynamic arrays of references.',
  code: `numbers = [10, 20, 30]`,
}
```

## Source Rules

Use official documentation first:

- MDN for JavaScript
- Python docs for Python
- cppreference for C and C++
- Oracle docs for Java
- Go docs and Go blog for Go
- Rust docs for Rust
- Microsoft Learn for C#
- Kotlin docs for Kotlin
- Swift docs for Swift

If official docs are too advanced, use them for facts and write our own beginner explanation.
