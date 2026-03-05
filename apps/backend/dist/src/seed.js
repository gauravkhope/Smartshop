"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting enterprise-level seeding...');
    // Create sellers
    const sellers = [];
    for (let i = 0; i < 5; i++) {
        const seller = await prisma.user.create({
            data: {
                name: faker_1.faker.person.fullName(),
                email: faker_1.faker.internet.email(),
                password: 'hashedpassword',
                role: 'SELLER',
            },
        });
        sellers.push(seller);
    }
    // Create customers
    for (let i = 0; i < 10; i++) {
        await prisma.user.create({
            data: {
                name: faker_1.faker.person.fullName(),
                email: faker_1.faker.internet.email(),
                password: 'hashedpassword',
                role: 'CUSTOMER',
            },
        });
    }
    console.log('👥 Sellers & customers created!');
    // Product categories and brands
    const categories = ['Mobiles', 'Laptops', 'Clothing', 'Appliances', 'Books', 'Accessories'];
    const brands = ['Apple', 'Samsung', 'HP', 'Nike', 'Sony', 'LG', 'Dell', 'Adidas', 'Puma'];
    const totalProducts = 2000;
    const productsData = [];
    for (let i = 0; i < totalProducts; i++) {
        const category = faker_1.faker.helpers.arrayElement(categories);
        const brand = faker_1.faker.helpers.arrayElement(brands);
        productsData.push({
            name: faker_1.faker.commerce.productName(),
            description: faker_1.faker.commerce.productDescription(),
            price: parseFloat(faker_1.faker.commerce.price({ min: 100, max: 9999 })),
            image: faker_1.faker.image.urlLoremFlickr({ category: category.toLowerCase() }),
            category,
            brand,
        });
    }
    // Batch insert all products
    const batchSize = 500;
    for (let i = 0; i < productsData.length; i += batchSize) {
        const batch = productsData.slice(i, i + batchSize);
        await prisma.product.createMany({ data: batch });
        console.log(`✅ Inserted ${i + batch.length}/${totalProducts}`);
    }
    console.log('🎉 Seeding complete! 2000+ products ready.');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
