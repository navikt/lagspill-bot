/*
  Warnings:

  - You are about to drop the column `channelId` on the `Game` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_channelId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "channelId",
ADD COLUMN     "gameCategoryId" INTEGER;

-- CreateTable
CREATE TABLE "GameCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "channelId" INTEGER NOT NULL,

    CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_gameCategoryId_fkey" FOREIGN KEY ("gameCategoryId") REFERENCES "GameCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
