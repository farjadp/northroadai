// ============================================================================
// 📁 Hardware Source: src/lib/cache.ts
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Simple In-Memory LRU Cache.
// - Stores key-value pairs with a max capacity.
// - Evicts least recently used items when full.
// - Useful for caching embeddings or repetitive API responses in a serverless instance.
// ============================================================================

/**
 * Simple In-Memory LRU (Least Recently Used) Cache.
 * 
 * Used for caching expensive computation results like vector embeddings or API responses
 * within a single server instance (e.g., Cloud Run instance memory).
 * 
 * @template T The type of data stored in the cache.
 */
class SimpleLRUCache<T> {
    private capacity: number;
    private map: Map<string, T>;

    /**
     * Creates a new instance of SimpleLRUCache.
     * @param {number} capacity - Maximum number of items to store before evicting the oldest. Default is 100.
     */
    constructor(capacity: number = 100) {
        this.capacity = capacity;
        this.map = new Map();
    }

    /**
     * Retrieves an item from the cache and updates its freshness (moves to end of LRU).
     * @param {string} key - The key to lookup.
     * @returns {T | undefined} The cached value or undefined if not found.
     */
    get(key: string): T | undefined {
        if (!this.map.has(key)) return undefined;

        // Refresh: Move to end (most recently used)
        const value = this.map.get(key)!;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    /**
     * Adds an item to the cache. If capacity is exceeded, evicts the least recently used item.
     * @param {string} key - The key to store.
     * @param {T} value - The value to store.
     */
    set(key: string, value: T): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.capacity) {
            // Evict oldest (first item in Map)
            const firstKey = this.map.keys().next().value;
            if (firstKey) this.map.delete(firstKey);
        }
        this.map.set(key, value);
    }

    clear(): void {
        this.map.clear();
    }
}

// Singleton instances for specific use cases
export const embeddingCache = new SimpleLRUCache<number[]>(500); // Store up to 500 embeddings
export const queryCache = new SimpleLRUCache<any>(100); // Store up to 100 query responses
