import { PrismaClient } from "@prisma/client";

// 👇 Create a safe global type (avoids multiple Prisma instances)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// 👇 Create a single shared Prisma client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// 👇 Ensure only one instance exists (important in Next.js dev mode)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
