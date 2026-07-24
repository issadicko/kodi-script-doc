# Kotlin SDK Reference

[![Maven Central](https://img.shields.io/maven-central/v/io.github.issadicko/kodi-script)](https://central.sonatype.com/artifact/io.github.issadicko/kodi-script)

## Installation

### Gradle (Kotlin DSL)
```kotlin
dependencies {
    implementation("io.github.issadicko:kodi-script:0.1.1")
}
```

### Gradle (Groovy)
```groovy
implementation 'io.github.issadicko:kodi-script:0.1.1'
```

### Maven
```xml
<dependency>
    <groupId>io.github.issadicko</groupId>
    <artifactId>kodi-script</artifactId>
    <version>0.1.1</version>
</dependency>
```

## Quick Start

```kotlin
import com.kodi.script.KodiScript

val result = KodiScript.run("""
    let name = "World"
    print("Hello " + name)
""")

result.output.forEach { println(it) }
```

## Variable Injection

```kotlin
val variables = mapOf(
    "user" to mapOf(
        "name" to "Alice",
        "role" to "admin"
    )
)

val result = KodiScript.run("""
    let greeting = "Hello " + user.name
    let status = user?.active ?: "offline"
    print(greeting)
""", variables)
```

## Builder Pattern

```kotlin
val result = KodiScript.builder("""
    let greeting = customGreet("World")
    print(greeting)
""")
    .withVariable("version", 1.0)
    .registerFunction("customGreet") { args ->
        "Hello, ${args[0]}!"
    }
    .execute()
```

## Spring Boot Integration

```kotlin
@Service
class ScriptService {
    fun executeUserScript(script: String, context: Map<String, Any?>): ScriptResult {
        return KodiScript.builder(script)
            .withVariables(context)
            .execute()
    }
}

@RestController
@RequestMapping("/api/scripts")
class ScriptController(private val scriptService: ScriptService) {
    @PostMapping("/execute")
    fun execute(@RequestBody request: ScriptRequest): ScriptResult {
        return scriptService.executeUserScript(request.script, request.context)
    }
}
```

## Result & Error Handling

`execute()` returns a `ScriptResult`. Branch on the typed `errorKind` rather than parsing error strings:

```kotlin
data class ScriptResult(
    val value: Any?,
    val output: List<String>,
    val errors: List<String>,
    val errorKind: ErrorKind   // NONE on success
)

enum class ErrorKind { NONE, PARSE, RUNTIME, TIMEOUT, MAX_OPERATIONS }
```

```kotlin
val result = KodiScript.builder(script)
    .withMaxOperations(1000)
    .execute()

when (result.errorKind) {
    ErrorKind.NONE -> useResult(result.value, result.output)
    ErrorKind.PARSE -> /* syntax error */ Unit
    ErrorKind.RUNTIME -> /* bad operation, undefined variable, recursion, ... */ Unit
    ErrorKind.TIMEOUT -> /* exceeded withTimeout */ Unit
    ErrorKind.MAX_OPERATIONS -> /* exceeded withMaxOperations */ Unit
}
```

## Streaming & Capturing Output

By default `print()` writes to stdout and is also captured in `result.output`. Use `withSilentPrint` to suppress the console write, or `withOutput` to route each line to a callback:

```kotlin
val lines = mutableListOf<String>()
KodiScript.builder("""print("a") print("b")""")
    .withOutput { line -> lines.add(line) }   // lines == ["a", "b"]
    .execute()

// Capture only, no console output:
val result = KodiScript.builder(script)
    .withSilentPrint(true)
    .execute()
```

## Links

- [GitHub Repository](https://github.com/issadicko/kodi-script-kotlin)
- [Maven Central](https://central.sonatype.com/artifact/io.github.issadicko/kodi-script)
