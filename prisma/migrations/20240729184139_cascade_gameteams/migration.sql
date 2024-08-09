-- DropForeignKey
ALTER TABLE "GameTeam" DROP CONSTRAINT "GameTeam_gameId_fkey";

-- AddForeignKey
ALTER TABLE "GameTeam" ADD CONSTRAINT "GameTeam_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
