-- AlterTable
ALTER TABLE "public"."_GameTeamToPerson" ADD CONSTRAINT "_GameTeamToPerson_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_GameTeamToPerson_AB_unique";
