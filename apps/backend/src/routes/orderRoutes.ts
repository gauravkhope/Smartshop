import express from "express";
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
router.get("/", getAllOrders);

// Create a new order
router.post("/", createOrder);

// Get all orders for a specific user
router.get("/user/:userId", getUserOrders);

// Get a specific order by ID
router.get("/:orderId", getOrderById);

// Update order status
router.patch("/:orderId/status", updateOrderStatus);

// Cancel an order
router.patch("/:orderId/cancel", cancelOrder);


export default router;
