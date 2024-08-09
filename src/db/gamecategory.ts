import { GameCategory, prisma } from "./prisma";

export async function getGameCategories(channelId: number): Promise<Array<GameCategory>> {
    return await prisma().gameCategory.findMany({
        where: {
            channelId,
        },
    })
}
export async function getFirstGameCategory(channelId: number): Promise<GameCategory | null> {
    return await prisma().gameCategory.findMany({
        where: {
            channelId,
        },
    }).then(categories => categories?.[0]);
}
export async function createGameCategory(channelId: number, name: string): Promise<GameCategory> {
    return await prisma().gameCategory.create({
        data: {
            name,
            channel: {
                connect: { id: channelId },
            },
        },
    })
}
