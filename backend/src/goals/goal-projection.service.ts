import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EntryDirection } from "@prisma/client";

@Injectable()
export class GoalProjectionService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getGoalProjection(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      select: {
        accountId: true,
        targetAmountMinor: true,
        targetDate: true,
      },
    });

    if (!goal) throw new NotFoundException("Goal not found");
    if (!goal.accountId) throw new NotFoundException("Goal account not initialized");

    const currentBalanceMinor = await this.computeAccountBalance(goal.accountId);

    const targetAmountMinor = goal.targetAmountMinor ?? null;
    const targetDate = goal.targetDate ?? null;

    // remaining
    let remainingMinor = 0n;
    if (targetAmountMinor !== null) {
      remainingMinor = targetAmountMinor - currentBalanceMinor;
      if (remainingMinor < 0n) remainingMinor = 0n;
    }

    // daysRemaining
    let daysRemaining = 0;
    if (targetDate) {
      const ms = targetDate.getTime() - Date.now();
      daysRemaining = ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
    }

    // perDay / perWeek (ceil)
    let perDayMinor = 0n;
    let perWeekMinor = 0n;

    if (remainingMinor > 0n && daysRemaining > 0) {
      const d = BigInt(daysRemaining);
      perDayMinor = (remainingMinor + d - 1n) / d;

      const weeks = Math.ceil(daysRemaining / 7);
      const w = BigInt(weeks);
      perWeekMinor = (remainingMinor + w - 1n) / w;
    }

    return {
      currentBalanceMinor: currentBalanceMinor.toString(),
      targetAmountMinor: targetAmountMinor !== null ? targetAmountMinor.toString() : null,
      remainingMinor: remainingMinor.toString(),
      targetDate: targetDate ? targetDate.toISOString() : null,
      daysRemaining,
      perDayMinor: perDayMinor.toString(),
      perWeekMinor: perWeekMinor.toString(),
    };
  }
}
