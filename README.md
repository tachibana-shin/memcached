# Memcached Client

A TypeScript-based Memcached client that provides a convenient interface for interacting with a Memcached server. This client supports various operations such as getting, setting, deleting, incrementing, and decrementing cache values.

## Installation

To install the package, use npm:

```bash
deno add @tachibana-shin/memcached
# or Bun
bun add @tachibana-shin/memcached
```

## Usage

Importing the Client

```typescript
import { Memcached } from "@tachibana-shin/memcached"
```

Creating an Instance
Create an instance of the Memcached class by providing the necessary options:

```typescript
const memcached = new Memcached({
  server: "localhost:11211",
  lifetime: 3600,
  noDelay: true,
})
```

### Methods

#### `get`

Retrieves the value associated with the specified key from the cache.

```typescript
const value = await memcached.get("myKey")
console.log(value)
```

### `put`

Adds a new key-value pair to the cache.

```typescript
await memcached.put("myKey", "myValue", 3600)
```

### `forever`

Sets a key-value pair in the cache indefinitely.

```typescript
await memcached.forever("myKey", "myValue")
```

### `delete`

Deletes the value associated with the specified key from the cache.

```typescript
await memcached.delete("myKey")
```

### `forget`

Deletes the value associated with the specified key from the cache without any side effects.

```typescript
await memcached.forget("myKey")
```

### `add`

Adds a new key-value pair to the cache if the key does not already exist.

```typescript
await memcached.add("myKey", "myValue", 3600)
```

### `increment`

Increments the value associated with the specified key in the cache by the given amount.

```typescript
await memcached.increment("myKey", 1)
```

### `decrement`

Decrements the value associated with the specified key in the cache by the given amount.

```typescript
await memcached.decrement("myKey", 1)
```

### `remember`

Asynchronously retrieves the value associated with the specified key from the cache. If the value is not found, it is fetched using the provided function and stored in the cache.

```typescript
const value = await memcached.remember("myKey", 3600, async () => {
  return "myValue"
})
```

### `rememberForever`

Retrieves or stores the value associated with the specified key in the cache indefinitely.

```typescript
const value = await memcached.rememberForever("myKey", async () => {
  return "myValue"
})
```

### `pull`

Retrieves the value associated with the specified key from the cache and then deletes the item.

```typescript
const value = await memcached.pull("myKey", "defaultValue")
console.log(value)
```

### `replace`

Replaces the value associated with the specified key in the cache.

```typescript
await memcached.replace("myKey", "newValue", 3600)
```

### `append`

Appends a new value to the existing value associated with the specified key in the cache.

```typescript
await memcached.append("myKey", "appendedValue", 3600)
```

### `prepend`

Prepends a new value to the existing value associated with the specified key in the cache.

```typescript
await memcached.prepend("myKey", "prependedValue", 3600)
```

### `flush`

Flushes all items from the cache.

```typescript
await memcached.flush()
```

### `incLifetime`

Increments the lifetime of the value associated with the specified key in the cache.

```typescript
await memcached.incLifetime("myKey", 3600)
```

### `cmd`

Executes a custom command on the Memcached server.

```typescript
const result = await memcached.cmd("version")
console.log(result)
```

### `gets`

Retrieves multiple values associated with the specified keys from the cache.

```typescript
const values = await memcached.gets(["key1", "key2"])
console.log(values)
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Acknowledgements

This package is built on top of the @tachibana-shin/memcached library and provides a higher-level abstraction for interacting with Memcached servers.
