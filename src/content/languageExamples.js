export const arrayLanguageExamples = [
  {
    id: 'javascript',
    language: 'JavaScript',
    dataStructure: 'Array',
    runtime: 'Runs on a JavaScript engine such as V8, SpiderMonkey, or JavaScriptCore.',
    memoryNote:
      'A JavaScript Array is a high-level object. Engines optimize simple numeric arrays, but the language lets arrays grow and hold mixed value types.',
    code: `const numbers = [10, 20, 30];

numbers.push(40);
console.log(numbers[0]);`,
    sourceName: 'MDN Array',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  },
  {
    id: 'python',
    language: 'Python',
    dataStructure: 'list',
    runtime: 'Usually interpreted by CPython, though other Python implementations exist.',
    memoryNote:
      'A Python list is a dynamic array of references. The list stores pointers to objects, not raw integers directly inside the list slots.',
    code: `numbers = [10, 20, 30]

numbers.append(40)
print(numbers[0])`,
    sourceName: 'Python Data Structures',
    sourceUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
  },
  {
    id: 'c',
    language: 'C',
    dataStructure: 'array',
    runtime: 'Compiled to machine code by a C compiler.',
    memoryNote:
      'A C array is close to raw contiguous memory. The compiler knows the element type and size, but C does not check indexes for you.',
    code: `int numbers[4] = {10, 20, 30, 40};

printf("%d\\n", numbers[0]);`,
    sourceName: 'cppreference C arrays',
    sourceUrl: 'https://en.cppreference.com/w/c/language/array',
  },
  {
    id: 'cpp',
    language: 'C++',
    dataStructure: 'std::vector',
    runtime: 'Compiled to machine code by a C++ compiler.',
    memoryNote:
      'A vector is a growable contiguous buffer. When capacity runs out, it allocates a larger buffer and moves or copies elements.',
    code: `std::vector<int> numbers = {10, 20, 30};

numbers.push_back(40);
std::cout << numbers[0] << "\\n";`,
    sourceName: 'cppreference std::vector',
    sourceUrl: 'https://en.cppreference.com/w/cpp/container/vector',
  },
  {
    id: 'java',
    language: 'Java',
    dataStructure: 'array',
    runtime: 'Compiled to bytecode and run by the JVM.',
    memoryNote:
      'A Java array has fixed length. The JVM manages the object in memory and checks array bounds at runtime.',
    code: `int[] numbers = {10, 20, 30, 40};

System.out.println(numbers[0]);`,
    sourceName: 'Oracle Arrays utility docs',
    sourceUrl: 'https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/util/Arrays.html',
  },
  {
    id: 'go',
    language: 'Go',
    dataStructure: 'slice',
    runtime: 'Compiled to machine code by the Go compiler.',
    memoryNote:
      'A Go slice is a small descriptor with a pointer, length, and capacity. It points into an underlying array.',
    code: `numbers := []int{10, 20, 30}

numbers = append(numbers, 40)
fmt.Println(numbers[0])`,
    sourceName: 'Go slices intro',
    sourceUrl: 'https://go.dev/blog/slices-intro',
  },
  {
    id: 'rust',
    language: 'Rust',
    dataStructure: 'Vec<T>',
    runtime: 'Compiled to machine code by rustc, usually through LLVM.',
    memoryNote:
      'A Vec owns a growable contiguous buffer. Rust tracks ownership so memory is released without a garbage collector.',
    code: `let mut numbers = vec![10, 20, 30];

numbers.push(40);
println!("{}", numbers[0]);`,
    sourceName: 'Rust Vec',
    sourceUrl: 'https://doc.rust-lang.org/std/vec/struct.Vec.html',
  },
  {
    id: 'csharp',
    language: 'C#',
    dataStructure: 'array',
    runtime: 'Compiled to Intermediate Language and run by the .NET runtime.',
    memoryNote:
      'A C# array has fixed length and is managed by the runtime. Bounds checks protect against invalid indexes.',
    code: `int[] numbers = {10, 20, 30, 40};

Console.WriteLine(numbers[0]);`,
    sourceName: 'Microsoft C# arrays',
    sourceUrl: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays',
  },
  {
    id: 'kotlin',
    language: 'Kotlin',
    dataStructure: 'Array',
    runtime: 'Usually compiled to JVM bytecode, with Kotlin/Native and Kotlin/JS also available.',
    memoryNote:
      'Kotlin arrays are fixed-size containers. On the JVM, they work closely with Java arrays.',
    code: `val numbers = arrayOf(10, 20, 30, 40)

println(numbers[0])`,
    sourceName: 'Kotlin arrays',
    sourceUrl: 'https://kotlinlang.org/docs/arrays.html',
  },
  {
    id: 'swift',
    language: 'Swift',
    dataStructure: 'Array',
    runtime: 'Compiled by the Swift compiler, commonly to native machine code.',
    memoryNote:
      'Swift Array is a generic collection. It behaves like a value type and uses copy-on-write optimization.',
    code: `var numbers = [10, 20, 30]

numbers.append(40)
print(numbers[0])`,
    sourceName: 'Swift collection types',
    sourceUrl: 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/collectiontypes/',
  },
];
