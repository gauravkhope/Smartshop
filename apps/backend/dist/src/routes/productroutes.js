"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
/**
 * ✅ GET ALL PRODUCTS (Limited to 100 for performance)
 * Example: /api/products
 */
router.get("/", async (req, res) => {
    try {
        // ✅ Use Prisma Raw Query to fetch all rows — bypass ORM limits
        const products = await prisma.$queryRawUnsafe(`SELECT * FROM "Product" ORDER BY "id" ASC`);
        console.log(`✅ Total fetched products: ${products.length}`);
        res.json(products);
    }
    catch (error) {
        console.error("❌ Error fetching all products:", error);
        res.status(500).json({ error: "Failed to fetch all products" });
    }
});
/**
 * ✅ GET PRODUCTS BY CATEGORY
 * Example: /api/products/category/Mobiles
 */
router.get("/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const normalizedCategory = category.trim().toLowerCase();
        const products = await prisma.product.findMany({
            where: {
                category: {
                    contains: normalizedCategory,
                    mode: "insensitive",
                },
            },
            orderBy: { id: "desc" },
            take: 10,
        });
        if (products.length === 0) {
            return res.status(404).json({
                message: `No products found for category '${category}'.`,
            });
        }
        res.json(products);
    }
    catch (error) {
        console.error("❌ Error fetching category products:", error);
        res.status(500).json({ error: "Failed to fetch category products" });
    }
});
/**
 * ✅ GET PRODUCTS BY BRAND (optional)
 * Example: /api/products/brand/Apple
 */
router.get("/brand/:brand", async (req, res) => {
    try {
        const { brand } = req.params;
        const products = await prisma.product.findMany({
            where: {
                brand: {
                    contains: brand,
                    mode: "insensitive", // allows partial and case-insensitive match
                },
            },
            take: 10,
            orderBy: { id: "desc" },
        });
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found for this brand." });
        }
        res.json(products);
    }
    catch (error) {
        console.error("❌ Error fetching brand products:", error);
        res.status(500).json({ error: "Failed to fetch brand products" });
    }
});
/**
 * ✅ GET RANDOM PRODUCTS (for “More Products” section)
 * Example: /api/products/random
 */
router.get("/random", async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            take: 12,
            orderBy: { id: "desc" },
        });
        res.json(products.sort(() => 0.5 - Math.random()));
    }
    catch (error) {
        console.error("❌ Error fetching random products:", error);
        res.status(500).json({ error: "Failed to fetch random products" });
    }
});
/**
 * 🟢 GET PRODUCT BY ID
 * Example: /api/products/12
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error("❌ Error fetching product by ID:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.default = router;
