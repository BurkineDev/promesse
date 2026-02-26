import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BalanceProjectionService } from "./balance-projection.service";
import { GoalsLedgerService } from "./goals-ledger.service";
import { GoalMovementDto } from "./dto/goal-movement.dto";

@Controller("goals")
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(
    private readonly balanceProjection: BalanceProjectionService,
    private readonly ledger: GoalsLedgerService,
  ) {}

  @Get(":id/balance")
  async getBalance(@Param("id") goalId: string, @Req() req: any) {
    const userId: string = req.user.id; // <-- garde id si ton auth/me marche déjà comme ça
    const { balanceMinor } = await this.balanceProjection.getGoalBalance(userId, goalId);
    return { balanceMinor: balanceMinor.toString() };
  }

  @Post(":id/deposit")
  async deposit(@Req() req: any, @Param("id") goalId: string, @Body() dto: GoalMovementDto) {
    const userId: string = req.user.id;
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
    const userId: string = req.user.id;
    return this.ledger.withdrawFromGoal({
      userId,
      goalId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
