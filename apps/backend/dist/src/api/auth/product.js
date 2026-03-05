"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};
exports.getAllProducts = getAllProducts;
