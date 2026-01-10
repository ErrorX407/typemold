/**
 * @sevirial/nest-mapper - Utility Functions
 * Helper functions for the mapping engine
 */

/**
 * Gets a nested value from an object using dot notation path.
 * Optimized for performance with caching of path segments.
 *
 * @example
 * getNestedValue({ profile: { avatar: 'url' } }, 'profile.avatar')
 * // Returns: 'url'
 */
const pathCache = new Map<string, string[]>();
// Dangerous property names for prototype pollution
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function getNestedValue<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  path: string
): T | undefined {
  if (obj == null) return undefined;

  // Simple path - check for prototype pollution
  if (!path.includes(".")) {
    if (BLOCKED_KEYS.has(path)) return undefined;
    return obj[path] as T | undefined;
  }

  let segments = pathCache.get(path);
  if (!segments) {
    segments = path.split(".");
    pathCache.set(path, segments);
  }

  let current: unknown = obj;
  for (let i = 0; i < segments.length; i++) {
    // Block prototype pollution attempts
    if (BLOCKED_KEYS.has(segments[i])) return undefined;

    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segments[i]];
  }

  return current as T | undefined;
}

/**
 * Checks if a value is a plain object (not an array, Date, etc.)
 */
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Checks if a value is a class instance (not a plain object)
 */
export function isClassInstance(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto !== Object.prototype && proto !== null;
}

/**
 * Creates a shallow clone of an object with only specified keys
 */
export function pickKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a shallow clone of an object without specified keys
 */
export function omitKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const keySet = new Set(keys);
  const result: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !keySet.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Gets all property keys including inherited ones
 */
export function getAllPropertyKeys(target: object): string[] {
  const keys = new Set<string>();
  let current: object | null = target;

  while (current && current !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(current)) {
      if (key !== "constructor") {
        keys.add(key);
      }
    }
    current = Object.getPrototypeOf(current) as object | null;
  }

  return Array.from(keys);
}

/**
 * Deep clones an object (for handling circular references)
 */
export function deepClone<T>(
  obj: T,
  visited = new WeakMap<object, unknown>()
): T {
  if (obj === null || typeof obj !== "object") return obj;

  const objAsObject = obj as object;
  if (visited.has(objAsObject)) return visited.get(objAsObject) as T;

  if (Array.isArray(obj)) {
    const arrClone: unknown[] = [];
    visited.set(objAsObject, arrClone);
    for (let i = 0; i < obj.length; i++) {
      arrClone[i] = deepClone(obj[i], visited);
    }
    return arrClone as T;
  }

  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as T;

  const clone = Object.create(Object.getPrototypeOf(obj)) as Record<
    string,
    unknown
  >;
  visited.set(objAsObject, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepClone((obj as Record<string, unknown>)[key], visited);
  }

  return clone as T;
}
