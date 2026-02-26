import "dotenv/config";
import {
  PrismaClient,
  AccountType,
  LedgerTxType,
  EntryDirection,
  TransactionType,
} from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("🚀 Starting legacy migration...");

  // 1) SYSTEM_CLEARING account
  const system = await prisma.account.findFirst({
    where: { type: AccountType.SYSTEM_CLEARING, userId: null },
  });

  if (!system) throw new Error("SYSTEM_CLEARING account not found");

  // 2) Ensure every Goal has an Account
  const goals = await prisma.goal.findMany();

  for (const goal of goals) {
    if (!goal.accountId) {
      const acc = await prisma.account.create({
        data: {
          userId: goal.userId,
          type: AccountType.GOAL,
        },
      });

      await prisma.goal.update({
        where: { id: goal.id },
        data: { accountId: acc.id },
      });

      console.log(`✅ Created account for goal ${goal.id}`);
    }
  }

  // 3) Migrate legacy Transactions
  const legacyTxs = await prisma.transaction.findMany({
    orderBy: { createdAt: "asc" },
  });

  let migrated = 0;

  for (const tx of legacyTxs) {
    const reference = `legacy:${tx.id}`;

    const already = await prisma.ledgerTransaction.findFirst({
      where: { reference },
    });

    if (already) continue;

    const goal = await prisma.goal.findUnique({
      where: { id: tx.goalId },
    });

    if (!goal?.accountId)
      throw new Error(`Goal ${tx.goalId} missing accountId`);

    const ledgerType =
      tx.type === TransactionType.DEPOSIT
        ? LedgerTxType.LEGACY_DEPOSIT
        : LedgerTxType.LEGACY_WITHDRAWAL;

    const debitAccount =
      tx.type === TransactionType.DEPOSIT
        ? system.id
        : goal.accountId;

    const creditAccount =
      tx.type === TransactionType.DEPOSIT
        ? goal.accountId
        : system.id;

    await prisma.$transaction(async (db) => {
      const lt = await db.ledgerTransaction.create({
        data: {
          userId: tx.userId,
          type: ledgerType,
          reference,
          createdAt: tx.occurredAt ?? tx.createdAt,
        },
      });

      await db.entry.createMany({
        data: [
          {
            ledgerTransactionId: lt.id,
            accountId: debitAccount,
            amountMinor: tx.amountMinor,
            direction: EntryDirection.DEBIT,
            createdAt: tx.occurredAt ?? tx.createdAt,
          },
          {
            ledgerTransactionId: lt.id,
            accountId: creditAccount,
            amountMinor: tx.amountMinor,
            direction: EntryDirection.CREDIT,
            createdAt: tx.occurredAt ?? tx.createdAt,
          },
        ],
      });
    });

    migrated++;
  }

  console.log(`🎯 Migrated ${migrated} legacy transactions.`);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
