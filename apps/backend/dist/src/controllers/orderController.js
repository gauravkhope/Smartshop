"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new order
const createOrder = async (req, res) => {
    try {
        console.log("📦 Order creation request received");
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        const { userId, items, totalAmount, paymentMethod, shippingAddress, shippingCity, shippingState, shippingZip, shippingCountry, phone, email, } = req.body;
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
        const productIds = items.map((item) => parseInt(item.productId));
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
                    create: items.map((item) => ({
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
    }
    catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({ error: "Failed to create order", details: error instanceof Error ? error.message : String(error) });
    }
};
exports.createOrder = createOrder;
// Get all orders for a user
const getUserOrders = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};
exports.getUserOrders = getUserOrders;
// Get a specific order by ID
const getOrderById = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Failed to fetch order" });
    }
};
exports.getOrderById = getOrderById;
// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus, paymentStatus } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }
        const updateData = {};
        if (orderStatus)
            updateData.orderStatus = orderStatus;
        if (paymentStatus)
            updateData.paymentStatus = paymentStatus;
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
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Get all orders (admin)
const getAllOrders = async (req, res) => {
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
    }
    catch (error) {
        console.error("❌ Error fetching all orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};
exports.getAllOrders = getAllOrders;
