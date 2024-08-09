import { prisma, Game } from './prisma'
import {GameTeam} from ".prisma/client";

export async function createNewGame(gameCategoryId: number): Promise<Game> {
    return prisma().game.create({
        data: {
            gameCategory: {
                connect: { id: gameCategoryId },
            },
        },
    })
}

export async function finishGameWithId(gameId: number): Promise<void> {
    await prisma().game.update({
        where: { id: gameId },
        data: { status: 'CLOSED' },
    })
}

export async function startGameWithId(gameId: number): Promise<void> {
    await prisma().game.update({
        where: { id: gameId },
        data: { status: 'ACTIVE' },
    })
}
export async function deleteGameWithId(gameId: number): Promise<void> {
    await prisma().game.delete({
        where: { id: gameId },
    })
}
export async function getOpenGame(gameCategoryId: number): Promise<Game | null> {
    return prisma().game.findFirst({
        where: { gameCategoryId, status: 'OPEN' },
    })
}
export async function getOpenGameById(gameId: number): Promise<Game | null> {
    return prisma().game.findUnique({
        where: { id: gameId, status: 'OPEN' },
    })
}
export async function getActiveGame(gameCategoryId: number): Promise<Game | null> {
    return prisma().game.findFirst({
        where: { gameCategoryId, status: 'ACTIVE' },
    })
}
export async function getActiveGameById(gameId: number): Promise<Game | null> {
    return prisma().game.findUnique({
        where: { id: gameId, status: 'ACTIVE' },
    })
}
export async function getGameById(gameId: number): Promise<Game | null> {
    return prisma().game.findUnique({
        where: { id: gameId },
    })
}

export async function getGameWithGameTeams(gameId: number): Promise<Game | null> {
    return prisma().game.findFirst({
        where: { id: gameId },
        include: {
            teams: {
                select: { id: true }
            }
        }
    })
}

export async function getActiveGameByGameId(gameId: number): Promise<Game | null> {
    return prisma().game.findFirst({
        where: { id: gameId, status: 'ACTIVE' },
    })
}

export async function addTeamsToGame(gameId: number, teamIds: {id: number}[]): Promise<void> {
   await prisma().game.update({
       where: { id: gameId },
       data: {
           teams: {
               connect: teamIds
           }
       }
   })
}
