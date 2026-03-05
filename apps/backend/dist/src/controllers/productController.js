"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterProductsController = exports.getSingleProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// =======================
// 📦 GET /api/products
// =======================
const getProducts = async (req, res) => {
    try {
        const { page = "1", limit = "6", search, category, sort = "price_asc" } = req.query;
        // Convert query params to numbers
        const take = Number(limit);
        const skip = (Number(page) - 1) * take;
        // Build dynamic filter conditions
        const where = {};
        if (category)
            where.category = String(category);
        if (search)
            where.name = {
                contains: String(search),
                mode: "insensitive",
            };
        // Sorting options
        const orderByOptions = {
            price_asc: { price: "asc" },
            price_desc: { price: "desc" },
            name_asc: { name: "asc" },
            name_desc: { name: "desc" },
            newest: { createdAt: "desc" },
        };
        const orderBy = orderByOptions[sort] || { id: "asc" };
        // Fetch products + total count simultaneously
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take,
                orderBy,
            }),
            prisma_1.default.product.count({ where }),
        ]);
        const totalPages = Math.ceil(total / take);
        res.json({
            products,
            total,
            totalPages,
            currentPage: Number(page),
        });
    }
    catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};
exports.getProducts = getProducts;
// ✅ GET /api/products/:id - Get single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        // Convert to number (important since Prisma expects a number ID)
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        // Fetch product
        const product = await prisma_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};
exports.getProductById = getProductById;
// =======================
// 📦 GET /api/products/:id
// =======================
const getSingleProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const product = await prisma_1.default.product.findUnique({
            where: { id },
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    }
    catch (error) {
        console.error("❌ Error fetching single product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};
exports.getSingleProduct = getSingleProduct;
// =======================
// 📦 GET /api/products/filter
// =======================
const filterProductsController = async (req, res) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category)
            where.category = String(category);
        const products = await prisma_1.default.product.findMany({
            where,
            take: 10,
            orderBy: { createdAt: "desc" },
        });
        res.json(products);
    }
    catch (error) {
        console.error("❌ Error filtering products:", error);
        res.status(500).json({ message: "Failed to filter products" });
    }
};
exports.filterProductsController = filterProductsController;
