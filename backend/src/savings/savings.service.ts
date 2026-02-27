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
export class SavingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAccountId(userId: string, type: AccountType): Promise<string> {
    const acc = await this.prisma.account.findFirst({
      where: { userId, type },
      select: { id: true },
    });
    if (!acc) throw new NotFoundException(`${type} account missing`);
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

  private async ensureIdempotency(userId: string, idempotencyKey?: string) {
    if (!idempotencyKey) return null;
    const existing = await this.prisma.ledgerTransaction.findFirst({
      where: { userId, idempotencyKey },
      select: { id: true },
    });
    return existing?.id ?? null;
  }

  async getSavingsBalance(userId: string): Promise<{ balanceMinor: bigint }> {
    const savingsAccountId = await this.getAccountId(userId, AccountType.SAVINGS);
    const balanceMinor = await this.computeAccountBalance(savingsAccountId);
    return { balanceMinor };
  }

  // MAIN -> SAVINGS
  async deposit(input: {
    userId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);

    const existingId = await this.ensureIdempotency(input.userId, input.idempotencyKey);
    if (existingId) return { ledgerTransactionId: existingId };

    const mainId = await this.getAccountId(input.userId, AccountType.USER_MAIN);
    const savingsId = await this.getAccountId(input.userId, AccountType.SAVINGS);

    const mainBalance = await this.computeAccountBalance(mainId);
    if (mainBalance < amount) throw new BadRequestException("Insufficient main balance");

    const reference = input.reference ?? `transfer:main->savings:${Date.now()}`;

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
          { ledgerTransactionId: tx.id, accountId: mainId, direction: EntryDirection.DEBIT, amountMinor: amount },
          { ledgerTransactionId: tx.id, accountId: savingsId, direction: EntryDirection.CREDIT, amountMinor: amount },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }

  // SAVINGS -> MAIN
  async withdraw(input: {
    userId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);

    const existingId = await this.ensureIdempotency(input.userId, input.idempotencyKey);
    if (existingId) return { ledgerTransactionId: existingId };

    const mainId = await this.getAccountId(input.userId, AccountType.USER_MAIN);
    const savingsId = await this.getAccountId(input.userId, AccountType.SAVINGS);

    const savingsBalance = await this.computeAccountBalance(savingsId);
    if (savingsBalance < amount) throw new BadRequestException("Insufficient savings balance");

    const reference = input.reference ?? `transfer:savings->main:${Date.now()}`;

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
          { ledgerTransactionId: tx.id, accountId: savingsId, direction: EntryDirection.DEBIT, amountMinor: amount },
          { ledgerTransactionId: tx.id, accountId: mainId, direction: EntryDirection.CREDIT, amountMinor: amount },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }
}
