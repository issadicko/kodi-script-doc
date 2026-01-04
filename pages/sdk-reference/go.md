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

## Links

- [GitHub Repository](https://github.com/issadicko/kodi-script-go)
- [pkg.go.dev](https://pkg.go.dev/github.com/issadicko/kodi-script-go)
