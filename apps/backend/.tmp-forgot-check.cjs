require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env"), override: true });
const { PrismaClient } = require("@prisma/client");
const { storePasswordResetCode } = require("./dist/src/lib/redis.js");

const db = new PrismaClient();

(async () => {
  const u = await db.user.findFirst({ select: { id: true, email: true, name: true } });
  console.log("sample-user", u);

  if (u) {
    await storePasswordResetCode(u.email, u.id, "123456");
    console.log("store-password-reset-code-ok");
  }

  await db.$disconnect();
})().catch(async (e) => {
  console.error("forgot-flow-deps-error", e);
  await db.$disconnect();
  process.exit(1);
});
