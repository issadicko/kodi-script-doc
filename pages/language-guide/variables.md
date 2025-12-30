# Variables & Data Types

## Variables

Variables are declared using `let`. They are dynamically typed.

```javascript
let x = 10
let name = "Kodi"
let isActive = true
```

## Data Types

### Primitives
- **Number**: 64-bit floating point (e.g., `10`, `3.14`).
- **String**: Double-quoted text (e.g., `"Hello"`).
- **Boolean**: `true` or `false`.
- **Null**: `null`.

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
Lists of values. Elements can be of mixed types.

```javascript
let list = [1, "two", true]
print(list[0]) // 1
```

### Objects
Key-value pairs (Hash maps).

```javascript
let person = {
    name: "Alice",
    age: 30
}
print(person["name"])
print(person.age)
```
