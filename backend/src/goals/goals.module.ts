import { Module } from "@nestjs/common";
import { GoalsController } from "./goals.controller";
import { BalanceProjectionService } from "./balance-projection.service";
import { GoalsLedgerService } from "./goals-ledger.service";
import { GoalsService } from "./goals.service";

@Module({
  controllers: [GoalsController],
  providers: [BalanceProjectionService, GoalsLedgerService, GoalsService],
})
export class GoalsModule {}
