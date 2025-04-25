import { Router } from "express";
import { body, param } from "express-validator";
import { CartController } from "../controllers/cart.controller";

const router = Router();
const cartController = new CartController();

// Get user's cart
router.get(
  "/:userId",
  [param("userId").notEmpty().withMessage("User ID is required")],
  cartController.getCart
);

// Add item to cart
router.post(
  "/:userId/items",
  [
    param("userId").notEmpty().withMessage("User ID is required"),
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  cartController.addToCart
);

// Remove item from cart
router.delete(
  "/:userId/items/:productId",
  [
    param("userId").notEmpty().withMessage("User ID is required"),
    param("productId").isMongoId().withMessage("Invalid product ID"),
  ],
  cartController.removeFromCart
);

// Update item quantity in cart
router.patch(
  "/:userId/items/:productId",
  [
    param("userId").notEmpty().withMessage("User ID is required"),
    param("productId").isMongoId().withMessage("Invalid product ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  cartController.updateCartItem
);

// Checkout cart
router.post(
  "/:userId/checkout",
  [param("userId").notEmpty().withMessage("User ID is required")],
  cartController.checkout
);

export default router;
