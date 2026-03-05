"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterProducts = exports.getProductById = exports.getAllProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Get all products with pagination + sorting
const getAllProducts = async (page, limit, sortBy, order) => {
    const skip = (page - 1) * limit;
    return prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
    });
};
exports.getAllProducts = getAllProducts;
// ✅ Get product by ID
const getProductById = async (id) => {
    return prisma.product.findUnique({
        where: { id },
    });
};
exports.getProductById = getProductById;
const filterProducts = async (filters) => {
    const { category, minPrice, maxPrice, minRating } = filters;
    const where = {};
    // ✅ Case-insensitive match for category
    if (category) {
        where.category = {
            equals: category,
            mode: "insensitive", // 👈 this is the key fix
        };
    }
    // ✅ Optional price filters
    if (minPrice != null || maxPrice != null) {
        where.price = {};
        if (minPrice != null)
            where.price.gte = minPrice;
        if (maxPrice != null)
            where.price.lte = maxPrice;
    }
    // ✅ Rating filter
    if (minRating != null) {
        where.rating = { gte: minRating };
    }
    // ✅ Execute Prisma query
    return prisma.product.findMany({
        where,
        orderBy: { price: "asc" },
        take: 100, // limit results for now
    });
};
exports.filterProducts = filterProducts;
