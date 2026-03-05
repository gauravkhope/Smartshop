import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

    // Validate required fields
    if (!userId || !items || !totalAmount || !shippingAddress || !shippingCity || !shippingState || !shippingZip || !phone || !email) {
      console.error("❌ Missing required fields:", { userId, items: items?.length, totalAmount, shippingAddress, shippingCity, shippingState, shippingZip, phone, email });
      return res.status(400).json({ error: "Missing required fields" });
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
        error: "Some products in the order do not exist", 
        missingProductIds 
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        totalAmount: parseFloat(totalAmount),
        paymentMethod: paymentMethod || "card",
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
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
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

    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get a specific order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId),
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

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: {
        id: parseInt(orderId),
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
    console.log("📋 getAllOrders called");
    // Temporarily return empty array to test route
    res.json([]);
    
    // const orders = await prisma.order.findMany({
    //   include: {
    //     items: {
    //       include: {
    //         product: true,
    //       },
    //     },
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    //   });

    // console.log(`📋 Found ${orders.length} orders`);
    // res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }

};

// Cancel an order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Fetch the order first
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
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
      where: { id: parseInt(orderId) },
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
