import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ GET ALL PRODUCTS (Limited to 100 for performance)
 * Example: /api/products
 */
// GET ALL PRODUCTS (Limited to 100 for performance)
router.get("/", async (req, res) => {
  try {
    // Fetch all products (no limit)
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" }
    });
    console.log(`✅ Total fetched products: ${products.length}`);
    res.json({ products });
  } catch (error) {
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
    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string) || 24, 1), 100); // cap at 100
    const skip = (pageNum - 1) * pageSize;
    // Build flexible synonym set to match plural/singular, spaces, and related terms.
    const synonymMap: Record<string, string[]> = {
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
    const queryMode = "insensitive" as const;
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

    console.log(
      `🔎 Category lookup: input="${category}" normalized="${normalizedCategory}" synonyms=[${synonyms.join(",")}] matched=${finalProducts.length} total=${total}`
    );

    return res.json({
      data: finalProducts,
      meta: {
        total, // total before fallback
        page: pageNum,
        limit: pageSize,
        hasMore: skip + finalProducts.length < total,
        category: normalizedCategory,
        synonyms,
      },
    });
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});


export default router;
