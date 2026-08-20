-- Baseline migration — tables already exist in production, all statements are idempotent
CREATE TYPE IF NOT EXISTS "public"."Status" AS ENUM('OPEN', 'ACTIVE', 'CLOSED');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Channel" (
	"id" serial PRIMARY KEY NOT NULL,
	"slackChannelId" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GameCategory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"channelId" integer NOT NULL,
	"gamelink" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_GameTeamToPerson" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_GameTeamToPerson_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GameTeam" (
	"id" serial PRIMARY KEY NOT NULL,
	"gameId" integer NOT NULL,
	"score" integer,
	"placement" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Game" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "Status" DEFAULT 'OPEN' NOT NULL,
	"gameCategoryId" integer NOT NULL,
	"date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Person" (
	"id" serial PRIMARY KEY NOT NULL,
	"slackUserId" text NOT NULL,
	"name" text,
	"displayName" text,
	"anonymous" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WaitingPerson" (
	"userId" integer NOT NULL,
	"gameId" integer NOT NULL,
	"isAtOffice" boolean NOT NULL,
	CONSTRAINT "WaitingPerson_pkey" PRIMARY KEY("userId","gameId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_channelId_Channel_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."Channel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_GameTeamToPerson" ADD CONSTRAINT "_GameTeamToPerson_A_GameTeam_id_fk" FOREIGN KEY ("A") REFERENCES "public"."GameTeam"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_GameTeamToPerson" ADD CONSTRAINT "_GameTeamToPerson_B_Person_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GameTeam" ADD CONSTRAINT "GameTeam_gameId_Game_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Game" ADD CONSTRAINT "Game_gameCategoryId_GameCategory_id_fk" FOREIGN KEY ("gameCategoryId") REFERENCES "public"."GameCategory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
