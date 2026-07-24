# Operators

KodiScript supports a familiar set of operators for arithmetic, comparison, logic, assignment, and null-safety.

> **SDK availability:** Arithmetic, comparison, logical, and null-safety operators are available in every SDK. **Compound assignment (`+=`, …), increment/decrement (`++`/`--`), the ternary operator, and spread (`...`)** are currently implemented in the **Go, Kotlin, and TypeScript** SDKs.

## Arithmetic

| Operator | Description | Example | Result |
|----------|-------------|---------|--------|
| `+` | Addition (or string concatenation) | `2 + 3` | `5` |
| `-` | Subtraction | `5 - 2` | `3` |
| `*` | Multiplication | `4 * 3` | `12` |
| `/` | Division | `10 / 4` | `2.5` |
| `%` | Modulo (remainder) | `10 % 3` | `1` |

```javascript
print(10 + 2 * 3 - 4 / 2)   // 14  (standard precedence)
print("Hello " + "World")   // Hello World
```

> **Division by zero** raises a runtime error (`division by zero` / `modulo by zero`) rather than returning `Infinity` or `NaN`, in the Go, Kotlin, and TypeScript SDKs.

## Comparison

| Operator | Description |
|----------|-------------|
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |

```javascript
print(5 > 3)    // true
print(5 == 5)   // true
print(5 != 3)   // true
```

## Logical

| Operator | Description |
|----------|-------------|
| `&&` | Logical AND |
| `\|\|` | Logical OR |
| `!` | Logical NOT |

```javascript
print(true && false)   // false
print(true || false)   // true
print(!true)           // false
```

Only `null` and `false` are falsy. Every other value — including `0`, `""`, and empty collections — is truthy.

## Compound Assignment

Update a variable in place. `x += y` is shorthand for `x = x + y`.

| Operator | Equivalent |
|----------|------------|
| `+=` | `x = x + y` |
| `-=` | `x = x - y` |
| `*=` | `x = x * y` |
| `/=` | `x = x / y` |

```javascript
let x = 10
x += 5    // 15
x -= 2    // 13
x *= 2    // 26
x /= 13   // 2
print(x)  // 2
```

## Increment & Decrement

```javascript
let n = 5
n++       // 6
n++       // 7
n--       // 6
print(n)  // 6
```

These are commonly used with `while` loops:

```javascript
let counter = 0
while (true) {
    counter++
    if (counter >= 4) { break }
}
print(counter)  // 4
```

## Ternary Operator

A concise `condition ? valueIfTrue : valueIfFalse` expression. Ternaries are right-associative, so they nest naturally into if / else-if chains:

```javascript
fn classify(n) {
    return n > 0 ? "positive" : n < 0 ? "negative" : "zero"
}

print(classify(5))   // positive
print(classify(-3))  // negative
print(classify(0))   // zero
```

## Null-Safety

KodiScript has first-class support for working with values that may be `null`.

### Optional Chaining `?.`

Safely access a property. If the receiver is `null`, the whole expression evaluates to `null` instead of raising an error:

```javascript
let user = {status: "online"}
print(user?.status)    // online

let missing = null
print(missing?.status) // null  (no error)
```

### Null-Coalescing `?:`

Provide a fallback when the left-hand side is `null`:

```javascript
let missing = null
print(missing ?: "default")   // default

let name = "Kodi"
print(name ?: "anonymous")    // Kodi
```

The two combine cleanly for defaulting nested lookups:

```javascript
let status = user?.active ?: "offline"
```

## Spread

Expand an array (with `...`) into another array literal or into a function call's arguments.

```javascript
let a = [1, 2]
let b = [3, 4]
print([...a, ...b, 5])   // [1, 2, 3, 4, 5]

fn add3(x, y, z) { return x + y + z }
print(add3(...[10, 20, 30]))   // 60
```

See [Variables](/language-guide/variables#destructuring) for the inverse operation — destructuring.
