import { Router } from "express";
import { body, param, query } from "express-validator";
import { ProductController } from "../controllers/product.controller";

const router = Router();
const productController = new ProductController();

// Create a new product
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("category").trim().notEmpty().withMessage("Category is required"),
  ],
  productController.createProduct
);

// Get a product by ID
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid product ID")],
  productController.getProduct
);

// Update product stock
router.patch(
  "/:id/stock",
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
  ],
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
  productController.listProducts
);

// Search products
router.get(
  "/search",
  [query("query").trim().notEmpty().withMessage("Search query is required")],
  productController.searchProducts
);

export default router;
