import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BalanceProjectionService } from "./balance-projection.service";

@Controller("goals")
export class GoalsController {
  constructor(
    private readonly balanceProjection: BalanceProjectionService,
  ) {}

  /* ---------- GET /goals/:id/balance ---------- */

  @UseGuards(JwtAuthGuard)
  @Get(":id/balance")
  async getBalance(@Param("id") goalId: string, @Req() req: any) {
    const userId: string = req.user.id;
    const { balanceMinor } = await this.balanceProjection.getGoalBalance(userId, goalId);
    return { balanceMinor: balanceMinor.toString() };
  }
}
