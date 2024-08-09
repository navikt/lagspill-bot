import {SlackViewAction} from "@slack/bolt";

type SlackChannelIdAndGameId = {
    slackChannelId: string;
    gameId: number;
}
export function getFromMetaData(body: SlackViewAction): SlackChannelIdAndGameId {
    const [slackChannelId, gameIdString] = body?.view?.private_metadata?.split(':')
    const gameId = Number.parseInt(gameIdString);
    return { slackChannelId, gameId }
}
export function gameAndChannelInMetadata(slackChannelId: string, gameId: number) {
   return `${slackChannelId}:${gameId}`
}