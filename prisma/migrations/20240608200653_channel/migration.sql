/*
  Warnings:

  - You are about to drop the column `channelId` on the `GameTeam` table. All the data in the column will be lost.
  - The primary key for the `WaitingRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `channelId` on the `Game` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "channelId",
ADD COLUMN     "channelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "GameTeam" DROP COLUMN "channelId";

-- AlterTable
ALTER TABLE "WaitingRoom" DROP CONSTRAINT "WaitingRoom_pkey",
ALTER COLUMN "channelId" SET DATA TYPE TEXT,
ADD CONSTRAINT "WaitingRoom_pkey" PRIMARY KEY ("userId", "channelId");

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
