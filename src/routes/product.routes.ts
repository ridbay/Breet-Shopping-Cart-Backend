import { Router } from "express";
import { check, param, query } from "express-validator";
import { ProductController } from "../controllers/product.controller";
import validateRequest from "../middlewares/validateRequests";

const router = Router();
const productController = new ProductController();

// Create a new product
router.post(
  "/",
  [
    check("name").trim().notEmpty().withMessage("Product name is required"),
    check("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    check("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    check("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    check("category").trim().notEmpty().withMessage("Category is required"),
  ],
  validateRequest,
  productController.createProduct
);

// Get a product by ID
router.get(
  "/id/:id",
  [param("id").isMongoId().withMessage("Invalid product ID")],
  validateRequest,
  productController.getProduct
);

// Update product stock
router.patch(
  "/id/:id/stock",
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    check("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
  ],
  validateRequest,
  productController.updateStock
);

// List all products with pagination
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  validateRequest,
  productController.listProducts
);

// Search products
router.get(
  "/search",
  [query("query").trim().notEmpty().withMessage("Search query is required")],
  validateRequest,
  productController.searchProducts
);

export default router;
