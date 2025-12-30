# Control Flow

## If / Else

Conditional execution works as expected:

```javascript
let x = 10
if (x > 5) {
    print("Greater than 5")
} else {
    print("Smaller or equal to 5")
}
```

## For Loops

Iterate over arrays using the `for ... in` syntax:

```javascript
let numbers = [1, 2, 3, 4]

for (n in numbers) {
    print(n * 2)
}
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
