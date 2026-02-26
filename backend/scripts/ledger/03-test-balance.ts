import "dotenv/config";
import {
  PrismaClient,
  AccountType,
  EntryDirection,
  LedgerTxType,
} from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Pick a user (first one)
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!user) throw new Error("No users found");

  // Ensure SYSTEM_CLEARING exists
  const system = await prisma.account.findFirst({
    where: { type: AccountType.SYSTEM_CLEARING, userId: null },
    select: { id: true },
  });
  if (!system) throw new Error("SYSTEM_CLEARING not found");

  // 1) Create a Goal (safe)
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Test Goal",
      status: "ACTIVE",
    },
    select: { id: true, accountId: true },
  });

  // 2) Ensure goal has an account (reuse your migration script logic)
  let goalAccountId = goal.accountId;
  if (!goalAccountId) {
    const acc = await prisma.account.create({
      data: { userId: user.id, type: AccountType.GOAL },
      select: { id: true },
    });
    await prisma.goal.update({
      where: { id: goal.id },
      data: { accountId: acc.id },
    });
    goalAccountId = acc.id;
  }

  // 3) Post a ledger transaction + 2 entries (1000)
  const lt = await prisma.ledgerTransaction.create({
    data: {
      userId: user.id,
      type: LedgerTxType.CASHIN,
      reference: `test:balance:${Date.now()}`,
    },
    select: { id: true },
  });

  await prisma.entry.createMany({
    data: [
      {
        ledgerTransactionId: lt.id,
        accountId: system.id,
        direction: EntryDirection.DEBIT,
        amountMinor: 1000n,
      },
      {
        ledgerTransactionId: lt.id,
        accountId: goalAccountId,
        direction: EntryDirection.CREDIT,
        amountMinor: 1000n,
      },
    ],
  });

  console.log("✅ Created goal:", goal.id);
  console.log("✅ Goal account:", goalAccountId);
  console.log("✅ Ledger tx:", lt.id);

  // 4) Compute balance directly from entries (should be 1000)
  const [credits, debits] = await Promise.all([
    prisma.entry.aggregate({
      _sum: { amountMinor: true },
      where: { accountId: goalAccountId, direction: EntryDirection.CREDIT },
    }),
    prisma.entry.aggregate({
      _sum: { amountMinor: true },
      where: { accountId: goalAccountId, direction: EntryDirection.DEBIT },
    }),
  ]);

  const balance =
    (credits._sum.amountMinor ?? 0n) - (debits._sum.amountMinor ?? 0n);

  console.log("🎯 Expected balance=1000, actual=", balance.toString());
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
