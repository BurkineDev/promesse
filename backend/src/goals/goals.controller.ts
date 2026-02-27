import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
  ParseUUIDPipe,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BalanceProjectionService } from "./balance-projection.service";
import { GoalProjectionService } from "./goal-projection.service";
import { GoalsLedgerService } from "./goals-ledger.service";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { GoalMovementDto } from "./dto/goal-movement.dto";
import { GoalsService } from "./goals.service";
import { UpdateGoalDto } from "./dto/update-goal.dto";

type JwtUser = { id: string; email: string };
type AuthedRequest = Request & { user?: JwtUser };

@Controller("goals")
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(
    private readonly goals: GoalsService,
    private readonly projection: GoalProjectionService,
    private readonly balanceProjection: BalanceProjectionService,
    private readonly ledger: GoalsLedgerService,
  ) {}

  private getUserId(req: AuthedRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing user id in request");
    return userId;
  }

  @Post()
  async create(@Req() req: AuthedRequest, @Body() dto: CreateGoalDto) {
    const userId = this.getUserId(req);
    return this.goals.createGoal(userId, dto);
  }

  @Get()
  async list(@Req() req: AuthedRequest) {
    const userId = this.getUserId(req);
    return this.goals.listGoals(userId);
  }

  // IMPORTANT: keep this route BEFORE @Get(":id")
  @Get(":id/projection")
  async projectionRoute(
    @Req() req: AuthedRequest,
    @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
  ) {
    const userId = this.getUserId(req);
    return this.projection.getGoalProjection(userId, goalId);
  }

  @Get(":id")
  async get(
    @Req() req: AuthedRequest,
    @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
  ) {
    const userId = this.getUserId(req);
    return this.goals.getGoal(userId, goalId);
  }
 
 @Patch(":id")
 async update(
   @Req() req: AuthedRequest,
   @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
   @Body() dto: UpdateGoalDto,
 ) {
   const userId = this.getUserId(req);
   return this.goals.updateGoal(userId, goalId, dto);
 }

  @Patch(":id/archive")
  async archive(
    @Req() req: AuthedRequest,
    @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
  ) {
    const userId = this.getUserId(req);
    return this.goals.archiveGoal(userId, goalId);
  }

  @Get(":id/balance")
  async getBalance(
    @Req() req: AuthedRequest,
    @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
  ) {
    const userId = this.getUserId(req);
    const { balanceMinor } = await this.balanceProjection.getGoalBalance(userId, goalId);
    return { balanceMinor: balanceMinor.toString() };
  }

  @Post(":id/deposit")
  async deposit(
    @Req() req: AuthedRequest,
    @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
    @Body() dto: GoalMovementDto,
  ) {
    const userId = this.getUserId(req);
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
    @Req() req: AuthedRequest,
    @Param("id", new ParseUUIDPipe({ version: "4" })) goalId: string,
    @Body() dto: GoalMovementDto,
  ) {
    const userId = this.getUserId(req);
    return this.ledger.withdrawFromGoal({
      userId,
      goalId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
