import {prisma, Channel} from "./prisma";

async function createNewChannel(slackChannelId: string, channelName: string): Promise<Channel> {
    return await prisma().channel.create({
        data: {slackChannelId, name: channelName},
    })
}
export async function getChannel(slackChannelId: string): Promise<Channel | null> {
    return await prisma().channel.findFirst({where: {slackChannelId}});

}
export async function getOrCreateChannel(slackChannelId: string, channelName: string): Promise<Channel> {
    const channel  = await prisma().channel.findFirst({where: {slackChannelId}})
    console.log('found channel', channel)
    if(channel) return channel;
    return createNewChannel(slackChannelId, channelName);

}
