import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} from "../controllers/orderController";

const router = express.Router();

// Get all orders (admin) - MUST be before /:orderId route
router.get("/", authenticateToken, getAllOrders);

// Create a new order
router.post("/", authenticateToken, createOrder);

// Get all orders for a specific user
router.get("/user/:userId", authenticateToken, getUserOrders);


// Update order status
router.patch("/:orderId/status", authenticateToken, updateOrderStatus);

// Cancel an order
router.patch("/:orderId/cancel", authenticateToken, cancelOrder);

// Get a specific order by ID (must be last!)
router.get("/:orderId", authenticateToken, getOrderById);


export default router;
