import { and, eq } from 'drizzle-orm'

import { db, gameTeamMembers, gameTeams, games, persons, type GameTeam, type Person } from './drizzle'

export async function getOrCreatePerson(slackUserId: string): Promise<Person> {
    const [person] = await db().select().from(persons).where(eq(persons.slackUserId, slackUserId)).limit(1)
    if (person) return person

    const [created] = await db().insert(persons).values({ slackUserId }).returning()
    if (!created) {
        throw new Error('Failed to create person')
    }
    return created
}
export async function getPerson(slackUserId: string): Promise<Person | null> {
    const [person] = await db().select().from(persons).where(eq(persons.slackUserId, slackUserId)).limit(1)
    return person ?? null
}
export async function updatePersonDisplayName(personId: number, displayName: string): Promise<void> {
    await db().update(persons).set({ displayName }).where(eq(persons.id, personId))
}
export async function getAllGameTeamsForPersonInGameCategory(personId: number, gameCategoryId: number): Promise<Array<GameTeam>> {
    const rows = await db()
        .select({
            id: gameTeams.id,
            gameId: gameTeams.gameId,
            score: gameTeams.score,
            placement: gameTeams.placement,
        })
        .from(gameTeamMembers)
        .innerJoin(gameTeams, eq(gameTeams.id, gameTeamMembers.gameTeamId))
        .innerJoin(games, eq(games.id, gameTeams.gameId))
        .where(and(eq(gameTeamMembers.personId, personId), eq(games.gameCategoryId, gameCategoryId)))

    const uniqueTeams = new Map<number, GameTeam>()
    for (const row of rows) {
        uniqueTeams.set(row.id, row)
    }
    return Array.from(uniqueTeams.values())
}
