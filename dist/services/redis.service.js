"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
        });
        this.client.on("error", (err) => console.error("Redis Client Error", err));
        this.client.connect();
    }
    // Product caching
    async cacheProduct(product) {
        const key = `product:${product._id}`;
        await this.client.set(key, JSON.stringify(product), {
            EX: 3600, // Cache for 1 hour
        });
    }
    async getCachedProduct(productId) {
        const key = `product:${productId}`;
        const cached = await this.client.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    async invalidateProductCache(productId) {
        const key = `product:${productId}`;
        await this.client.del(key);
    }
    // Cart caching
    async cacheCart(cart) {
        const key = `cart:${cart.userId}`;
        await this.client.set(key, JSON.stringify(cart), {
            EX: 1800, // Cache for 30 minutes
        });
    }
    async getCachedCart(userId) {
        const key = `cart:${userId}`;
        const cached = await this.client.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    async invalidateCartCache(userId) {
        const key = `cart:${userId}`;
        await this.client.del(key);
    }
    // Stock locking for checkout
    async lockStock(productId, quantity) {
        const key = `stock:lock:${productId}`;
        const locked = await this.client.set(key, quantity.toString(), {
            NX: true,
            EX: 300, // Lock for 5 minutes
        });
        return !!locked;
    }
    async releaseStockLock(productId) {
        const key = `stock:lock:${productId}`;
        await this.client.del(key);
    }
}
exports.redisService = new RedisService();
