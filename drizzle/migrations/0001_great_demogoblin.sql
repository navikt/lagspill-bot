-- Tabellene stammer fra Prisma, som navnga sammensatte primærnøkler <tabell>_pkey.
-- Drizzle forventer sine egne navn (se meta/0001_snapshot.json). Uten dette vil
-- drizzle-kit generate se navnedrift og foreslå å droppe og gjenopprette nøklene.
-- RENAME CONSTRAINT er en ren metadataoperasjon og rører ingen data.
--
-- Tre tilfeller per tabell: Prisma-navn -> gi nytt navn. Ingen primærnøkkel
-- (ny, tom database) -> opprett. Allerede riktig navn -> ingenting.
DO $$ BEGIN
 IF EXISTS (
     SELECT 1 FROM pg_constraint
     WHERE conrelid = '"WaitingPerson"'::regclass
       AND contype = 'p' AND conname = 'WaitingPerson_pkey'
 ) THEN
     ALTER TABLE "WaitingPerson"
         RENAME CONSTRAINT "WaitingPerson_pkey" TO "WaitingPerson_userId_gameId_pk";
 ELSIF NOT EXISTS (
     SELECT 1 FROM pg_constraint
     WHERE conrelid = '"WaitingPerson"'::regclass AND contype = 'p'
 ) THEN
     ALTER TABLE "WaitingPerson"
         ADD CONSTRAINT "WaitingPerson_userId_gameId_pk" PRIMARY KEY("userId","gameId");
 END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (
     SELECT 1 FROM pg_constraint
     WHERE conrelid = '"_GameTeamToPerson"'::regclass
       AND contype = 'p' AND conname = '_GameTeamToPerson_AB_pkey'
 ) THEN
     ALTER TABLE "_GameTeamToPerson"
         RENAME CONSTRAINT "_GameTeamToPerson_AB_pkey" TO "_GameTeamToPerson_A_B_pk";
 END IF;
END $$;
