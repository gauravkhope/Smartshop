import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parsePositiveInt } from "../utils/validation";

const prisma = new PrismaClient();

// Create a return/replace request
export const createReturnReplaceRequest = async (req: Request, res: Response) => {
  console.log('[DEBUG] Entered createReturnReplaceRequest');
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { orderId } = req.params;
    const { type, reason } = req.body;
    const parsedOrderId = parsePositiveInt(orderId);
    if (!parsedOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    if (!type) {
      return res.status(400).json({ error: "Type is Missing" });
    }
    if (!["return", "replace"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }
    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }
    // Only allow one pending request per order per user
    const existing = await prisma.returnReplaceRequest.findFirst({
      where: { orderId: parsedOrderId, userId: req.user.id, status: "pending" },
    });
    if (existing) {
      return res.status(400).json({ error: "A pending request already exists for this order." });
    }
    const request = await prisma.returnReplaceRequest.create({
      data: {
        orderId: parsedOrderId,
        userId: req.user.id,
        type,
        reason,
      },
    });
    res.status(201).json({ message: "Request created", request });
  } catch (error) {
    res.status(500).json({ error: "Failed to create request", details: error instanceof Error ? error.message : String(error) });
  }
};

// Get return/replace request for an order
export const getReturnReplaceRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { orderId } = req.params;
    const parsedOrderId = parsePositiveInt(orderId);
    if (!parsedOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    const request = await prisma.returnReplaceRequest.findFirst({
      where: { orderId: parsedOrderId, userId: req.user.id },
      orderBy: { requestedAt: "desc" },
    });
    if (!request) {
      return res.status(404).json({ error: "No request found" });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch request", details: error instanceof Error ? error.message : String(error) });
  }
};

// Cancel a return/replace request
export const cancelReturnReplaceRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { orderId } = req.params;
    const parsedOrderId = parsePositiveInt(orderId);
    if (!parsedOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    const request = await prisma.returnReplaceRequest.findFirst({
      where: { orderId: parsedOrderId, userId: req.user.id, status: "pending" },
    });
    if (!request) {
      return res.status(404).json({ error: "No pending request found" });
    }
    const updated = await prisma.returnReplaceRequest.update({
      where: { id: request.id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
    res.json({ message: "Request cancelled", request: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel request", details: error instanceof Error ? error.message : String(error) });
  }
};
