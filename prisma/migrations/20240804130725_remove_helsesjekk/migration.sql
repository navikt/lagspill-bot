/*
  Warnings:

  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Asked` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_askedId_fkey";

-- DropForeignKey
ALTER TABLE "Asked" DROP CONSTRAINT "Asked_teamId_fkey";

-- DropTable
DROP TABLE "Answer";

-- DropTable
DROP TABLE "Asked";

-- DropTable
DROP TABLE "Team";
