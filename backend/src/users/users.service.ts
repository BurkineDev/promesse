import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(email: string, passwordHash: string) {
    return this.prisma.$transaction(async (db) => {
      const user = await db.user.create({
        data: { email, password: passwordHash },
      });

      await db.account.create({
        data: { userId: user.id, type: "USER_MAIN" },
      });

      await db.account.create({
        data: { userId: user.id, type: "SAVINGS" },
      });

     return user;
    });
  }

  updateRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}
