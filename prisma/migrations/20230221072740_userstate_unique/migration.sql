/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserState` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserState_userId_key" ON "UserState"("userId");
