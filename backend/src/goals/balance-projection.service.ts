import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BalanceProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the computed balance (in minor units) for a given goal account.
   * balance = SUM(CREDIT) − SUM(DEBIT) on Entry for the goal's accountId
   */
  async getGoalBalance(
    userId: string,
    goalId: string,
  ): Promise<{ balanceMinor: bigint }> {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      select: { accountId: true },
    });

    if (!goal) {
      throw new NotFoundException("Goal not found");
    }
    if (!goal.accountId) {
      throw new NotFoundException("Goal account not initialized");
    }

    const accountId = goal.accountId;

    const [credits, debits] = await Promise.all([
      this.prisma.entry.aggregate({
        _sum: { amountMinor: true },
        where: { accountId, direction: "CREDIT" },
      }),
      this.prisma.entry.aggregate({
        _sum: { amountMinor: true },
        where: { accountId, direction: "DEBIT" },
      }),
    ]);

    const totalCredits = credits._sum.amountMinor ?? 0n;
    const totalDebits = debits._sum.amountMinor ?? 0n;

    return { balanceMinor: totalCredits - totalDebits };
  }
}
