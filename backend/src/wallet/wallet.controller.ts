import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WalletService } from "./wallet.service";
import { CashinDto } from "./dto/cashin.dto";

type JwtUser = { id: string; email: string };
type AuthedRequest = Request & { user?: JwtUser };

@Controller("wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  private getUserId(req: AuthedRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing user id in request");
    return userId;
  }

  @Get("balance")
  async balance(@Req() req: AuthedRequest) {
    const userId = this.getUserId(req);
    const { balanceMinor } = await this.wallet.getMainBalance(userId);
    return { balanceMinor: balanceMinor.toString() };
  }

  @Post("cashin")
  async cashin(@Req() req: AuthedRequest, @Body() dto: CashinDto) {
    const userId = this.getUserId(req);
    return this.wallet.cashin({
      userId,
      amountMinor: dto.amountMinor,
      reference: dto.reference,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
