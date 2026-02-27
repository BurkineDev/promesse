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
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserMainAccountId(userId: string): Promise<string> {
    const acc = await this.prisma.account.findFirst({
      where: { userId, type: AccountType.USER_MAIN },
      select: { id: true },
    });
    if (!acc) throw new NotFoundException("USER_MAIN account missing");
    return acc.id;
  }

  private async getSystemClearingAccountId(): Promise<string> {
    const acc = await this.prisma.account.findFirst({
      where: { type: AccountType.SYSTEM_CLEARING, userId: null },
      select: { id: true },
    });
    if (!acc) throw new NotFoundException("SYSTEM_CLEARING account missing");
    return acc.id;
  }

  async getMainBalance(userId: string): Promise<{ balanceMinor: bigint }> {
    const accountId = await this.getUserMainAccountId(userId);

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

    return { balanceMinor: totalCredits - totalDebits };
  }

  async cashin(input: {
    userId: string;
    amountMinor: string;
    reference?: string;
    idempotencyKey?: string;
  }) {
    const amount = parsePositiveBigInt(input.amountMinor);

    // idempotency guard
    if (input.idempotencyKey) {
      const existing = await this.prisma.ledgerTransaction.findFirst({
        where: { userId: input.userId, idempotencyKey: input.idempotencyKey },
        select: { id: true },
      });
      if (existing) return { ledgerTransactionId: existing.id };
    }

    const mainAccountId = await this.getUserMainAccountId(input.userId);
    const systemAccountId = await this.getSystemClearingAccountId();
    const reference = input.reference ?? `cashin:main:${Date.now()}`;

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

      // SYSTEM_CLEARING decreases => DEBIT
      // USER_MAIN increases => CREDIT
      await db.entry.createMany({
        data: [
          {
            ledgerTransactionId: tx.id,
            accountId: systemAccountId,
            direction: EntryDirection.DEBIT,
            amountMinor: amount,
          },
          {
            ledgerTransactionId: tx.id,
            accountId: mainAccountId,
            direction: EntryDirection.CREDIT,
            amountMinor: amount,
          },
        ],
      });

      return tx;
    });

    return { ledgerTransactionId: lt.id };
  }
}
