import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BalanceProjectionService } from "./balance-projection.service";
import { GoalsLedgerService } from "./goals-ledger.service";
import { GoalMovementDto } from "./dto/goal-movement.dto";
import { GoalsService } from "./goals.service";
import { CreateGoalDto } from "./dto/create-goal.dto";

@Controller("goals")
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(
    private readonly goals: GoalsService,
    private readonly balanceProjection: BalanceProjectionService,
    private readonly ledger: GoalsLedgerService,
  ) {}

  // ---------- CRUD Goals ----------

  @Post()
  async create(@Req() req: any, @Body() dto: CreateGoalDto) {
    const userId: string = req.user.sub;
    return this.goals.createGoal(userId, dto);
  }

  @Get()
  async list(@Req() req: any) {
    const userId: string = req.user.sub;
    return this.goals.listGoals(userId);
  }

  @Get(":id")
  async get(@Req() req: any, @Param("id") goalId: string) {
    const userId: string = req.user.sub;
    return this.goals.getGoal(userId, goalId);
  }

  @Patch(":id/archive")
  async archive(@Req() req: any, @Param("id") goalId: string) {
    const userId: string = req.user.sub;
    return this.goals.archiveGoal(userId, goalId);
  }

  // ---------- Balance ----------

  @Get(":id/balance")
  async getBalance(@Param("id") goalId: string, @Req() req: any) {
    const userId: string = req.user.sub;
    const { balanceMinor } = await this.balanceProjection.getGoalBalance(
      userId,
      goalId,
    );
    return { balanceMinor: balanceMinor.toString() };
  }

  // ---------- Ledger movements ----------

  @Post(":id/deposit")
  async deposit(
    @Req() req: any,
    @Param("id") goalId: string,
    @Body() dto: GoalMovementDto,
  ) {
    const userId: string = req.user.sub;
    return this.ledger.depositToGoal({
      userId,
      goalId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post(":id/withdraw")
  async withdraw(
    @Req() req: any,
    @Param("id") goalId: string,
    @Body() dto: GoalMovementDto,
  ) {
    const userId: string = req.user.sub;
    return this.ledger.withdrawFromGoal({
      userId,
      goalId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
