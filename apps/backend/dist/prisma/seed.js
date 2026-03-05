"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts - Basic seed file
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Database seeding completed");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
