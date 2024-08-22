/*
  Warnings:

  - The primary key for the `WaitingPerson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gameCategoryId` on the `WaitingPerson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WaitingPerson" DROP CONSTRAINT "WaitingPerson_pkey",
DROP COLUMN "gameCategoryId",
ADD CONSTRAINT "WaitingPerson_pkey" PRIMARY KEY ("userId", "gameId");
