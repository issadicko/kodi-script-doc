# Functions

Functions are first-class citizens in KodiScript. Use the `fn` keyword to define them.

## Function Expressions

Assign an anonymous function to a variable with `let`:

```javascript
let add = fn(x, y) {
    return x + y
}
```

## Named Function Declarations
You can also declare a named function directly. This is equivalent to the `let` form but reads more naturally, and named functions can be referenced before they appear (handy for recursion):

```javascript
fn fib(n) {
    if (n < 2) { return n }
    return fib(n - 1) + fib(n - 2)
}

print(fib(10))   // 55
```

## Closures

Functions capture variables from their surrounding scope:

```javascript
let makeAdder = fn(x) {
    return fn(y) {
        return x + y
    }
}

let addTwo = makeAdder(2)
print(addTwo(3)) // Output: 5
```

## Higher Order Functions

You can pass functions as arguments:

```javascript
let apply = fn(f, val) {
    return f(val)
}

let double = fn(x) { x * 2 }

print(apply(double, 10)) // Output: 20
```

KodiScript ships with a full set of built-in higher-order helpers for collections — `map`, `filter`, `reduce`, `find`, `findIndex`, `some`, `every`, and `flatMap`:

```javascript
let nums = [1, 2, 3, 4, 5]

print(nums.map(fn(x){ x * 2 }))         // [2, 4, 6, 8, 10]
print(nums.filter(fn(x){ x % 2 == 0 })) // [2, 4]
print(reduce(nums, fn(acc, x){ acc + x }, 0))  // 15
print(find(nums, fn(x){ x > 3 }))       // 4
print(some(nums, fn(x){ x > 4 }))       // true
print(every(nums, fn(x){ x > 0 }))      // true
print(flatMap([1, 2], fn(x){ [x, x * 10] }))   // [1, 10, 2, 20]
```

## Method-Call Syntax
Any built-in function whose first argument is the "receiver" can be called with method syntax, and calls can be chained. `value.method(args)` is equivalent to `method(value, args)`:

```javascript
print("  Hello World  ".trim().toUpperCase())   // HELLO WORLD
print([3, 1, 2].sort().join(","))               // 1,2,3
print([1, 2, 3].map(fn(x){ x * 2 }))            // [2, 4, 6]
print([1, 1, 2, 3].unique().sum())              // 6
```

This works for the full [native function](/language-guide/native-functions) library — string helpers, array helpers, and the higher-order functions above.

## Spread Arguments
Use the [spread operator](/language-guide/operators#spread) to expand an array into a function's argument list:

```javascript
fn add3(x, y, z) { return x + y + z }

let values = [10, 20, 30]
print(add3(...values))   // 60
```
