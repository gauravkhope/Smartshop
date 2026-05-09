import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  createReturnReplaceRequest,
  getReturnReplaceRequest,
  cancelReturnReplaceRequest,
} from "../controllers/returnReplaceController";

const router = express.Router();

// Create a return/replace request
router.post("/:orderId/return-replace", authenticateToken, createReturnReplaceRequest);

// Get return/replace request for an order
router.get("/:orderId/return-replace", authenticateToken, getReturnReplaceRequest);

// Cancel a return/replace request
router.patch("/:orderId/return-replace/cancel", authenticateToken, cancelReturnReplaceRequest);

export default router;
