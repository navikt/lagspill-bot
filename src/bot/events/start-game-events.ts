import {App} from "../../bot/app";
import {botLogger} from "../../bot/bot-logger";
import {
    addTeamsToGame,
    getOpenGameById,
    getPeopleInWaitingRoom,
    newGameTeam, startGameWithId
} from "../../db";
import {startGameModal, submitStartGameCallbackId} from "../../bot/modals/startGame";
import {getFromMetaData} from "../../utils/metadata";
import {generateRandomTeams} from "../../utils/teamgenerator";
import {postGameTeamsMessageBlocks} from "../../bot/messages/post-game-teams";
import { startGameActionId} from "../../bot/messages/message-actions";
import {getIdFromMessageAction} from "../../utils/app-actions";

export function configureStartGameEventsHandler(app: App): void {
    app.action(startGameActionId, async ({ ack, body, client }) => {
        botLogger.info('Starter et spill')
        const slackChannelId = body.channel?.id ?? ''
        const slackUserId = body.user.id
        const gameId = getIdFromMessageAction(body, startGameActionId);
        if(!gameId) {
            throw new Error('gameid not found in action finishgameaction')
        }
        const game = await getOpenGameById(gameId)
        if(!game){
            await ack()
            await client.chat.postEphemeral({
                channel: slackChannelId,
                text: 'Fant ikke spillet du prøver å starte. Bruk kommandoen /lagspill for å sekke mulighetene dine',
                user: slackUserId,
            })
            return
        }

        await ack()

        const waitingRoom = await getPeopleInWaitingRoom(game.id)

        await client.views.open({
            trigger_id: body.trigger_id,
            view: startGameModal(slackChannelId, game.id, waitingRoom),
        })
    })
    app.view(submitStartGameCallbackId, async ({ ack, view, body, client }) => {
        const { slackChannelId, gameId } = getFromMetaData(body);
        const game = await getOpenGameById(gameId)
        if (!game) {
            botLogger.error(`submitStartgameGameCallback - No game for game: ${gameId}`)
            throw new Error('No game')
        }
        botLogger.info('open game')
        botLogger.info(game)
        const participants = await getPeopleInWaitingRoom(game.id)
        const inputPhysical = view.state.values.antall_fysiske_lag.input.value || '';
        const inputDigital = view.state.values.antall_digitale_lag.input.value || '';
        const numberOfPhysicalTeams = Number.parseInt(inputPhysical);
        const numberOfDigitalTeams = Number.parseInt(inputDigital);
        if(Number.isNaN(numberOfPhysicalTeams) || Number.isNaN(numberOfDigitalTeams)) {
            botLogger.error(`invalid input for number of teams. physical: ${inputPhysical}, digital: ${inputDigital}`)
            throw new Error('invalid input for number of teams')
        }

        const physicalTeams = generateRandomTeams(numberOfPhysicalTeams, participants.filter(participant => participant.isAtOffice))
        const digitalTeams = generateRandomTeams(numberOfDigitalTeams, participants.filter(participant => !participant.isAtOffice))
        const gameTeamsPromises = [...physicalTeams, ...digitalTeams]
            .map(team => {
                const teamUserIds = team.map(waitingPerson => ({id: waitingPerson.userId}));
                return newGameTeam(game.id, teamUserIds)
            });
        const gameTeams = await Promise.all(gameTeamsPromises);
        const gameTeamIds = gameTeams.map(team => ({id: team.id}))
        await addTeamsToGame(game.id, gameTeamIds)
        await startGameWithId(game.id)
        await ack()
        await client.chat.postMessage({
            channel: slackChannelId,
            blocks: postGameTeamsMessageBlocks(gameTeams, game.gameCategory?.gamelink),
        })

    })
}
