/*
  Warnings:

  - A unique constraint covering the columns `[channel]` on the table `StreamKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channel` to the `StreamKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StreamKey" ADD COLUMN     "channel" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StreamKey_channel_key" ON "StreamKey"("channel");
