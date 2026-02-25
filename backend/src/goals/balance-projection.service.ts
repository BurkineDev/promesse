import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BalanceProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the computed balance (in minor units) for a given goal.
   * balance = SUM(DEPOSIT amounts) − SUM(WITHDRAWAL amounts)
   */
  async getGoalBalance(
    userId: string,
    goalId: string,
  ): Promise<{ balanceMinor: bigint }> {
    const [deposits, withdrawals] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amountMinor: true },
        where: { userId, goalId, type: "DEPOSIT" },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amountMinor: true },
        where: { userId, goalId, type: "WITHDRAWAL" },
      }),
    ]);

    const totalDeposits = deposits._sum.amountMinor ?? 0n;
    const totalWithdrawals = withdrawals._sum.amountMinor ?? 0n;

    return { balanceMinor: totalDeposits - totalWithdrawals };
  }
}
