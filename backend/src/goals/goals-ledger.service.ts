import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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

  private async getUserMainAccountId(userId: string): Promise<string> {
    const acc = await this.prisma.account.findFirst({
      where: { userId, type: AccountType.USER_MAIN },
      select: { id: true },
    });
    if (!acc) throw new NotFoundException("USER_MAIN account missing");
    return acc.id;
  }

  private async computeAccountBalance(accountId: string): Promise<bigint> {
    const [credits, debits] = await Promise.all([
      this.prisma.entry.aggregate({
        _sum: { amountMinor: true },
        where: { accountId, direction: EntryDirection.CREDIT },
      }),
      this.prisma.entry.aggregate({
        _sum: { amountMinor: true },
        where: { accountId, direction: EntryDirection.DEBIT },
      }),
    ]);
    const totalCredits = credits._sum.amountMinor ?? 0n;
    const totalDebits = debits._sum.amountMinor ?? 0n;
    return totalCredits - totalDebits;
  }

  private async ensureGoalAccount(
    userId: string,
    goalId: string,
  ): Promise<{ goalAccountId: string; targetDate: Date | null }> {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      select: { id: true, userId: true, accountId: true, targetDate: true },
    });
    if (!goal) throw new NotFoundException("Goal not found");

    if (goal.accountId) {
      return { goalAccountId: goal.accountId, targetDate: goal.targetDate ?? null };
    }

    const acc = await this.prisma.account.create({
      data: { userId: goal.userId, type: AccountType.GOAL },
      select: { id: true },
    });

    await this.prisma.goal.update({
      where: { id: goal.id },
      data: { accountId: acc.id },
    });

    return { goalAccountId: acc.id, targetDate: goal.targetDate ?? null };
  }

  private async ensureIdempotency(userId: string, idempotencyKey?: string) {
    if (!idempotencyKey) return null;
    const existing = await this.prisma.ledgerTransaction.findFirst({
      where: { userId, idempotencyKey },
      select: { id: true },
    });
    return existing?.id ?? null;
  }

  /**
   * depositToGoal = TRANSFER USER_MAIN -> GOAL
   * MAIN decreases (DEBIT), GOAL increases (CREDIT)
   */
  async depositToGoal(input: {
    userId: string;
    goalId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);
    const { goalAccountId } = await this.ensureGoalAccount(input.userId, input.goalId);
    const mainAccountId = await this.getUserMainAccountId(input.userId);

    const existingId = await this.ensureIdempotency(input.userId, input.idempotencyKey);
    if (existingId) return { ledgerTransactionId: existingId };

    // Check MAIN balance
    const mainBalance = await this.computeAccountBalance(mainAccountId);
    if (mainBalance < amount) throw new BadRequestException("Insufficient main balance");

    const reference = input.reference ?? `transfer:main->goal:${input.goalId}:${Date.now()}`;

    const lt = await this.prisma.$transaction(async (db) => {
      const tx = await db.ledgerTransaction.create({
        data: {
          userId: input.userId,
          type: LedgerTxType.TRANSFER,
          reference,
          idempotencyKey: input.idempotencyKey ?? null,
        },
        select: { id: true },
      });

      await db.entry.createMany({
        data: [
          { ledgerTransactionId: tx.id, accountId: mainAccountId, direction: EntryDirection.DEBIT, amountMinor: amount },
          { ledgerTransactionId: tx.id, accountId: goalAccountId, direction: EntryDirection.CREDIT, amountMinor: amount },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }

  /**
   * withdrawFromGoal = TRANSFER GOAL -> USER_MAIN
   * blocked before targetDate (if set)
   */
  async withdrawFromGoal(input: {
    userId: string;
    goalId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);
    const { goalAccountId, targetDate } = await this.ensureGoalAccount(input.userId, input.goalId);
    const mainAccountId = await this.getUserMainAccountId(input.userId);

    // Lock rule
    if (targetDate && Date.now() < targetDate.getTime()) {
      throw new ForbiddenException(`Funds locked until ${targetDate.toISOString()}`);
    }

    const existingId = await this.ensureIdempotency(input.userId, input.idempotencyKey);
    if (existingId) return { ledgerTransactionId: existingId };

    // Check GOAL balance
    const goalBalance = await this.computeAccountBalance(goalAccountId);
    if (goalBalance < amount) throw new BadRequestException("Insufficient goal balance");

    const reference = input.reference ?? `transfer:goal->main:${input.goalId}:${Date.now()}`;

    const lt = await this.prisma.$transaction(async (db) => {
      const tx = await db.ledgerTransaction.create({
        data: {
          userId: input.userId,
          type: LedgerTxType.TRANSFER,
          reference,
          idempotencyKey: input.idempotencyKey ?? null,
        },
        select: { id: true },
      });

      await db.entry.createMany({
        data: [
          { ledgerTransactionId: tx.id, accountId: goalAccountId, direction: EntryDirection.DEBIT, amountMinor: amount },
          { ledgerTransactionId: tx.id, accountId: mainAccountId, direction: EntryDirection.CREDIT, amountMinor: amount },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }
}
