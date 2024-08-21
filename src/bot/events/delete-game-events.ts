import {botLogger} from "../../bot/bot-logger";
import {deleteGameWithId, getGameById} from "../../db";
import {App} from "../../bot/app";
import {deleteGameActionId} from "../../bot/messages/message-actions";

export function configureDeleteGameEventsHandler(app: App): void {
    app.action(deleteGameActionId, async ({ack, body, client}) => {
        botLogger.info('Sletter spill')
        const slackChannelId = body.channel?.id ?? ''
        const userId = body.user.id
        const bodyAction = body.actions?.find(action => action.action_id === deleteGameActionId);
        const gameIdString = bodyAction?.value || ''
        const gameId = Number.parseInt(gameIdString);
        const game = await getGameById(gameId)
        if (!game) {
            botLogger.error(`Could not find gameid in action: ${JSON.stringify(bodyAction)}`)
            await ack()
            await client.chat.postEphemeral({
                channel: slackChannelId,
                text: 'Fant ikke spillet du prøver å slette',
                user: userId,
            })
            return
        }

        await deleteGameWithId(game.id);
        await ack()
        await client.chat.postEphemeral({
            channel: slackChannelId,
            text: 'Spillet er slettet. Du kan nå starte et nytt spill ved å bruke kommandoen "/lagspill"',
            user: userId,
        })
    })
}