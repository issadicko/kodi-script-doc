---
title: PHP SDK
---

# PHP SDK

The PHP SDK for KodiScript provides a sandboxed scripting engine for PHP applications.

## Installation

```bash
composer require issadicko/kodi-script
```

## Quick Start

```php
use KodiScript\KodiScript;

// Simple evaluation
$result = KodiScript::eval('2 + 3 * 4');
echo $result; // 14

// With variables
$result = KodiScript::run('greeting + " " + name', [
    'greeting' => 'Hello',
    'name' => 'World',
]);
echo $result->value; // "Hello World"
```

## API Reference

### `KodiScript::run(source, variables?)`

Runs a script with optional variables and returns `ScriptResult`.

```php
$result = KodiScript::run('x + y', ['x' => 10, 'y' => 20]);
echo $result->value;    // 30
echo $result->output;   // Array of print() outputs
echo $result->errors;   // Array of error messages
```

### `KodiScript::eval(source, variables?)`

Evaluates a script and returns the result value directly. Throws on error.

```php
$value = KodiScript::eval('abs(-5) * 2');
echo $value; // 10
```

### `KodiScript::builder(source)`

Creates a builder for advanced configuration.

```php
$result = KodiScript::builder('greet("PHP")')
    ->withVariable('version', '8.2')
    ->registerFunction('greet', fn($name) => "Hello, $name!")
    ->withMaxOperations(1000)
    ->withTimeout(5000)  // 5 seconds
    ->execute();
```

## Builder Methods

| Method | Description |
|--------|-------------|
| `withVariable(name, value)` | Add a single variable |
| `withVariables(array)` | Add multiple variables |
| `registerFunction(name, fn)` | Register a custom function |
| `bind(name, object)` | Bind an object to the script |
| `withMaxOperations(n)` | Limit max operations (loop protection) |
| `withTimeout(ms)` | Set execution timeout in milliseconds |

## Custom Functions

Register PHP functions that can be called from scripts:

```php
$result = KodiScript::builder('
    let total = calculatePrice(10, 99.99, 15)
    print("Total: " + total)
')
    ->registerFunction('calculatePrice', function($qty, $price, $discount) {
        return $qty * $price * (1 - $discount / 100);
    })
    ->execute();
```

## Native Functions

The PHP SDK includes 50+ native functions:

| Category | Functions |
|----------|-----------|
| String | `toString`, `length`, `substring`, `toUpperCase`, `toLowerCase`, `trim`, `split`, `join`, `replace`, `contains`, `startsWith`, `endsWith`, `indexOf`, `repeat`, `padLeft`, `padRight` |
| Math | `abs`, `floor`, `ceil`, `round`, `min`, `max`, `pow`, `sqrt`, `sin`, `cos`, `tan`, `log`, `exp` |
| Array | `size`, `first`, `last`, `reverse`, `slice`, `sort`, `sortBy`, `filter`, `map`, `reduce`, `find`, `findIndex` |
| Type | `typeOf`, `isNull`, `isNumber`, `isString`, `isBool` |
| JSON | `jsonParse`, `jsonStringify` |
| Encoding | `base64Encode`, `base64Decode`, `urlEncode`, `urlDecode` |
| Crypto | `md5`, `sha1`, `sha256` |
| Date/Time | `now`, `date`, `time`, `datetime`, `timestamp`, `formatDate`, `year`, `month`, `day`, `hour`, `minute`, `second` |

## Error Handling

```php
$result = KodiScript::run('undefined_variable');

if ($result->hasErrors()) {
    foreach ($result->errors as $error) {
        echo "Error: $error\n";
    }
}
```

## Requirements

- PHP 8.1+
