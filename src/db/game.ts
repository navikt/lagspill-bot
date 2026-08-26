import { and, eq, gte, lt } from 'drizzle-orm'
import { subMonths } from 'date-fns'

import { db, gameCategories, gameTeamMembers, gameTeams, games, persons, type Game } from './drizzle'
import type { GameTeamWithMembers } from './gameteam'

export async function createNewGame(gameCategoryId: number): Promise<Game> {
   const [game] = await db()
       .insert(games)
       .values({
           gameCategoryId,
       })
       .returning()
   if (!game) {
       throw new Error('Failed to create game')
   }
   return game
}

export async function finishGameWithId(gameId: number): Promise<void> {
   await db().update(games).set({ status: 'CLOSED' }).where(eq(games.id, gameId))
}

export async function startGameWithId(gameId: number): Promise<void> {
   await db().update(games).set({ status: 'ACTIVE' }).where(eq(games.id, gameId))
}
export async function deleteGameWithId(gameId: number): Promise<void> {
   await db().delete(games).where(eq(games.id, gameId))
}
export async function getOpenGame(gameCategoryId: number): Promise<Game | null> {
   const [game] = await db()
       .select()
       .from(games)
       .where(and(eq(games.gameCategoryId, gameCategoryId), eq(games.status, 'OPEN')))
       .limit(1)
   return game ?? null
}
export type GameWithGameCategory = Game & {
   gameCategory: Pick<typeof gameCategories.$inferSelect, 'name' | 'gamelink'>
}

export async function getOpenGameById(gameId: number): Promise<GameWithGameCategory | null> {
   const [game] = await db()
       .select({
           id: games.id,
           status: games.status,
           gameCategoryId: games.gameCategoryId,
           date: games.date,
           name: gameCategories.name,
           gamelink: gameCategories.gamelink,
       })
       .from(games)
       .innerJoin(gameCategories, eq(gameCategories.id, games.gameCategoryId))
       .where(and(eq(games.id, gameId), eq(games.status, 'OPEN')))
       .limit(1)
   if (!game) {
       return null
   }
   return {
       id: game.id,
       status: game.status,
       gameCategoryId: game.gameCategoryId,
       date: game.date,
       gameCategory: {
           name: game.name,
           gamelink: game.gamelink,
       },
   }
}
export async function getActiveGame(gameCategoryId: number): Promise<Game | null> {
   const [game] = await db()
       .select()
       .from(games)
       .where(and(eq(games.gameCategoryId, gameCategoryId), eq(games.status, 'ACTIVE')))
       .limit(1)
   return game ?? null
}
export async function getActiveGameById(gameId: number): Promise<GameWithGameCategory | null> {
   const [game] = await db()
       .select({
           id: games.id,
           status: games.status,
           gameCategoryId: games.gameCategoryId,
           date: games.date,
           name: gameCategories.name,
           gamelink: gameCategories.gamelink,
       })
       .from(games)
       .innerJoin(gameCategories, eq(gameCategories.id, games.gameCategoryId))
       .where(and(eq(games.id, gameId), eq(games.status, 'ACTIVE')))
       .limit(1)
   if (!game) {
       return null
   }
   return {
       id: game.id,
       status: game.status,
       gameCategoryId: game.gameCategoryId,
       date: game.date,
       gameCategory: {
           name: game.name,
           gamelink: game.gamelink,
       },
   }
}
export async function getGameById(gameId: number): Promise<Game | null> {
   const [game] = await db().select().from(games).where(eq(games.id, gameId)).limit(1)
   return game ?? null
}

export async function getGameWithGameTeams(gameId: number): Promise<Game | null> {
   const game = await getGameById(gameId)
   if (!game) {
       return null
   }
   const teams = await db()
       .select({
           id: gameTeams.id,
       })
       .from(gameTeams)
       .where(eq(gameTeams.gameId, gameId))
   return {
       ...game,
       teams,
   }
}

export async function getActiveGameByGameId(gameId: number): Promise<Game | null> {
   const [game] = await db()
       .select()
       .from(games)
       .where(and(eq(games.id, gameId), eq(games.status, 'ACTIVE')))
       .limit(1)
   return game ?? null
}

export async function addTeamsToGame(gameId: number, teamIds: { id: number }[]): Promise<void> {
   if (teamIds.length === 0) return
   for (const { id } of teamIds) {
       await db().update(gameTeams).set({ gameId }).where(eq(gameTeams.id, id))
   }
}
export async function allGamesForPersonInGameCategory(personId: number, gameCategoryId: number): Promise<Array<Game>> {
   return db()
       .select({ id: games.id, status: games.status, gameCategoryId: games.gameCategoryId, date: games.date })
       .from(games)
       .innerJoin(gameTeams, eq(gameTeams.gameId, games.id))
       .innerJoin(gameTeamMembers, eq(gameTeamMembers.gameTeamId, gameTeams.id))
       .where(and(eq(gameTeamMembers.personId, personId), eq(games.gameCategoryId, gameCategoryId)))
}

export interface GameWithTeamsAndMembers extends Game{
   teams: GameTeamWithMembers[];
}
export async function getAllFinishedGamesForGameCategoryLastTwoMonths(gameCategoryId: number): Promise<Array<GameWithTeamsAndMembers>> {
   const twoMonthsAgo = subMonths(new Date(), 2);
   const finishedGames = await db()
       .select()
       .from(games)
       .where(and(eq(games.gameCategoryId, gameCategoryId), eq(games.status, 'CLOSED'), gte(games.date, twoMonthsAgo)))

   const result: GameWithTeamsAndMembers[] = []
   for (const game of finishedGames) {
       const teams = await db()
           .select()
           .from(gameTeams)
           .where(eq(gameTeams.gameId, game.id))
       const teamsWithMembers: GameTeamWithMembers[] = []
       for (const team of teams) {
           const members = await db()
               .select({
                   id: persons.id,
                   slackUserId: persons.slackUserId,
                   name: persons.name,
                   displayName: persons.displayName,
                   anonymous: persons.anonymous,
               })
               .from(gameTeamMembers)
               .innerJoin(persons, eq(persons.id, gameTeamMembers.personId))
               .where(eq(gameTeamMembers.gameTeamId, team.id))
           teamsWithMembers.push({ ...team, members })
       }
       result.push({ ...game, teams: teamsWithMembers })
   }
   return result
}

export async function getWinsForGameCategoryInYear(
   gameCategoryId: number,
   year: number,
): Promise<Array<GameWithTeamsAndMembers>> {
   const yearStart = new Date(year, 0, 1)
   const yearEnd = new Date(year + 1, 0, 1)

   const finishedGames = await db()
       .select()
       .from(games)
       .where(
           and(
               eq(games.gameCategoryId, gameCategoryId),
               eq(games.status, 'CLOSED'),
               gte(games.date, yearStart),
               lt(games.date, yearEnd),
           ),
       )

   const result: GameWithTeamsAndMembers[] = []
   for (const game of finishedGames) {
       const teams = await db().select().from(gameTeams).where(eq(gameTeams.gameId, game.id))
       const teamsWithMembers: GameTeamWithMembers[] = []
       for (const team of teams) {
           const members = await db()
               .select({
                   id: persons.id,
                   slackUserId: persons.slackUserId,
                   name: persons.name,
                   displayName: persons.displayName,
                   anonymous: persons.anonymous,
               })
               .from(gameTeamMembers)
               .innerJoin(persons, eq(persons.id, gameTeamMembers.personId))
               .where(eq(gameTeamMembers.gameTeamId, team.id))
           teamsWithMembers.push({ ...team, members })
       }
       result.push({ ...game, teams: teamsWithMembers })
   }
   return result
}
