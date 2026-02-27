import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SavingsService } from "./savings.service";
import { SavingsMovementDto } from "./dto/savings-movement.dto";

type JwtUser = { id: string; email: string };
type AuthedRequest = Request & { user?: JwtUser };

@Controller("savings")
@UseGuards(JwtAuthGuard)
export class SavingsController {
  constructor(private readonly savings: SavingsService) {}

  private getUserId(req: AuthedRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing user id in request");
    return userId;
  }

  @Get("balance")
  async balance(@Req() req: AuthedRequest) {
    const userId = this.getUserId(req);
    const { balanceMinor } = await this.savings.getSavingsBalance(userId);
    return { balanceMinor: balanceMinor.toString() };
  }

  @Post("deposit")
  async deposit(@Req() req: AuthedRequest, @Body() dto: SavingsMovementDto) {
    const userId = this.getUserId(req);
    return this.savings.deposit({
      userId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post("withdraw")
  async withdraw(@Req() req: AuthedRequest, @Body() dto: SavingsMovementDto) {
    const userId = this.getUserId(req);
    return this.savings.withdraw({
      userId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
