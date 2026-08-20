import { and, eq } from 'drizzle-orm'

import { db, gameTeamMembers, gameTeams, persons, type GameTeam, type Person } from './drizzle'

export interface GameTeamWithMembers extends GameTeam {
    members: Person[]
}

async function getTeamMembers(gameTeamId: number): Promise<Person[]> {
    return db()
        .select({
            id: persons.id,
            slackUserId: persons.slackUserId,
            name: persons.name,
            displayName: persons.displayName,
            anonymous: persons.anonymous,
        })
        .from(gameTeamMembers)
        .innerJoin(persons, eq(persons.id, gameTeamMembers.personId))
        .where(eq(gameTeamMembers.gameTeamId, gameTeamId))
}

export async function getGameTeamWithTeamMembers(gameTeamId: number): Promise<GameTeamWithMembers | null> {
    const [team] = await db().select().from(gameTeams).where(eq(gameTeams.id, gameTeamId)).limit(1)
    if (!team) {
        return null
    }
    return {
        ...team,
        members: await getTeamMembers(gameTeamId),
    }
}
export async function newGameTeam(gameId: number, memberIds: {id: number}[]): Promise<GameTeamWithMembers> {
    const [team] = await db()
        .insert(gameTeams)
        .values({
            gameId,
        })
        .returning()
    if (!team) {
        throw new Error('Failed to create game team')
    }

    if (memberIds.length > 0) {
        await db().insert(gameTeamMembers).values(
            memberIds.map((member) => ({
                gameTeamId: team.id,
                personId: member.id,
            })),
        )
    }

    return {
        ...team,
        members: await getTeamMembers(team.id),
    }
}
export async function updateScoreAndPlacement(gameTeamId: number, score: number, placement: number): Promise<GameTeamWithMembers> {
    const [team] = await db()
        .update(gameTeams)
        .set({
            score,
            placement,
        })
        .where(eq(gameTeams.id, gameTeamId))
        .returning()
    if (!team) {
        throw new Error('Failed to update game team')
    }
    return {
        ...team,
        members: await getTeamMembers(gameTeamId),
    }
}