/*
  Warnings:

  - The primary key for the `WaitingRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelId` on the `WaitingRoom` table. All the data in the column will be lost.
  - Added the required column `gameCategoryId` to the `WaitingRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameTeam" ALTER COLUMN "score" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WaitingRoom" DROP CONSTRAINT "WaitingRoom_pkey",
DROP COLUMN "channelId",
ADD COLUMN     "gameCategoryId" INTEGER NOT NULL,
ADD CONSTRAINT "WaitingRoom_pkey" PRIMARY KEY ("userId", "gameCategoryId");
