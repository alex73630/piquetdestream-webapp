-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userStateId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userStateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userStateId_fkey" FOREIGN KEY ("userStateId") REFERENCES "UserState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
