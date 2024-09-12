import { App } from '../../bot/app'
import {botLogger} from "../../bot/bot-logger";
import {
    finishGameWithId, getActiveGameById,
    getGameTeamWithTeamMembers,
    getGameWithGameTeams,
    updateScoreAndPlacement
} from "../../db";
import {postGameResultsBlocks} from "../../bot/messages/post-game-teams";
import {finishGameActionId} from "../../bot/messages/message-actions";
import {finishGameModal, submitFinishGameCallbackId} from "../../bot/modals/finish-game-modal";
import {getIdFromMessageAction} from "../../utils/app-actions";
import {getFromMetaData} from "../../utils/metadata";

export function configureFinishGameEventsHandler(app: App): void {
    //Button click action
    app.action(finishGameActionId, async ({client, body, ack}) => {
        const slackChannelId = body.channel?.id ?? ''
        const slackUserId = body.user.id
        const gameId = getIdFromMessageAction(body, finishGameActionId);
        if(!gameId) {
            throw new Error('gameid not found in action finishgameaction')
        }
        const game = await getActiveGameById(gameId)
        if(!game){
            await ack()
            await client.chat.postEphemeral({
                channel: slackChannelId,
                text: 'Fant ikke spillet du prøver å fullføre',
                user: slackUserId,
            })
            return
        }
        const gameWithGameTeams = await getGameWithGameTeams(game.id);
        const getTeamMembersPromiseList = gameWithGameTeams.teams.map(team => getGameTeamWithTeamMembers(team.id));
        const teamsWithMembers = await Promise.all(getTeamMembersPromiseList);


        await ack()
        await client.views.open({
            trigger_id: body.trigger_id,
            view: finishGameModal(slackChannelId, gameId, teamsWithMembers),
        })
    })
    //Modal submit
    app.view(submitFinishGameCallbackId, async ({body, view, ack, client}) => {
        const {slackChannelId, gameId} = getFromMetaData(body);
        const slackUserId = body.user.id
        if(Number.isNaN(gameId)) {
            botLogger.error(`Could not find gameid in submitFinishGameCallbackId`)
            await ack()
            return
        }
        const teamScores = view.state.values;
        const gameTeamIds = Object.keys(teamScores);
        const sortedScoresWithIds: {id: number, score: number}[] = gameTeamIds.map(idStr => {
            const id = Number.parseInt(idStr);
            const score = Number.parseInt(teamScores[idStr].score.value);
            return {id, score};
        }).sort((a, b) => b.score - a.score)
        botLogger.info('sortedScoresWithIds')
        botLogger.info(sortedScoresWithIds)
        const gameTeamPromises = sortedScoresWithIds.map((idAndScore, index) => {
            botLogger.info(`update score for gameTeam ${idAndScore.id}, score: ${idAndScore.score}`)
            return updateScoreAndPlacement(idAndScore.id, idAndScore.score, index + 1);
        })
        const updatedGameTeams = await Promise.all(gameTeamPromises);
        botLogger.info(updatedGameTeams)
        await finishGameWithId(gameId);

        await ack()
        await client.chat.postEphemeral({
            channel: slackChannelId,
            text: 'Takk, spillet er fullført. Start et nytt spill med kommandoen /lagspill',
            user: slackUserId,
        })
        botLogger.info('updatedGameTeams')
        botLogger.info(updatedGameTeams)
        await client.chat.postMessage({
            channel: slackChannelId,
            blocks: postGameResultsBlocks(updatedGameTeams),
        })
    })
}
