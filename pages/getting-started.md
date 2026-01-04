# Getting Started

## Quick Start

### Go SDK

```bash
go get github.com/issadicko/kodi-script-go@v0.0.1
```

```go
package main

import (
    "fmt"
    kodi "github.com/issadicko/kodi-script-go"
)

func main() {
    result := kodi.Run(`print("Hello from Go!")`, nil)
    fmt.Println(result.Output[0])
}
```

### Kotlin SDK

Add the dependency to your `build.gradle.kts`:

```kotlin
implementation("io.github.issadicko:kodi-script:0.1.1")
```

```kotlin
import com.kodi.script.KodiScript

fun main() {
    val code = """print("Hello from Kotlin!")"""
    KodiScript.run(code, emptyMap())
}
```

### Dart SDK

Add the dependency to your `pubspec.yaml`:

```yaml
dependencies:
  kodi_script: ^0.2.0
```

```dart
import 'package:kodi_script/kodi_script.dart';

void main() {
  final code = 'print("Hello from Dart!")';
  KodiScript.eval(code);
}
```

### TypeScript SDK

```bash
npm install @issadicko/kodi-script
```

```typescript
import { KodiScript } from '@issadicko/kodi-script';

const result = KodiScript.run('print("Hello from TypeScript!")');
console.log(result.output[0]);
```
