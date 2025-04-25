import { Request, Response } from "express";
import { Cart, ICart } from "../models/Cart";
import { Product, IProduct } from "../models/Product";
import { redisService } from "../services/redis.service";
import { Types } from "mongoose";

export class CartController {
  // Get user's cart
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Try to get from cache first
      const cachedCart = await redisService.getCachedCart(userId);
      if (cachedCart) {
        res.json(cachedCart);
        return;
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [], total: 0 });
        await cart.save();
      }

      await redisService.cacheCart(cart);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  }

  // Add item to cart
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { productId, quantity } = req.body;

      // Get product and check stock
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (product.stock < quantity) {
        res.status(400).json({ error: "Insufficient stock" });
        return;
      }

      // Lock stock for this operation
      const isLocked = await redisService.lockStock(productId, quantity);
      if (!isLocked) {
        res.status(409).json({ error: "Stock is currently being processed" });
        return;
      }

      try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
          cart = new Cart({ userId, items: [], total: 0 });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(
          (item) => item.productId.toString() === productId
        );

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.items.push({
            productId: new Types.ObjectId(productId),
            quantity,
            price: product.price,
          });
        }

        await cart.save();
        await redisService.cacheCart(cart);
        await redisService.invalidateProductCache(productId);

        res.json(cart);
      } finally {
        await redisService.releaseStockLock(productId);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  }

  // Remove item from cart
  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId, productId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.status(404).json({ error: "Cart not found" });
        return;
      }

      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );

      await cart.save();
      await redisService.cacheCart(cart);
      await redisService.invalidateProductCache(productId);

      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  }

  // Update item quantity in cart
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const { userId, productId } = req.params;
      const { quantity } = req.body;

      // Get product and check stock
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (product.stock < quantity) {
        res.status(400).json({ error: "Insufficient stock" });
        return;
      }

      // Lock stock for this operation
      const isLocked = await redisService.lockStock(productId, quantity);
      if (!isLocked) {
        res.status(409).json({ error: "Stock is currently being processed" });
        return;
      }

      try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
          res.status(404).json({ error: "Cart not found" });
          return;
        }

        const item = cart.items.find(
          (item) => item.productId.toString() === productId
        );
        if (!item) {
          res.status(404).json({ error: "Item not found in cart" });
          return;
        }

        item.quantity = quantity;
        await cart.save();
        await redisService.cacheCart(cart);
        await redisService.invalidateProductCache(productId);

        res.json(cart);
      } finally {
        await redisService.releaseStockLock(productId);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  }

  // Checkout cart
  async checkout(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ error: "Cart is empty" });
        return;
      }

      // Lock all products in cart
      const locks = await Promise.all(
        cart.items.map((item) =>
          redisService.lockStock(item.productId.toString(), item.quantity)
        )
      );

      if (locks.some((locked) => !locked)) {
        res
          .status(409)
          .json({ error: "Some items are currently being processed" });
        return;
      }

      try {
        // Update stock for all products
        for (const item of cart.items) {
          const product: any = (await Product.findById(
            item.productId
          )) as IProduct | null;
          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product ${product?._id.toString()}`
            );
          }
          product.stock -= item.quantity;
          await product.save();
          await redisService.invalidateProductCache(product._id.toString());
        }

        // Clear cart
        cart.items = [];
        cart.total = 0;
        await cart.save();
        await redisService.cacheCart(cart);

        res.json({ message: "Checkout successful", orderTotal: cart.total });
      } finally {
        // Release all locks
        await Promise.all(
          cart.items.map((item) =>
            redisService.releaseStockLock(item.productId.toString())
          )
        );
      }
    } catch (error) {
      res.status(500).json({ error: "Checkout failed" });
    }
  }
}
