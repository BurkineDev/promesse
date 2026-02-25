import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GoalsModule } from "./goals/goals.module";

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, GoalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
