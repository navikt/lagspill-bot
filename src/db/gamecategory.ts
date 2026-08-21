import { and, eq } from 'drizzle-orm'

import { db, gameCategories, channels, type GameCategory } from './drizzle'

export async function getGameCategories(channelId: number): Promise<Array<GameCategory>> {
    return db().select().from(gameCategories).where(and(eq(gameCategories.channelId, channelId)))
}
export async function getFirstGameCategory(channelId: number): Promise<GameCategory | null> {
    const [category] = await db()
        .select()
        .from(gameCategories)
        .where(eq(gameCategories.channelId, channelId))
        .limit(1)
    return category ?? null
}
export async function createGameCategory(channelId: number, name: string): Promise<GameCategory> {
    const [category] = await db()
        .insert(gameCategories)
        .values({
            name,
            channelId,
        })
        .returning()
    if (!category) {
        throw new Error('Failed to create game category')
    }
    return category
}
