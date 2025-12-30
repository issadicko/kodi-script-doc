# Go SDK Reference

## Installation

```bash
go get github.com/kodi-script/kodi-go
```

## Usage

### Simple Execution
```go
result := kodi.Run("1 + 2", nil)
```

### Injecting Variables
You can pass a map of variables to the script context.

```go
vars := map[string]interface{}{
    "x": 10,
    "y": 20,
}
result := kodi.Run("x + y", vars)
fmt.Println(result.Value) // 30
```

### Extending with Native Functions
You can register custom Go functions to be callable from KodiScript.

```go
registry := natives.NewRegistry()
registry.Register("hello", func(args ...interface{}) (interface{}, error) {
    return "World", nil
})

interp := interpreter.NewWithEnv(nil)
interp.RegisterNatives(registry)
```
