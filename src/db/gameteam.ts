import { prisma, GameTeam } from './prisma'
import { Person } from '.prisma/client'

export interface GameTeamWithMemberNames extends GameTeam {
    members: Pick<Person, 'displayName'>[];
}
export async function getGameTeamWithTeamMembers(gameTeamId: number): Promise<GameTeamWithMemberNames | null> {
    return prisma().gameTeam.findUnique({
        where: {
            id: gameTeamId
        },
        include: {
            members: {
                select: { displayName: true }
            }
        }
    })
}
export async function newGameTeam(gameId: number, memberIds: {id: number}[]): Promise<GameTeam> {
    return prisma().gameTeam.create({
        data: {
            game: {
                connect: { id: gameId },
            },
            members: {
                connect: memberIds
            }
        },
        include: {
            members: {
                select: { displayName: true }
            }
        }
    })
}
export async function updateScoreAndPlacement(gameTeamId: number, score: number, placement: number): Promise<GameTeam> {
    return prisma().gameTeam.update({
        where: { id: gameTeamId },
        data: {
            score,
            placement
        },
        include: {
            members: {
                select: { displayName: true }
            }
        }
    })
}