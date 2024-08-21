/*
  Warnings:

  - Added the required column `gameId` to the `WaitingPerson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WaitingPerson" ADD COLUMN     "gameId" INTEGER NOT NULL;
