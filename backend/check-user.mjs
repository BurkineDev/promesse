import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = "test@test.com";
const u = await prisma.user.findUnique({
  where: { email },
  select: { id: true, email: true, createdAt: true },
});

console.log(u);
await prisma.$disconnect();
