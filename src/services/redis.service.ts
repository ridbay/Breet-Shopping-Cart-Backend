import { createClient } from "redis";
import { IProduct } from "../models/Product";
import { ICart } from "../models/Cart";

class RedisService {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on("error", (err) => console.error("Redis Client Error", err));
    this.client.connect();
  }

  // Product caching
  async cacheProduct(product: IProduct): Promise<void> {
    const key = `product:${product._id}`;
    await this.client.set(key, JSON.stringify(product), {
      EX: 3600, // Cache for 1 hour
    });
  }

  async getCachedProduct(productId: string): Promise<IProduct | null> {
    const key = `product:${productId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateProductCache(productId: string): Promise<void> {
    const key = `product:${productId}`;
    await this.client.del(key);
  }

  // Cart caching
  async cacheCart(cart: ICart): Promise<void> {
    const key = `cart:${cart.userId}`;
    await this.client.set(key, JSON.stringify(cart), {
      EX: 1800, // Cache for 30 minutes
    });
  }

  async getCachedCart(userId: string): Promise<ICart | null> {
    const key = `cart:${userId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateCartCache(userId: string): Promise<void> {
    const key = `cart:${userId}`;
    await this.client.del(key);
  }

  // Stock locking for checkout
  async lockStock(productId: string, quantity: number): Promise<boolean> {
    const key = `stock:lock:${productId}`;
    const locked = await this.client.set(key, quantity.toString(), {
      NX: true,
      EX: 300, // Lock for 5 minutes
    });
    return !!locked;
  }

  async releaseStockLock(productId: string): Promise<void> {
    const key = `stock:lock:${productId}`;
    await this.client.del(key);
  }
}

export const redisService = new RedisService();
