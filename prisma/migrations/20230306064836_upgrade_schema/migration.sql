/*
  Warnings:

  - A unique constraint covering the columns `[userStateId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserState" DROP CONSTRAINT "UserState_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userStateId" TEXT;

-- Fill userStateId from userState
UPDATE "User" SET "userStateId" = "userState"."id" FROM "UserState" AS "userState" WHERE "User"."id" = "userState"."userId";

-- CreateTable
CREATE TABLE "StreamKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StreamKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StreamKey_key_key" ON "StreamKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StreamKey_userId_key" ON "StreamKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userStateId_key" ON "User"("userStateId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userStateId_fkey" FOREIGN KEY ("userStateId") REFERENCES "UserState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamKey" ADD CONSTRAINT "StreamKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
