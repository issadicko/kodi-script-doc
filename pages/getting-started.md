# Getting Started

## Quick Start

### Go SDK

```bash
go get github.com/kodi-script/kodi-go
```

```go
package main

import (
    "fmt"
    kodi "github.com/kodi-script/kodi-go"
)

func main() {
    code := `print("Hello from Go!")`
    kodi.Run(code, nil)
}
```

### Kotlin SDK

Add the dependency to your `build.gradle.kts`:

```kotlin
implementation("com.kodi.script:kodi-kotlin:1.0.0")
```

```kotlin
import com.kodi.script.KodiScript

fun main() {
    val code = """print("Hello from Kotlin!")"""
    KodiScript.run(code, emptyMap())
}
```
