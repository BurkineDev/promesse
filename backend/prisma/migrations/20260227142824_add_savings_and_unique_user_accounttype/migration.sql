/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'SAVINGS';

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_type_key" ON "Account"("userId", "type");
