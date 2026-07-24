# Control Flow

## If / Else / Else If

Conditional execution works as expected, and conditions can be chained with `else if`:

```javascript
let score = 75

if (score >= 90) {
    print("A")
} else if (score >= 70) {
    print("B")
} else {
    print("C")
}
// Output: B
```

For simple value selection, the [ternary operator](/language-guide/operators#ternary-operator) is often more concise.

## For Loops

Iterate over arrays using the `for ... in` syntax:

```javascript
let numbers = [1, 2, 3, 4]

for (n in numbers) {
    print(n * 2)
}
```

## While Loops

Execute a block of code repeatedly while a condition is true:

```javascript
let i = 0
let sum = 0
while (i < 5) {
    sum += i
    i++
}
print(sum)  // Output: 10
```

> **Safety Note:** While loops are protected by the operation limit. If a loop runs for too many iterations, execution will be terminated to prevent infinite loops. See [Security](/language-guide/security) for more details.

## Break & Continue

> **Availability:** `break` is supported in every SDK; `continue` is currently implemented in the Go, Kotlin, and TypeScript SDKs.

Inside `for` and `while` loops, `break` exits the loop immediately and `continue` skips to the next iteration:

```javascript
let total = 0
for (i in [1, 2, 3, 4, 5]) {
    if (i == 3) { continue }   // skip 3
    if (i == 5) { break }      // stop before 5
    total += i
}
print(total)   // Output: 3  (1 + 2)
```

## Return Statements

Functions can return values using `return`. If no return statement is found, the result of the last expression is returned (implicit return), but explicit `return` is supported for early exit.

```javascript
let check = fn(x) {
    if (x < 0) {
        return "negative"
    }
    return "positive"
}
```

## Try / Catch <span style={{fontSize: '13px', fontWeight: 'normal', opacity: 0.6}}>Go · Kotlin · TypeScript</span>

Wrap code that might fail in a `try` block and handle the failure in `catch`. The caught error is bound to the name you provide in parentheses:

```javascript
fn safeDiv(p, q) {
    try {
        return p / q
    } catch (e) {
        return -1
    }
}

print(safeDiv(10, 2))   // 5
print(safeDiv(10, 0))   // -1  (division by zero was caught)
```

`try`/`catch` also catches runtime errors such as accessing an undefined variable:

```javascript
let captured = "none"
try {
    let bad = undefinedThing
} catch (e) {
    captured = "caught"
}
print(captured)   // caught
```

> **Portability note:** The error value bound in `catch` carries a human-readable message. On the Go and Kotlin engines the message includes the source position (`line X, col Y: ...`); the TypeScript engine reports the same message text without the position prefix. If you need identical output across every engine, avoid printing the raw error and emit a fixed marker instead (as shown above).
