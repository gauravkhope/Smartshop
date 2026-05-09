"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// Get all orders (admin) - MUST be before /:orderId route
router.get("/", authMiddleware_1.authenticateToken, orderController_1.getAllOrders);
// Create a new order
router.post("/", authMiddleware_1.authenticateToken, orderController_1.createOrder);
// Get all orders for a specific user
router.get("/user/:userId", authMiddleware_1.authenticateToken, orderController_1.getUserOrders);
// Update order status
router.patch("/:orderId/status", authMiddleware_1.authenticateToken, orderController_1.updateOrderStatus);
// Cancel an order
router.patch("/:orderId/cancel", authMiddleware_1.authenticateToken, orderController_1.cancelOrder);
// Get a specific order by ID (must be last!)
router.get("/:orderId", authMiddleware_1.authenticateToken, orderController_1.getOrderById);
exports.default = router;
