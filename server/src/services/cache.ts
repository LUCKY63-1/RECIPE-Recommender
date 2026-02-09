// This service provides a simple in-memory cache with a Time-to-Live (TTL) for each entry.
// It is used to cache results from the AI service to improve performance and reduce API costs.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const TTL = 1000 * 60 * 60; // 1 hour

/**
 * Retrieves an entry from the cache.
 * If the entry is expired, it is removed from the cache and undefined is returned.
 * @param key - The key of the entry to retrieve.
 * @returns The cached data or undefined if the entry does not exist or is expired.
 */
export function get<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) {
    return undefined;
  }

  const isExpired = Date.now() - entry.timestamp > TTL;
  if (isExpired) {
    cache.delete(key);
    return undefined;
  }

  return entry.data as T;
}

/**
 * Adds or updates an entry in the cache.
 * @param key - The key of the entry to set.
 * @param data - The data to cache.
 */
export function set<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };
  cache.set(key, entry);
}
