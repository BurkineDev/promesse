import { Controller, Get, Param } from "@nestjs/common";
import { BalanceProjectionService } from "./balance-projection.service";

@Controller("goals")
export class GoalsController {
  constructor(
    private readonly balanceProjection: BalanceProjectionService,
  ) {}

  /* ---------- GET /goals/:id/balance ---------- */

  // TODO: add @UseGuards(JwtAuthGuard) and extract userId from request
  @Get(":id/balance")
  async getBalance(@Param("id") goalId: string) {
    // TODO: extract userId from JWT payload
    const userId = "";
    return this.balanceProjection.getGoalBalance(userId, goalId);
  }
}
