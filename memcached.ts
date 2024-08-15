import { MemcacheClient, MemcacheClientOptions } from "memcache-client"

type StoreParams = string | number | BufferSource | Record<string, unknown>
type CommonCommandOption = Readonly<{
  noreply?: boolean
}>
type StoreCommandOptions = CommonCommandOption & {
  ignoreNotStored?: boolean
} & Readonly<{
    compress?: boolean
  }>
type CasCommandOptions = CommonCommandOption &
  StoreCommandOptions &
  Readonly<{
    casUniq: number | string
  }>

type Split<
  S extends string,
  D extends string,
> = S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S]

export class Memcached<
  Types extends {
    [key: string]: StoreParams
  },
> {
  private readonly client: MemcacheClient

  constructor(
    options: MemcacheClientOptions,
    private readonly lifeTime: Partial<Record<keyof Types, number>> = {},
    private readonly scope?: string
  ) {
    this.client = new MemcacheClient(options)
  }

  private resolveKey(key: string | string[] | symbol | number): string {
    if (Array.isArray(key)) return key.join("/")

    return key?.toString()
  }

  /**
   * Retrieves the value associated with the specified key from the cache.
   *
   * @param key The key to retrieve the value for.
   * @returns A Promise that resolves to the retrieved value, or undefined if the key is not found in the cache.
   */
  public get<T extends keyof Types>(
    key: Split<Exclude<T, number | symbol>, "/"> | T,
  ): Promise<Awaited<Types[T]> | undefined> {
    return this.client
      .get<Awaited<Types[T]>>(this.resolveKey(key))
      .then((res) => res?.value) as Promise<Awaited<Types[T]> | undefined>
  }

  /**
   * Adds a new key-value pair to the cache.
   *
   * @param key The key under which the value will be stored.
   * @param value The value to be stored in the cache.
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param options Additional options for storing the value.
   */
  public put<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: Types[K],
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.set(
      this.resolveKey(key) as string,
      value as Exclude<StoreParams, BufferSource>,
      {
        lifetime,
        ...options,
      },
    )
  }

  /**
   * Sets a key-value pair in the cache indefinitely.
   *
   * @param key The key under which the value will be stored.
   * @param value The value to be stored in the cache.
   * @param options Additional options for storing the value.
   */
  public forever<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: Types[K],
    options?: StoreCommandOptions,
  ) {
    return this.client.set(
      this.resolveKey(key),
      value as Exclude<StoreParams, BufferSource>,
      {
        lifetime: 0,
        ...options,
      },
    )
  }

  /**
   * Deletes the value associated with the specified key from the cache.
   *
   * @param key The key of the value to delete.
   * @param options Additional options for the delete operation.
   */
  public delete<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    options?: StoreCommandOptions,
  ) {
    return this.client.delete(this.resolveKey(key), options)
  }
  /**
   * Deletes the value associated with the specified key from the cache without any side effects.
   *
   * @param key The key of the value to delete.
   * @param options Additional options for the delete operation.
   */
  public forget<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    options?: StoreCommandOptions,
  ) {
    return this.delete(key, options)
  }

  /**
   * Adds a new key-value pair to the cache.
   * If the key does not exist, it will add it, but if it exists, it will do nothing.
   *
   * @param key The key under which the value will be stored.
   * @param value The value to be stored in the cache.
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param options Additional options for storing the value.
   */
  public add<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: Types[K],
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.add(
      this.resolveKey(key) as string,
      value as Exclude<StoreParams, BufferSource>,
      {
        lifetime,
        ...options,
      },
    )
  }

  /**
   * Increments the value associated with the specified key in the cache by the given amount.
   *
   * @param key The key of the value to increment.
   * @param value The amount by which to increment the value (default: 1).
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param options Additional options for the increment operation.
   * @returns A Promise that resolves to the updated value after incrementing.
   */
  public increment<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: number = 1,
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.incr(this.resolveKey(key) as string, value, {
      lifetime,
      ...options,
    })
  }

  /**
   * Decrements the value associated with the specified key in the cache by the given amount.
   *
   * @param key The key of the value to decrement.
   * @param value The amount by which to decrement the value (default: 1).
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param options Additional options for the decrement operation.
   * @returns A Promise that resolves to the updated value after decrementing.
   */
  public decrement<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: number = 1,
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.decr(this.resolveKey(key), value, {
      lifetime,
      ...options,
    })
  }

  /**
   * Asynchronously retrieves the value associated with the specified key from the cache.
   * If the value is not found in the cache, it is fetched using the provided function and stored in the cache.
   *
   * @param key The key to retrieve the value for.
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param fnGet A function that returns a Promise resolving to the value to be cached if not found.
   * @returns A Promise that resolves to the retrieved or newly cached value.
   */
  public async remember<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    fnGet: () => Promise<Types[K]>,
    options?: StoreCommandOptions,
  ): Promise<Types[K]> {
    const inCache = await this.get(key)
    if (inCache) return inCache

    const value = await fnGet()
    await this.put(key, value, lifetime, { noreply: true, ...options })

    return value
  }

  /**
   * Retrieves or stores the value associated with the specified key in the cache indefinitely.
   *
   * @param key The key to retrieve or store the value for.
   * @param fnGet A function that returns a Promise resolving to the value to be cached if not found.
   * @param options Additional options for storing the value.
   * @returns A Promise that resolves to the retrieved or newly cached value.
   */
  public rememberForever<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    fnGet: () => Promise<Types[K]>,
    options?: StoreCommandOptions,
  ): Promise<Types[K]> {
    return this.remember(key, 0, fnGet, options)
  }

  /**
   * Retrieves the value associated with the specified key from the cache.
   * If you need to retrieve an item from the cache and then delete the item, you may use the pull method.
   *
   * @param key The key to retrieve the value for.
   * @param def The default value to return if the key is not found in the cache (optional).
   * @returns A Promise that resolves to the retrieved value, or the default value if the key is not found.
   */
  public async pull<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    def?: Types[K],
  ): Promise<Types[K] | typeof def> {
    const val = await this.get(key)
    if (val) {
      await this.delete(key)
    }

    return val ?? def
  }

  /**
   * Replaces the value associated with the specified key in the cache.
   * replace is used to update the value of a key only if that key already exists. If the key does not exist in Memcached, the replace command will do nothing
   *
   * @param key The key of the value to replace.
   * @param value The new value to store in place of the existing value.
   * @param lifetime The optional lifetime of the new cached value in seconds (default: 0).
   * @param options Additional options for replacing the value.
   */
  public replace<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: Types[K],
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.replace(
      this.resolveKey(key),
      value as Exclude<StoreParams, BufferSource>,
      {
        lifetime,
        ...options,
      },
    )
  }

  /**
   * Appends a new value to the existing value associated with the specified key in the cache.
   *
   * @param key The key under which the value will be appended.
   * @param value The value to append to the existing value.
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param options Additional options for appending the value.
   */
  public append<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: Types[K],
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.append(
      this.resolveKey(key),
      value as Exclude<StoreParams, BufferSource>,
      {
        lifetime,
        ...options,
      },
    )
  }

  /**
   * Prepends a new value to the existing value associated with the specified key in the cache.
   *
   * @param key The key under which the value will be prepended.
   * @param value The value to prepend to the existing value.
   * @param lifetime The optional lifetime of the cached value in seconds (default: 0).
   * @param options Additional options for prepending the value.
   */
  public prepend<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    value: Types[K],
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: StoreCommandOptions,
  ) {
    return this.client.prepend(
      this.resolveKey(key),
      value as Exclude<StoreParams, BufferSource>,
      {
        lifetime,
        ...options,
      },
    )
  }

  /**
   * Flushes all items from the cache.
   *
   * @param delay The optional delay in seconds before flushing all items (default: immediate).
   * @param noReply Flag to indicate if a reply should be sent back (default: false).
   */
  public flush(delay?: string, noReply?: boolean) {
    return this.client.cmd(`flush_all ${delay}`, { noreply: noReply })
  }

  /**
   * Increments the lifetime of the value associated with the specified key in the cache.
   *
   * @param key The key of the value to increment the lifetime for.
   * @param lifetime The optional new lifetime of the cached value in seconds (default: current lifetime).
   * @param options Additional options for updating the lifetime.
   * @returns A Promise that resolves to an array of strings indicating the operation success.
   */
  public incLifetime<K extends keyof Types>(
    key: Split<Exclude<K, number | symbol>, "/"> | K,
    lifetime = this.lifeTime[this.resolveKey(key)] ?? 0,
    options?: CommonCommandOption,
  ) {
    return this.client.touch(this.resolveKey(key), lifetime, options)
  }

  /**
   * Executes a custom command on the Memcached server.
   *
   * @param command The custom command to execute.
   * @param options Additional options for the command execution (optional).
   * @returns A Promise that resolves to the result of the custom command execution.
   */
  public cmd<T>(command: string, options?: CommonCommandOption) {
    return this.client.cmd(command, options)
  }

  public gets<Ks extends (keyof Types)[]>(
    keys: Ks,
  ): Promise<
    Ks & {
      [index in number]: Types[Ks[index]]
    }
  > {
    return this.client.gets(keys as string[]).then((data) => {
      // deno-lint-ignore no-explicit-any
      return keys.map((key) => (data as unknown as any)[key]?.value)
      // deno-lint-ignore no-explicit-any
    }) as unknown as any
  }
}
