import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccountType, GoalStatus } from "@prisma/client";

type CreateGoalInput = {
  name: string;
  targetAmountMinor?: string; // BigInt in JSON (string)
  targetDate?: string; // ISO string
  lockedUntil?: string; // ISO string
};

type GoalResponse = {
  id: string;
  userId: string;
  accountId: string | null;
  name: string;
  status: GoalStatus;
  lockedUntil: string | null;
  targetAmountMinor: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  private toGoalResponse(goal: any): GoalResponse {
    return {
      id: goal.id,
      userId: goal.userId,
      accountId: goal.accountId ?? null,
      name: goal.name,
      status: goal.status,
      lockedUntil: goal.lockedUntil ? goal.lockedUntil.toISOString() : null,
      targetAmountMinor:
        goal.targetAmountMinor !== null && goal.targetAmountMinor !== undefined
          ? goal.targetAmountMinor.toString()
          : null,
      targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }

  async createGoal(userId: string, input: CreateGoalInput): Promise<GoalResponse> {
    const targetAmountMinor =
      input.targetAmountMinor !== undefined && input.targetAmountMinor !== null
        ? BigInt(input.targetAmountMinor)
        : undefined;

    const targetDate = input.targetDate ? new Date(input.targetDate) : undefined;
    const lockedUntil = input.lockedUntil ? new Date(input.lockedUntil) : undefined;

    const created = await this.prisma.$transaction(async (db) => {
      const account = await db.account.create({
        data: {
          userId,
          type: AccountType.GOAL,
        },
        select: { id: true },
      });

      return db.goal.create({
        data: {
          userId,
          name: input.name,
          status: GoalStatus.ACTIVE,
          accountId: account.id,
          targetAmountMinor,
          targetDate,
          lockedUntil,
        },
      });
    });

    return this.toGoalResponse(created);
  }

  async listGoals(userId: string): Promise<GoalResponse[]> {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((g) => this.toGoalResponse(g));
  }

  async getGoal(userId: string, goalId: string): Promise<GoalResponse> {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new NotFoundException("Goal not found");
    return this.toGoalResponse(goal);
  }

  async archiveGoal(userId: string, goalId: string): Promise<GoalResponse> {
    const updated = await this.prisma.goal.updateMany({
      where: { id: goalId, userId },
      data: { status: GoalStatus.ARCHIVED },
    });

    if (updated.count === 0) throw new NotFoundException("Goal not found");

    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new NotFoundException("Goal not found");
    return this.toGoalResponse(goal);
  }
}
