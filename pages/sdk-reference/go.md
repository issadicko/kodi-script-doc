# Go SDK Reference

[![Go Reference](https://pkg.go.dev/badge/github.com/issadicko/kodi-script-go.svg)](https://pkg.go.dev/github.com/issadicko/kodi-script-go)

## Installation

```bash
go get github.com/issadicko/kodi-script-go@v0.1.1
```

## Quick Start

```go
package main

import (
    "fmt"
    kodi "github.com/issadicko/kodi-script-go"
)

func main() {
    result := kodi.Run(`
        let name = "World"
        print("Hello " + name)
    `, nil)

    for _, line := range result.Output {
        fmt.Println(line)
    }
}
```

## Variable Injection

```go
vars := map[string]interface{}{
    "user": map[string]interface{}{
        "name": "Alice",
        "role": "admin",
    },
}

result := kodi.Run(`
    let greeting = "Hello " + user.name
    let status = user?.active ?: "offline"
    print(greeting)
`, vars)
```

## Custom Functions

```go
script := kodi.New(`
    let result = myCustomFunc("hello")
    print(result)
`)

script.RegisterFunction("myCustomFunc", func(args ...interface{}) (interface{}, error) {
    return strings.ToUpper(args[0].(string)), nil
})

result := script.Execute()
```

## Result & Error Handling

`Execute()` returns a `*Result`. Branch on the typed `Kind` field instead of parsing error strings:

```go
type Result struct {
    Value  interface{}
    Output []string
    Errors []string
    Err    error     // first underlying error (nil on success)
    Kind   ErrorKind // ErrorKindNone on success
}
```

```go
result := kodi.New(script).
    WithMaxOperations(1000).
    Execute()

switch result.Kind {
case kodi.ErrorKindNone:
    // success — use result.Value / result.Output
case kodi.ErrorKindParse:
    // syntax error
case kodi.ErrorKindRuntime:
    // bad operation, undefined variable, recursion guard, ...
case kodi.ErrorKindTimeout:
    // exceeded WithTimeout
case kodi.ErrorKindMaxOperations:
    // exceeded WithMaxOperations
}
```

You can also match the underlying error with `errors.Is`:

```go
if errors.Is(result.Err, kodi.ErrTimeout) {
    // ...
}
```

## Streaming Output

Route each `print()` line to a callback as it happens with `WithOutput` (output is still captured in `result.Output`):

```go
result := kodi.New(`print("a") print("b")`).
    WithOutput(func(line string) {
        fmt.Println("got:", line)
    }).
    Execute()
```

## Object Binding

Expose an entire Go object to scripts with `Bind`, so their methods and fields are callable directly:

```go
script := kodi.New(`print(service.Greet("World"))`)
script.Bind("service", &Greeter{})
result := script.Execute()
```

See [Extensibility](/language-guide/extensibility) for the full pattern.

## Links

- [GitHub Repository](https://github.com/issadicko/kodi-script-go)
- [pkg.go.dev](https://pkg.go.dev/github.com/issadicko/kodi-script-go)
