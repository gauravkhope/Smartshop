import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a new order - INLINE implementation to avoid import issues
router.post("/", async (req: Request, res: Response) => {
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
      console.error("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Verify all products exist
    const productIds = items.map((item: any) => parseInt(item.productId));
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });
    
    const existingProductIds = existingProducts.map(p => p.id);
    const missingProductIds = productIds.filter(id => !existingProductIds.includes(id));
    
    if (missingProductIds.length > 0) {
      console.error("❌ Missing products:", missingProductIds);
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
        shippingCountry: shippingCountry || "India",
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
});

// Get all orders for a user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
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
});

// Get a specific order by ID
router.get("/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
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
});

// Get all orders (admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("📋 getAllOrders called");
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

    console.log(`📋 Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
