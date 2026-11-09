---
description: Explain the Big O of a piece of code and the line that causes it
argument-hint: <file path, function name, or pasted code>
---

Explain the time and space cost of: $ARGUMENTS

If it names a file or function, read it first. Then:

1. State the time complexity and the space complexity in Big O.
2. Point to the exact line or loop that sets the cost, and say why in plain words (for example, "this `includes` scans the array inside a loop, so the work is n × n").
3. If a cheaper version exists, show the smallest change that gets it (for example, a `Set` instead of an array lookup) and its new cost.
4. Link the matching lesson for further reading, using the URL exactly as `list_lessons` returns it.

Keep it short. Do not rewrite code that is already optimal.
