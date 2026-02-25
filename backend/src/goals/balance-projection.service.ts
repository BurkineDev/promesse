import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BalanceProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the computed balance (in minor units) for a given goal.
   * TODO: implement aggregation logic (SUM deposits − SUM withdrawals).
   */
  async getGoalBalance(
    userId: string,
    goalId: string,
  ): Promise<{ balanceMinor: bigint }> {
    // TODO: implement
    throw new Error("Not implemented");
  }
}
