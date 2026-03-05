"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const baseTemplates_1 = __importDefault(require("./baseTemplates")); // 👈 Import your curated data
const prisma = new client_1.PrismaClient();
/* ----------------------------------------
   STEP 1: Fetch live API data (DummyJSON)
-----------------------------------------*/
async function fetchLiveProducts(limit = 200) {
    try {
        const res = await axios_1.default.get(`https://dummyjson.com/products?limit=${limit}`);
        return res.data.products.map((p) => ({
            name: p.title,
            brand: p.brand || "Generic",
            category: p.category,
            mainCategory: "Electronics & Gadgets",
            price: Math.round(p.price * 90),
            image: p.thumbnail,
            description: p.description,
        }));
    }
    catch (err) {
        console.warn("⚠️ Could not fetch live products, using only base templates.");
        return [];
    }
}
/* ----------------------------------------
   STEP 2: Smart merge & seed logic
-----------------------------------------*/
async function main() {
    console.log("🌍 Fetching live product data...");
    const liveProducts = await fetchLiveProducts(200);
    console.log(`✅ Retrieved ${liveProducts.length} live products.`);
    const combined = [...baseTemplates_1.default, ...liveProducts];
    console.log(`🧩 Total unique base + live products: ${combined.length}`);
    // Generate up to 2000 unique, semi-randomized entries
    const allProducts = [];
    for (let i = 0; i < 2000; i++) {
        const base = combined[i % combined.length];
        allProducts.push({
            name: `${base.name} Variant ${i + 1}`,
            price: Math.round(base.price * (0.85 + Math.random() * 0.3)),
            description: `${base.description} | Edition ${i + 1}`,
            image: `${base.image}?sig=${i + 1}`,
            brand: base.brand,
            category: base.category,
            mainCategory: base.mainCategory,
        });
    }
    console.log("🧹 Clearing existing data...");
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`);
    console.log("🌱 Seeding smart merged dataset...");
    await prisma.product.createMany({ data: allProducts });
    console.log("✅ Smart seeding completed successfully with 2000 unique items!");
}
/* ----------------------------------------
   STEP 3: Execute seeder
-----------------------------------------*/
main()
    .catch((e) => console.error("❌ Error during seeding:", e))
    .finally(async () => {
    await prisma.$disconnect();
});
console.log("🌱 Seeding smart merged dataset...");
