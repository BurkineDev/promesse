import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EntryDirection } from "@prisma/client";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserMainAccountId(userId: string): Promise<string> {
    const acc = await this.prisma.account.findFirst({
      where: { userId, type: "USER_MAIN" },
      select: { id: true },
    });
    if (!acc) throw new NotFoundException("USER_MAIN account missing");
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
}
