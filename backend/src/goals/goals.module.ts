import { Module } from "@nestjs/common";
import { GoalsController } from "./goals.controller";
import { BalanceProjectionService } from "./balance-projection.service";

@Module({
  controllers: [GoalsController],
  providers: [BalanceProjectionService],
  exports: [BalanceProjectionService],
})
export class GoalsModule {}
