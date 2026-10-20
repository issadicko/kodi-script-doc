/**
 * Scripts offered in the Playground picker. `variables` is the text of the Variables pane
 * (a JSON object injected as script variables); `maxOperations` and `timeoutMs` override the
 * settings when the example is loaded.
 */
export interface PlaygroundExample {
  id: string;
  title: string;
  code: string;
  variables?: string;
  maxOperations?: number;
  timeoutMs?: number;
}

export const examples: PlaygroundExample[] = [
  {
    id: 'templates',
    title: 'String templates',
    code: `// \${expression} works in double quotes, single quotes, and backticks
let name = "KodiScript"
let version = 0.4
print("Hello from \${name} v\${version}!")

// Any expression fits in a template, and calls chain as methods
let cart = [19.5, 5.5, 12]
print("Total: \${cart.sum()} for \${cart.size()} items")
print("  trim me  ".trim().toUpperCase())

// Concatenating with + converts the other side to text
print("n=" + 5)
print('Price: \\$100')

// The last expression is the result
"\${name}".toLowerCase()
`,
  },
  {
    id: 'variables',
    title: 'Variables from the Variables pane',
    variables: `{
  "today": "2026-10-20",
  "customer": { "name": "Awa", "tier": "gold", "birthDate": "1994-03-12" },
  "items": [
    { "name": "Notebook", "price": 4.5, "qty": 10 },
    { "name": "Pen", "price": 1.2, "qty": 25 },
    { "name": "Stapler", "price": 12, "qty": 2 }
  ],
  "taxRate": 0.18
}`,
    code: `// Each key of the Variables pane is a variable of the script
let subtotal = items.map(fn(i){ i.price * i.qty }).sum()
let discount = customer.tier == "gold" ? 0.1 : 0
let total = round(subtotal * (1 - discount) * (1 + taxRate) * 100) / 100

print("\${customer.name} is \${age(customer.birthDate, today)} years old")
print("Subtotal: \${subtotal}")
print("Total with tax: \${total}")

// A top-level return becomes the Result
return {customer: customer.name, lines: size(items), total: total}
`,
  },
  {
    id: 'dates',
    title: 'Dates',
    code: `// Dates are ISO text or milliseconds, and every computation is UTC
let birth = "1994-03-12"
let today = "2026-10-20"

print("Age: \${age(birth, today)}")
print(formatDate(today, "DD/MM/YYYY HH:mm"))
print(toISO(parseDate("19/10/2026", "DD/MM/YYYY")))

// A day missing from the target month becomes its last day
print(toISO(addMonths("2026-01-31", 1)))
print(formatDate(addMonths(today, 3), "DD/MM/YYYY"))
print(toISO(endOfMonth("2024-02-10")))

print(diffDays(today, "2026-12-25"))
print(isWeekend("2026-10-17"))
print(isDate("2026-02-29"))

// Date functions work as methods too
print(today.addDays(1).formatDate("DD/MM"))
`,
  },
  {
    id: 'grouping',
    title: 'Grouping and aggregation',
    code: `let sales = [
  {region: "Centre", product: "Pass", amount: 500},
  {region: "North", product: "Data", amount: 2100},
  {region: "Centre", product: "Data", amount: 1000},
  {region: "South", product: "Pass", amount: null},
]

let byRegion = groupBy(sales, "region")
for (region in keys(byRegion)) {
    let total = byRegion[region].sumBy("amount")   // null amounts are skipped
    print("\${region}: \${total}")
}

print(countBy(sales, "product"))
let best = maxBy(sales, "amount")
print("Best sale: \${best.region} (\${best.amount})")

// The key can also be a function fn(item, index)
let [large, small] = sales.partition(fn(s) { (s.amount ?: 0) >= 1000 })
print("large: \${size(large)}, small: \${size(small)}")
`,
  },
  {
    id: 'try-catch',
    title: 'Error handling (try / catch)',
    code: `fn safeDiv(p, q) {
    try {
        return p / q
    } catch (e) {
        return -1
    }
}

print(safeDiv(10, 2))
print(safeDiv(10, 0))   // division by zero is caught

let status = "none"
try {
    let bad = undefinedThing
} catch (e) {
    status = "caught"
}
print(status)

// An error that nothing catches stops the script: uncomment to see where
// print(10 % 0)
`,
  },
  {
    id: 'higher-order',
    title: 'Higher-order functions',
    code: `let nums = [5, 3, 8, 1, 3]

print(nums.unique().sort())               // [1, 3, 5, 8]
print(nums.filter(fn(x){ x > 3 }).sum())  // 13
print(nums.map(fn(x){ x * x }))
print(reduce(nums, fn(acc, x){ acc + x }, 0))
print(find(nums, fn(x){ x > 4 }))
print(flatMap([1, 2], fn(x){ [x, x * 10] }))
`,
  },
  {
    id: 'closures',
    title: 'Closures and recursion',
    code: `fn fib(n) {
    if (n < 2) { return n }
    return fib(n - 1) + fib(n - 2)
}
print(range(10).map(fn(i){ fib(i) }))

let makeAdder = fn(x) {
    return fn(y) { x + y }
}
let addTwo = makeAdder(2)
print(addTwo(3))

// The last expression is the script's result
addTwo(40)
`,
  },
  {
    id: 'null-safety',
    title: 'Null-safety and destructuring',
    code: `let user = {name: "Alice", address: null}

print(user?.name)               // Alice
print(user.address?.city)       // null, no error
print(user.address?.city ?: "unknown")
print(false ?: "kept")          // ?: only replaces null

let [first, second] = [100, 200]
let {name} = user
print("\${name}: \${first + second}")
`,
  },
  {
    id: 'limits',
    title: 'Runaway script (stopped by limits)',
    maxOperations: 10000,
    code: `// This example sets the operation limit to 10,000 in the Settings tab
let n = 0
while (true) {
    n++
}
`,
  },
];
