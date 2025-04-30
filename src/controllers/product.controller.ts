import { Request, Response } from "express";
import { Product, IProduct } from "../models/Product";
import { redisService } from "../services/redis.service";

export class ProductController {
  // Create a new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = new Product(req.body);
      await product.save();

      await redisService.cacheProduct(product);
      res.status(201).json(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Failed to create product",
      });
    }
  }

  // Get a product by ID
  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try to get from cache first
      const cachedProduct = await redisService.getCachedProduct(id);
      if (cachedProduct) {
        res.json(cachedProduct);
        return;
      }

      const product = await Product.findById(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      await redisService.cacheProduct(product);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  // Update product stock
  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // Check if stock is being locked to prevent overselling
      const isLocked = await redisService.lockStock(id, quantity);
      if (!isLocked) {
        res.status(409).json({ error: "Stock is currently being processed" });
        return;
      }

      try {
        product.stock = quantity;
        await product.save();
        await redisService.cacheProduct(product);
        res.json(product);
      } finally {
        await redisService.releaseStockLock(id);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update stock" });
    }
  }

  // List all products with pagination
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const products = await Product.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments();

      res.json({
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  // Search products
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const products = await Product.find(
        { $text: { $search: query as string } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(20);

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to search products" });
    }
  }
}
