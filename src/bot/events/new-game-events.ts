import { App } from '../../bot/app'
import { botLogger } from '../../bot/bot-logger'
import {
    addPersonToWaitingRoom,
    getOrCreatePerson, createNewGame, getOpenGameById
} from '../../db'
import { signUpForGame, signUpForGameActionId} from '../../bot/messages/sign-up-for-game'
import { signupModal, submitSignupToGameCallbackId } from '../../bot/modals/signupModal'
import {newGameActionId} from "../../bot/messages/message-actions";
import {getIdFromMessageAction} from "../../utils/app-actions";
import {getFromMetaData} from "../../utils/metadata";

export function configureSignupEventsHandler(app: App): void {
    app.action(newGameActionId, async ({ ack, body, client }) => {

        botLogger.info('New game')

        const slackChannelId = body.channel?.id ?? ''
        if (!slackChannelId) {
            throw new Error(`Missing channel id`)
        }
        const gameCategoryId = getIdFromMessageAction(body, newGameActionId)
        if(!gameCategoryId){
            throw new Error(`Missing gamecategoryid id in newGameActionId handler`)
        }
        const game = await createNewGame(gameCategoryId);
        await ack()
        await client.chat.postMessage({
            text: `Noen har startet et spill!`,
            channel: slackChannelId,
            blocks: [
                ...signUpForGame(game)
            ],
        })

        await ack()
    })
    // handle signup action
    app.action(signUpForGameActionId, async ({ ack, body, client }) => {
        const userId = body.user.id
        const slackChannelId = body.channel?.id ?? ''
        const gameId = getIdFromMessageAction(body, signUpForGameActionId)
        if(!gameId) {
            throw new Error('no gameid for signupforgameactionid')
        }
        const game = await getOpenGameById(gameId)
        if (!game) {
            botLogger.error(`No game for gameId: ${gameId}`)
            await client.chat.postEphemeral({
                text: 'Fant ikke spill. Start et nytt spill med kommandown /lagspill.',
                channel: slackChannelId,
                user: userId,
            })
        }

        await ack()

        // Åpne modal for påmelding
        await client.views.open({
            trigger_id: body.trigger_id,
            view: signupModal(slackChannelId, gameId),
        })
    })

    app.view(submitSignupToGameCallbackId, async ({ ack, view, body, client }) => {
        const { slackChannelId, gameId} = getFromMetaData(body)
        if(Number.isNaN(gameId)) {
            botLogger.error(`parseInt error: ${gameId}`)
            throw new Error('parseInt Error')
        }

        const game = await getOpenGameById(gameId)
        if (!game) {
            botLogger.error(`Game not found for gameId: ${gameId}`)
            throw new Error('Missing channel')
        }

        const slackUserId = body.user.id
        const slackUserName = body.user.name
        const isAtTheOfficeText = view.state.values?.isAtTheOffice?.checkbox?.selected_option?.value || ''
        const isAtTheOffice = isAtTheOfficeText === 'ja'
        const person = await getOrCreatePerson(slackUserId, slackUserName)
        await addPersonToWaitingRoom(person.id, game.gameCategoryId, game.id, isAtTheOffice)

        await ack()
        await client.chat.postEphemeral({
            channel: slackChannelId,
            text: 'Du er påmeldt! Når spillet startes vil det sendes en melding i denne kanalen med laginndeling.',
            user: slackUserId,
        })
    })
}
