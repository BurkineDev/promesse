import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccountType, EntryDirection, LedgerTxType } from "@prisma/client";

function parsePositiveBigInt(amountMinor: string): bigint {
  if (!/^\d+$/.test(amountMinor)) {
    throw new BadRequestException("amountMinor must be a numeric string");
  }
  const v = BigInt(amountMinor);
  if (v <= 0n) throw new BadRequestException("amountMinor must be > 0");
  return v;
}

@Injectable()
export class GoalsLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  private async getSystemClearingAccountId(): Promise<string> {
    const acc = await this.prisma.account.findFirst({
      where: { type: AccountType.SYSTEM_CLEARING, userId: null },
      select: { id: true },
    });
    if (!acc) throw new NotFoundException("SYSTEM_CLEARING account missing");
    return acc.id;
  }

  private async ensureGoalAccount(userId: string, goalId: string): Promise<string> {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      select: { id: true, userId: true, accountId: true },
    });
    if (!goal) throw new NotFoundException("Goal not found");

    if (goal.accountId) return goal.accountId;

    const acc = await this.prisma.account.create({
      data: { userId: goal.userId, type: AccountType.GOAL },
      select: { id: true },
    });

    await this.prisma.goal.update({
      where: { id: goal.id },
      data: { accountId: acc.id },
    });

    return acc.id;
  }

  async depositToGoal(input: {
    userId: string;
    goalId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);
    const goalAccountId = await this.ensureGoalAccount(input.userId, input.goalId);
    const systemAccountId = await this.getSystemClearingAccountId();

    if (input.idempotencyKey) {
      const existing = await this.prisma.ledgerTransaction.findFirst({
        where: { userId: input.userId, idempotencyKey: input.idempotencyKey },
        select: { id: true },
      });
      if (existing) return { ledgerTransactionId: existing.id };
    }

    const reference = input.reference ?? `cashin:${input.goalId}:${Date.now()}`;

    const lt = await this.prisma.$transaction(async (db) => {
      const tx = await db.ledgerTransaction.create({
        data: {
          userId: input.userId,
          type: LedgerTxType.CASHIN,
          reference,
          idempotencyKey: input.idempotencyKey ?? null,
        },
        select: { id: true },
      });

      await db.entry.createMany({
        data: [
          { ledgerTransactionId: tx.id, accountId: systemAccountId, direction: EntryDirection.DEBIT, amountMinor: amount },
          { ledgerTransactionId: tx.id, accountId: goalAccountId, direction: EntryDirection.CREDIT, amountMinor: amount },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }

  async withdrawFromGoal(input: {
    userId: string;
    goalId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);
    const goalAccountId = await this.ensureGoalAccount(input.userId, input.goalId);
    const systemAccountId = await this.getSystemClearingAccountId();

    // balance check
    const [credits, debits] = await Promise.all([
      this.prisma.entry.aggregate({
        _sum: { amountMinor: true },
        where: { accountId: goalAccountId, direction: EntryDirection.CREDIT },
      }),
      this.prisma.entry.aggregate({
        _sum: { amountMinor: true },
        where: { accountId: goalAccountId, direction: EntryDirection.DEBIT },
      }),
    ]);
    const balance = (credits._sum.amountMinor ?? 0n) - (debits._sum.amountMinor ?? 0n);
    if (balance < amount) throw new BadRequestException("Insufficient goal balance");

    if (input.idempotencyKey) {
      const existing = await this.prisma.ledgerTransaction.findFirst({
        where: { userId: input.userId, idempotencyKey: input.idempotencyKey },
        select: { id: true },
      });
      if (existing) return { ledgerTransactionId: existing.id };
    }

    const reference = input.reference ?? `cashout:${input.goalId}:${Date.now()}`;

    const lt = await this.prisma.$transaction(async (db) => {
      const tx = await db.ledgerTransaction.create({
        data: {
          userId: input.userId,
          type: LedgerTxType.CASHOUT,
          reference,
          idempotencyKey: input.idempotencyKey ?? null,
        },
        select: { id: true },
      });

      await db.entry.createMany({
        data: [
          { ledgerTransactionId: tx.id, accountId: goalAccountId, direction: EntryDirection.DEBIT, amountMinor: amount },
          { ledgerTransactionId: tx.id, accountId: systemAccountId, direction: EntryDirection.CREDIT, amountMinor: amount },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }
}
