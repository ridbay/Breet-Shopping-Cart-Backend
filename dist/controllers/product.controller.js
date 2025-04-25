"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const Product_1 = require("../models/Product");
const redis_service_1 = require("../services/redis.service");
class ProductController {
    // Create a new product
    async createProduct(req, res) {
        try {
            const product = new Product_1.Product(req.body);
            await product.save();
            await redis_service_1.redisService.cacheProduct(product);
            res.status(201).json(product);
        }
        catch (error) {
            res.status(400).json({ error: "Failed to create product" });
        }
    }
    // Get a product by ID
    async getProduct(req, res) {
        try {
            const { id } = req.params;
            // Try to get from cache first
            const cachedProduct = await redis_service_1.redisService.getCachedProduct(id);
            if (cachedProduct) {
                res.json(cachedProduct);
                return;
            }
            const product = await Product_1.Product.findById(id);
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            await redis_service_1.redisService.cacheProduct(product);
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch product" });
        }
    }
    // Update product stock
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            const product = await Product_1.Product.findById(id);
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            // Check if stock is being locked
            const isLocked = await redis_service_1.redisService.lockStock(id, quantity);
            if (!isLocked) {
                res.status(409).json({ error: "Stock is currently being processed" });
                return;
            }
            try {
                product.stock = quantity;
                await product.save();
                await redis_service_1.redisService.cacheProduct(product);
                res.json(product);
            }
            finally {
                await redis_service_1.redisService.releaseStockLock(id);
            }
        }
        catch (error) {
            res.status(500).json({ error: "Failed to update stock" });
        }
    }
    // List all products with pagination
    async listProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const products = await Product_1.Product.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            const total = await Product_1.Product.countDocuments();
            res.json({
                products,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch products" });
        }
    }
    // Search products
    async searchProducts(req, res) {
        try {
            const { query } = req.query;
            const products = await Product_1.Product.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } })
                .limit(20);
            res.json(products);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to search products" });
        }
    }
}
exports.ProductController = ProductController;
