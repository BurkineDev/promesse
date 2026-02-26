import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BalanceProjectionService } from "./balance-projection.service";
import { Body, Post } from "@nestjs/common";
import { GoalsLedgerService } from "./goals-ledger.service";
import { GoalMovementDto } from "./dto/goal-movement.dto";


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

@Post(":id/deposit")
async deposit(@Req() req: any, @Param("id") goalId: string, @Body() dto: GoalMovementDto) {
  const userId = req.user.sub;
  return this.ledger.depositToGoal({
    userId,
    goalId,
    amountMinor: dto.amountMinor,
    reference: dto.reference,
    idempotencyKey: dto.idempotencyKey,
  });
}

@Post(":id/withdraw")
async withdraw(@Req() req: any, @Param("id") goalId: string, @Body() dto: GoalMovementDto) {
  const userId = req.user.sub;
  return this.ledger.withdrawFromGoal({
    userId,
    goalId,
    amountMinor: dto.amountMinor,
    reference: dto.reference,
    idempotencyKey: dto.idempotencyKey,
  });
}
