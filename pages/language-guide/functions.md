# Functions

Functions are first-class citizens in KodiScript. Use the `fn` keyword to define them.

## Syntax

```javascript
let add = fn(x, y) {
    return x + y
}
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
