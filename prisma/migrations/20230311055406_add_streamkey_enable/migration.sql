-- AlterTable
ALTER TABLE "StreamKey" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false;
