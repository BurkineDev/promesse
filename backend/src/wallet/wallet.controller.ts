import { Controller, Get, Req, UseGuards, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WalletService } from "./wallet.service";

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
}
