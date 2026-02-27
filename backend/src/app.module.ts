import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GoalsModule } from "./goals/goals.module";
import { WalletModule } from "./wallet/wallet.module";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    GoalsModule,
    WalletModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
