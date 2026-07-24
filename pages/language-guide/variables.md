# Variables & Data Types

## Variables

Variables are declared using `let`. They are dynamically typed.

```javascript
let x = 10
let name = "Kodi"
let isActive = true
```

Reassign a variable with `=`, or update it in place with a [compound assignment operator](/language-guide/operators#compound-assignment) such as `+=`:

```javascript
let count = 0
count = 5
count += 1   // 6
```

## Data Types

### Primitives
- **Number**: 64-bit floating point (e.g., `10`, `3.14`).
- **String**: Text delimited by double quotes, single quotes, or backticks (e.g., `"Hello"`).
- **Boolean**: `true` or `false`.
- **Null**: `null`.

### Number Formatting

Numbers are stored as 64-bit floats. In the Go, Kotlin, and TypeScript SDKs, whole numbers print **without** a trailing `.0` — part of a canonical output format that makes the same script print byte-for-byte identically across those three engines:

```javascript
print(42)       // 42     (not 42.0)
print(3.5)      // 3.5
print(10 / 4)   // 2.5
print(10 / 2)   // 5      (not 5.0)
```

### String Literals

Strings can be written with three interchangeable delimiters — pick whichever avoids escaping:

```javascript
let a = "double quotes"
let b = 'single quotes'
let c = `backticks`     // Go, Kotlin, and TypeScript SDKs
```

### String Templates

Strings support interpolation using `${expression}` syntax.

```javascript
let name = "World"
print("Hello ${name}!")   // Output: Hello World!

let a = 10
let b = 20
print("Sum: ${a + b}")    // Output: Sum: 30

// Escaping
print("Price: \$100")     // Output: Price: $100
```

### Arrays
Lists of values. Elements can be of mixed types. Arrays print as comma-separated values inside brackets:

```javascript
let list = [1, "two", true]
print(list[0])   // 1
print([1, 2, 3]) // [1, 2, 3]
```

### Objects
Key-value pairs (hash maps). When printed, object keys are sorted alphabetically for stable, reproducible output:

```javascript
let person = {
    name: "Alice",
    age: 30
}
print(person["name"])
print(person.age)

print({b: 2, a: 1})   // {a: 1, b: 2}
```

## Destructuring <span style={{fontSize: '13px', fontWeight: 'normal', opacity: 0.6}}>Go · Kotlin · TypeScript</span>

Unpack arrays and objects into individual variables in a single `let` statement.

**Array destructuring** binds by position:

```javascript
let [first, second] = [100, 200]
print(first)    // 100
print(second)   // 200
```

**Object destructuring** binds by key name:

```javascript
let {x, y} = {x: 7, y: 3}
print(x * y)   // 21
```

## Comments

Both line and block comments are supported:

```javascript
// this is a line comment

let result = 5 /* inline block comment */ + 5
print(result)   // 10

/*
  Block comments
  can span multiple lines.
*/
```
