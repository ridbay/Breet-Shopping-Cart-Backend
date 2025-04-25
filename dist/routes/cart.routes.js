"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const cart_controller_1 = require("../controllers/cart.controller");
const router = (0, express_1.Router)();
const cartController = new cart_controller_1.CartController();
// Get user's cart
router.get("/:userId", [(0, express_validator_1.param)("userId").notEmpty().withMessage("User ID is required")], cartController.getCart);
// Add item to cart
router.post("/:userId/items", [
    (0, express_validator_1.param)("userId").notEmpty().withMessage("User ID is required"),
    (0, express_validator_1.body)("productId").isMongoId().withMessage("Invalid product ID"),
    (0, express_validator_1.body)("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
], cartController.addToCart);
// Remove item from cart
router.delete("/:userId/items/:productId", [
    (0, express_validator_1.param)("userId").notEmpty().withMessage("User ID is required"),
    (0, express_validator_1.param)("productId").isMongoId().withMessage("Invalid product ID"),
], cartController.removeFromCart);
// Update item quantity in cart
router.patch("/:userId/items/:productId", [
    (0, express_validator_1.param)("userId").notEmpty().withMessage("User ID is required"),
    (0, express_validator_1.param)("productId").isMongoId().withMessage("Invalid product ID"),
    (0, express_validator_1.body)("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
], cartController.updateCartItem);
// Checkout cart
router.post("/:userId/checkout", [(0, express_validator_1.param)("userId").notEmpty().withMessage("User ID is required")], cartController.checkout);
exports.default = router;
