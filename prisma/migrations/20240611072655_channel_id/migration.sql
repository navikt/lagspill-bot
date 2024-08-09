/*
  Warnings:

  - The primary key for the `WaitingRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `channelId` on the `WaitingRoom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WaitingRoom" DROP CONSTRAINT "WaitingRoom_pkey",
DROP COLUMN "channelId",
ADD COLUMN     "channelId" INTEGER NOT NULL,
ADD CONSTRAINT "WaitingRoom_pkey" PRIMARY KEY ("userId", "channelId");
