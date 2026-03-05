"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// Get all orders (admin) - MUST be before /:orderId route
router.get("/", orderController_1.getAllOrders);
// Create a new order
router.post("/", orderController_1.createOrder);
// Get all orders for a specific user
router.get("/user/:userId", orderController_1.getUserOrders);
// Get a specific order by ID
router.get("/:orderId", orderController_1.getOrderById);
// Update order status
router.patch("/:orderId/status", orderController_1.updateOrderStatus);
// Cancel an order
router.patch("/:orderId/cancel", orderController_1.cancelOrder);
exports.default = router;
