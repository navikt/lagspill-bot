/*
  Warnings:

  - You are about to drop the `WaitingRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WaitingRoom";

-- CreateTable
CREATE TABLE "WaitingPerson" (
    "userId" INTEGER NOT NULL,
    "gameCategoryId" INTEGER NOT NULL,
    "isAtOffice" BOOLEAN NOT NULL,

    CONSTRAINT "WaitingPerson_pkey" PRIMARY KEY ("userId","gameCategoryId")
);
