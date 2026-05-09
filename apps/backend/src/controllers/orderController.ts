import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parsePositiveInt } from "../utils/validation";

const prisma = new PrismaClient();

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log("📦 Order creation request received");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      phone,
      email,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const authUserId = req.user.id;
    if (userId && Number(userId) !== authUserId) {
      return res.status(403).json({ error: "Forbidden: cannot create order for another user" });
    }

    // Validate required fields
    const missingFields: string[] = [];
    if (!userId) missingFields.push("userId");
    if (!items) missingFields.push("items");
    if (totalAmount === undefined || totalAmount === null || isNaN(Number(totalAmount))) missingFields.push("totalAmount");
      if (!paymentMethod) missingFields.push("paymentMethod");
    if (!shippingAddress) missingFields.push("shippingAddress");
    if (!shippingCity) missingFields.push("shippingCity");
    if (!shippingState) missingFields.push("shippingState");
    if (!shippingZip) missingFields.push("shippingZip");
    if (!phone) missingFields.push("phone");
    if (!email) missingFields.push("email");

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields, { userId, itemsCount: items?.length, totalAmount, shippingAddress, shippingCity, shippingState, shippingZip, phone, email });
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}`, missingFields });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Verify all products exist before creating order
    const productIds = items.map((item: any) => parseInt(item.productId));
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });
    
    const existingProductIds = existingProducts.map(p => p.id);
    const missingProductIds = productIds.filter(id => !existingProductIds.includes(id));
    
    if (missingProductIds.length > 0) {
      return res.status(400).json({ 
        error: "This Product Does not Exists . Enter a Valid Id", 
        missingProductIds 
      });
    }

      const normalizedPaymentMethod = typeof paymentMethod === "string" ? paymentMethod.trim().toLowerCase() : "";
      const allowedPaymentMethods = ["card", "upi", "wallet", "netbanking", "emi", "cod"];

      if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
        return res.status(400).json({
          error: "Invalid paymentMethod. Allowed values: card, upi, wallet, netbanking, emi, cod",
          allowedPaymentMethods,
        });
      }

    // Find the highest orderNumber for this user
    const lastOrder = await prisma.order.findFirst({
      where: { userId: authUserId },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const nextOrderNumber = lastOrder?.orderNumber ? lastOrder.orderNumber + 1 : 1;

    // Create order with items and per-user orderNumber
    const order = await prisma.order.create({
      data: {
        userId: authUserId,
        orderNumber: nextOrderNumber,
        totalAmount: parseFloat(totalAmount),
          paymentMethod: normalizedPaymentMethod,
        paymentStatus: "pending",
        orderStatus: "processing",
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry: shippingCountry || "USA",
        phone,
        email,
        items: {
          create: items.map((item: any) => ({
            productId: parseInt(item.productId),
            sourceProductRef:
              item.sourceProductId !== undefined && item.sourceProductId !== null
                ? String(item.sourceProductId)
                : null,
            displayName: item.name ? String(item.name) : null,
            displayBrand: item.brand ? String(item.brand) : null,
            displayImage: item.image ? String(item.image) : null,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Order created successfully:", order.id);
    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create order", details: error instanceof Error ? error.message : String(error) });
  }
};

// Get all orders for a user
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params;

    const parsedUserId = parsePositiveInt(userId);
    if (!parsedUserId) {
      return res.status(400).json({ error: "This is Invalid UserID. Please enter valid UserID." });
    }

    if (parsedUserId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: cannot view another user's orders" });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: parsedUserId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Always include orderNumber in response
    const ordersWithOrderNumber = orders.map(order => ({ ...order, orderNumber: order.orderNumber }));
    res.json(ordersWithOrderNumber);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get a specific order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId } = req.params;

    const parsedOrderId = parsePositiveInt(orderId);
    if (!parsedOrderId) {
      return res.status(400).json({ error: "Invalid OrderId" });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: parsedOrderId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: cannot view another user's order" });
    }

    // Always include orderNumber in response
    res.json({ ...order, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const parsedOrderId = parsePositiveInt(orderId);
    if (!parsedOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: {
        id: parsedOrderId,
      },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: admin access required" });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }

};

// Cancel an order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId } = req.params;

    const parsedOrderId = parsePositiveInt(orderId);
    if (!parsedOrderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Fetch the order first
    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: cannot cancel another user's order" });
    }

    // Prevent cancelling delivered/cancelled orders
    if (order.orderStatus === "delivered") {
      return res.status(400).json({ error: "Delivered order cannot be cancelled" });
    }
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }

    // Update order status
    const cancelledOrder = await prisma.order.update({
      where: { id: parsedOrderId },
      data: {
        orderStatus: "cancelled",
        paymentStatus: "refunded", // optional
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });

  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};
