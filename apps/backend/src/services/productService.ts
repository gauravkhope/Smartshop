import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Get all products with pagination + sorting
export const getAllProducts = async (
  page: number,
  limit: number,
  sortBy: string,
  order: "asc" | "desc"
) => {
  const skip = (page - 1) * limit;
  return prisma.product.findMany({
    skip,
    take: limit,
    orderBy: { [sortBy]: order },
  });
};

// ✅ Get product by ID
export const getProductById = async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
  });
};

// ✅ Filter products by category, price, rating
type Filters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

export const filterProducts = async (filters: Filters) => {
  const { category, minPrice, maxPrice, minRating } = filters;

  const where: any = {};

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
    if (minPrice != null) where.price.gte = minPrice;
    if (maxPrice != null) where.price.lte = maxPrice;
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
