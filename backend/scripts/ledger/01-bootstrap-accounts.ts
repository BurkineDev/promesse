import "dotenv/config";
import { PrismaClient, AccountType } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1) SYSTEM_CLEARING global (no userId)
  const existingSystem = await prisma.account.findFirst({
    where: { type: AccountType.SYSTEM_CLEARING, userId: null },
    select: { id: true },
  });

  if (!existingSystem) {
    await prisma.account.create({
      data: { type: AccountType.SYSTEM_CLEARING },
    });
    console.log("✅ Created SYSTEM_CLEARING account");
  } else {
    console.log("ℹ️ SYSTEM_CLEARING already exists");
  }

  // 2) USER_MAIN for each user
  const users = await prisma.user.findMany({ select: { id: true } });

  let created = 0;

  for (const u of users) {
    const hasMain = await prisma.account.findFirst({
      where: { userId: u.id, type: AccountType.USER_MAIN },
      select: { id: true },
    });

    if (!hasMain) {
      await prisma.account.create({
        data: { userId: u.id, type: AccountType.USER_MAIN },
      });
      created++;
    }
  }

  console.log(`✅ USER_MAIN accounts created: ${created}/${users.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Bootstrap failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
