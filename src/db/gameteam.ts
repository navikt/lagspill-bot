import { prisma, GameTeam } from './prisma'
import {Game} from ".prisma/client";

export async function getGameTeamWithTeamMembers(gameTeamId: number): Promise<GameTeam> {
    return await prisma().gameTeam.findUnique({
        where: {
            id: gameTeamId
        },
        include: {
            members: {
                select: { name: true }
            }
        }
    })
}
export async function newGameTeam(gameId: number, memberIds: {id: number}[]): Promise<GameTeam> {
    return await prisma().gameTeam.create({
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
                select: { name: true }
            }
        }
    })
}
export async function updateScore(gameTeamId: number, score: number): Promise<GameTeam> {
    return await prisma().gameTeam.update({
        where: { id: gameTeamId },
        data: {
            score
        },
    })
}

export async function getGameTeamsSortedByScoreFromGame(game: Game): Promise<GameTeam[]> {
    const teamsPromises = game.teams.map( (team: {id: number}) => getGameTeamWithTeamMembers(team.id));
    const teams = await Promise.all(teamsPromises);
    return teams.sort((a: GameTeam, b: GameTeam) => b.score - a.score)
}
