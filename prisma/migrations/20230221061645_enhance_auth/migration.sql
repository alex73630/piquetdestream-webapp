/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "providerAccountName" TEXT;

-- DropTable
DROP TABLE "Example";
