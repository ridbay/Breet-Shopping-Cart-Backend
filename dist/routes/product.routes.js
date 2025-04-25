"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const product_controller_1 = require("../controllers/product.controller");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// Create a new product
router.post("/", [
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Product name is required"),
    (0, express_validator_1.body)("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
    (0, express_validator_1.body)("category").trim().notEmpty().withMessage("Category is required"),
], productController.createProduct);
// Get a product by ID
router.get("/:id", [(0, express_validator_1.param)("id").isMongoId().withMessage("Invalid product ID")], productController.getProduct);
// Update product stock
router.patch("/:id/stock", [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid product ID"),
    (0, express_validator_1.body)("quantity")
        .isInt({ min: 0 })
        .withMessage("Quantity must be a non-negative integer"),
], productController.updateStock);
// List all products with pagination
router.get("/", [
    (0, express_validator_1.query)("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
], productController.listProducts);
// Search products
router.get("/search", [(0, express_validator_1.query)("query").trim().notEmpty().withMessage("Search query is required")], productController.searchProducts);
exports.default = router;
