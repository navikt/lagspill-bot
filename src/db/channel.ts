import { eq } from 'drizzle-orm'

import { db, channels, type Channel } from './drizzle'

async function createNewChannel(slackChannelId: string, channelName: string): Promise<Channel> {
    const [channel] = await db().insert(channels).values({ slackChannelId, name: channelName }).returning()
    if (!channel) {
        throw new Error('Failed to create channel')
    }
    return channel
}
export async function getChannel(slackChannelId: string): Promise<Channel | null> {
    const [channel] = await db()
        .select()
        .from(channels)
        .where(eq(channels.slackChannelId, slackChannelId))
        .limit(1)
    return channel ?? null
}
export async function getOrCreateChannel(slackChannelId: string, channelName: string): Promise<Channel> {
    const channel = await getChannel(slackChannelId)
    if (channel) return channel
    return createNewChannel(slackChannelId, channelName);
}
