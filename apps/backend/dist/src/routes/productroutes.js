"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const apiResponse_1 = require("../utils/apiResponse");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
/**
 * ✅ GET ALL PRODUCTS (Limited to 100 for performance)
 * Example: /api/products
 */
// GET ALL PRODUCTS (Limited to 100 for performance)
router.get("/", async (req, res) => {
    try {
        const { page = "1", limit = "24" } = req.query;
        const { minPrice, maxPrice } = req.query;
        const pageNum = (0, validation_1.parsePositiveInt)(page);
        const requestedLimit = (0, validation_1.parsePositiveInt)(limit);
        const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
        const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;
        if (!pageNum) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid page parameter. 'page' must be a positive integer.", "INVALID_PAGE");
        }
        if (!requestedLimit) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid limit parameter. 'limit' must be a positive integer.", "INVALID_LIMIT");
        }
        if (parsedMinPrice !== undefined && (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0)) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid minPrice parameter. 'minPrice' must be a non-negative number.", "INVALID_MIN_PRICE");
        }
        if (parsedMaxPrice !== undefined && (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0)) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid maxPrice parameter. 'maxPrice' must be a non-negative number.", "INVALID_MAX_PRICE");
        }
        if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid price range. 'minPrice' cannot be greater than 'maxPrice'.", "INVALID_PRICE_RANGE");
        }
        const pageSize = Math.min(requestedLimit, 100);
        const skip = (pageNum - 1) * pageSize;
        const where = {};
        if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
            where.price = {};
            if (parsedMinPrice !== undefined)
                where.price.gte = parsedMinPrice;
            if (parsedMaxPrice !== undefined)
                where.price.lte = parsedMaxPrice;
        }
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { id: "asc" },
                skip,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);
        console.log(`✅ Products page fetched: page=${pageNum} limit=${pageSize} returned=${products.length} total=${total}`);
        res.json({
            products,
            total,
            page: pageNum,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasMore: skip + products.length < total,
            minPrice: parsedMinPrice ?? null,
            maxPrice: parsedMaxPrice ?? null,
        });
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
        const { page = "1", limit = "24" } = req.query;
        const normalizedCategory = category.trim().toLowerCase();
        const pageNum = (0, validation_1.parsePositiveInt)(page);
        const requestedLimit = (0, validation_1.parsePositiveInt)(limit);
        if (!pageNum) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid page parameter. 'page' must be a positive integer.", "INVALID_PAGE");
        }
        if (!requestedLimit) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid limit parameter. 'limit' must be a positive integer.", "INVALID_LIMIT");
        }
        const pageSize = Math.min(requestedLimit, 100); // cap at 100
        const skip = (pageNum - 1) * pageSize;
        // Build flexible synonym set to match plural/singular, spaces, and related terms.
        const synonymMap = {
            mobiles: ["mobile", "mobiles", "smartphone", "smartphones", "phone", "phones"],
            laptops: ["laptop", "laptops", "notebook", "notebooks"],
            appliances: ["appliance", "appliances", "home appliance", "home appliances", "kitchen appliance", "kitchen appliances"],
            clothes: ["clothes", "clothing", "apparel", "fashion", "garments"],
            footwear: ["footwear", "shoe", "shoes", "sneaker", "sneakers", "sandal", "sandals"],
            trending: ["trending"], // likely no direct DB match; will fallback
        };
        const synonyms = synonymMap[normalizedCategory] || [normalizedCategory];
        // Prisma OR conditions for both category and mainCategory fields.
        // Use correct QueryMode enum for Prisma
        const queryMode = "insensitive";
        const orConditions = synonyms.flatMap((term) => [
            { category: { contains: term, mode: queryMode } },
            { mainCategory: { contains: term, mode: queryMode } },
        ]);
        // If no synonyms found (custom category), still attempt direct match.
        if (orConditions.length === 0) {
            orConditions.push({ category: { contains: normalizedCategory, mode: "insensitive" } });
        }
        // Perform count & paged query.
        const [total, products] = await Promise.all([
            prisma.product.count({ where: { OR: orConditions } }),
            prisma.product.findMany({
                where: { OR: orConditions },
                orderBy: { id: "desc" },
                skip,
                take: pageSize,
            }),
        ]);
        // Fallback: if no products matched synonyms (e.g. "trending" not stored), return a random slice so page isn't empty.
        let finalProducts = products;
        if (finalProducts.length === 0 && normalizedCategory === "trending") {
            finalProducts = await prisma.product.findMany({
                orderBy: { id: "desc" },
                take: pageSize,
                skip,
            });
        }
        console.log(`🔎 Category lookup: input="${category}" normalized="${normalizedCategory}" synonyms=[${synonyms.join(",")}] matched=${finalProducts.length} total=${total}`);
        const responseBody = {
            data: finalProducts,
            meta: {
                total,
                page: pageNum,
                limit: pageSize,
                hasMore: skip + finalProducts.length < total,
                category: normalizedCategory,
            },
        };
        if (total === 0) {
            responseBody.message = "This Category does not exists.";
        }
        return res.json(responseBody);
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
 * ✅ GET DISTINCT BRANDS
 * Example: /api/products/brands
 */
router.get("/brands", async (_req, res) => {
    try {
        const rows = await prisma.product.findMany({
            select: { brand: true },
            distinct: ["brand"],
            orderBy: { brand: "asc" },
        });
        const brands = rows
            .map((row) => row.brand?.trim())
            .filter((brand) => Boolean(brand));
        res.json({ brands, count: brands.length });
    }
    catch (error) {
        console.error("❌ Error fetching brands:", error);
        res.status(500).json({ error: "Failed to fetch brands" });
    }
});
/**
 * ✅ GET RANDOM PRODUCTS (for “More Products” section)
 * Example: /api/products/random
 */
router.get("/random", async (req, res) => {
    try {
        const { count = "12" } = req.query;
        const requestedCount = (0, validation_1.parsePositiveInt)(count);
        if (!requestedCount) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid count parameter. 'count' must be a positive integer.", "INVALID_COUNT");
        }
        const take = Math.min(requestedCount, 50);
        const products = await prisma.product.findMany({
            take,
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
 * ✅ GET DISTINCT CATEGORIES
 * Example: /api/products/categories
 */
router.get("/categories", async (_req, res) => {
    try {
        const rows = await prisma.product.findMany({
            select: { category: true },
            distinct: ["category"],
            orderBy: { category: "asc" },
        });
        const categories = rows
            .map((row) => row.category?.trim())
            .filter((category) => Boolean(category));
        res.json({ categories, count: categories.length });
    }
    catch (error) {
        console.error("❌ Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
/**
 * ✅ SEARCH PRODUCTS (paginated)
 * Example: /api/products/search?q=smartphone&page=1&limit=10
 */
router.get("/search", async (req, res) => {
    try {
        const { q = "", page = "1", limit = "24" } = req.query;
        const query = String(q).trim();
        if (!query) {
            return (0, apiResponse_1.sendError)(res, 400, "Missing search query. Use 'q' parameter.", "MISSING_SEARCH_QUERY");
        }
        const pageNum = (0, validation_1.parsePositiveInt)(page);
        const requestedLimit = (0, validation_1.parsePositiveInt)(limit);
        if (!pageNum) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid page parameter. 'page' must be a positive integer.", "INVALID_PAGE");
        }
        if (!requestedLimit) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid limit parameter. 'limit' must be a positive integer.", "INVALID_LIMIT");
        }
        const pageSize = Math.min(requestedLimit, 100);
        const skip = (pageNum - 1) * pageSize;
        const where = {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { mainCategory: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        };
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { id: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);
        const responseBody = {
            data: products,
            meta: {
                total,
                page: pageNum,
                limit: pageSize,
                hasMore: skip + products.length < total,
                query,
            },
        };
        if (total === 0) {
            responseBody.message = "No products found for this query.";
        }
        res.json(responseBody);
    }
    catch (error) {
        console.error("❌ Error searching products:", error);
        res.status(500).json({ error: "Failed to search products" });
    }
});
/**
 * ✅ SEARCH SUGGESTIONS
 * Example: /api/products/search/suggestions?q=smart
 */
router.get("/search/suggestions", async (req, res) => {
    try {
        const { q = "", limit = "10" } = req.query;
        const query = String(q).trim();
        if (!query) {
            return (0, apiResponse_1.sendError)(res, 400, "Missing search query. Use 'q' parameter.", "MISSING_SEARCH_QUERY");
        }
        const requestedLimit = (0, validation_1.parsePositiveInt)(limit);
        if (!requestedLimit) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid limit parameter. 'limit' must be a positive integer.", "INVALID_LIMIT");
        }
        const take = Math.min(requestedLimit, 25);
        const rows = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { brand: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                name: true,
                brand: true,
            },
            take,
            orderBy: { id: "desc" },
        });
        const suggestions = Array.from(new Set(rows
            .flatMap((row) => [row.name?.trim(), row.brand?.trim()])
            .filter((value) => Boolean(value)))).slice(0, take);
        res.json({ suggestions, count: suggestions.length, query });
    }
    catch (error) {
        console.error("❌ Error fetching search suggestions:", error);
        res.status(500).json({ error: "Failed to fetch search suggestions" });
    }
});
/**
 * 🟢 GET PRODUCT BY ID
 * Example: /api/products/12
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const productId = (0, validation_1.parsePositiveInt)(id);
        if (!productId) {
            return (0, apiResponse_1.sendError)(res, 400, "Invalid product ID", "INVALID_PRODUCT_ID");
        }
        const product = await prisma.product.findUnique({
            where: { id: productId },
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
