# Kotlin SDK Reference

## Installation

Gradle (Kotlin DSL):
```kotlin
implementation("com.kodi.script:kodi-kotlin:1.0.0")
```

## Usage

### Simple Execution
```kotlin
val result = KodiScript.run("1 + 2", emptyMap())
println(result.value) // 3.0
```

### Injecting Variables
```kotlin
val vars = mapOf("name" to "Kodi")
val result = KodiScript.run("print('Hello ' + name)", vars)
```

### Custom Natives
*Coming soon...*
