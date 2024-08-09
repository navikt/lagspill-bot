/*
  Warnings:

  - You are about to drop the column `waitingRoomId` on the `Person` table. All the data in the column will be lost.
  - The primary key for the `WaitingRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `WaitingRoom` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `WaitingRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAtOffice` to the `WaitingRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WaitingRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_waitingRoomId_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "waitingRoomId";

-- AlterTable
ALTER TABLE "WaitingRoom" DROP CONSTRAINT "WaitingRoom_pkey",
DROP COLUMN "id",
ADD COLUMN     "channelId" INTEGER NOT NULL,
ADD COLUMN     "isAtOffice" BOOLEAN NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "WaitingRoom_pkey" PRIMARY KEY ("userId", "channelId");
