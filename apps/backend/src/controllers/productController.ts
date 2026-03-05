import { Request, Response } from "express";
import prisma from "../config/prisma";

// =======================
// 📦 GET /api/products
// =======================
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "6", search, category, sort = "price_asc" } = req.query;

    // Convert query params to numbers
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    // Build dynamic filter conditions
    const where: any = {};
    if (category) where.category = String(category);
    if (search)
      where.name = {
        contains: String(search),
        mode: "insensitive",
      };

    // Sorting options
    const orderByOptions: Record<string, any> = {
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      name_asc: { name: "asc" },
      name_desc: { name: "desc" },
      newest: { createdAt: "desc" },
    };
    const orderBy = orderByOptions[sort as string] || { id: "asc" };

    // Fetch products + total count simultaneously
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      products,
      total,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
// ✅ GET /api/products/:id - Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Convert to number (important since Prisma expects a number ID)
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};


// =======================
// 📦 GET /api/products/:id
// =======================
export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching single product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// =======================
// 📦 GET /api/products/filter
// =======================
export const filterProductsController = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) where.category = String(category);

    const products = await prisma.product.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    console.error("❌ Error filtering products:", error);
    res.status(500).json({ message: "Failed to filter products" });
  }
};
