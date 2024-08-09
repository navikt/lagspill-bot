/*
  Warnings:

  - You are about to drop the column `active` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `Game` table. All the data in the column will be lost.
  - The `status` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPEN', 'ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "active",
DROP COLUMN "completed",
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'OPEN';
