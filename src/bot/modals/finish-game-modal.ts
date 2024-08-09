import {ModalView} from "@slack/bolt";
import {gameAndChannelInMetadata} from "../../utils/metadata";
import {Block, KnownBlock} from "@slack/types";
import {getTeamMembersString} from "../../utils/gameteam";
import {GameTeam} from ".prisma/client";
export const submitFinishGameCallbackId = 'submit-finish-game';

export function finishGameModal(
    slackChannelId: string,
    gameId: number,
    gameTeams: GameTeam[],
): ModalView {
    const gameTeamInputs: (Block | KnownBlock)[] = gameTeams.map(team => {
        const membersString = getTeamMembersString(team);
        return {
            type: 'input',
            block_id: `${team.id}`,
            element: {
                type: 'number_input',
                is_decimal_allowed: false,
                action_id: 'score',
                min_value: '0',
            },
            label: {
                type: 'plain_text',
                text: `Lag: ${membersString}`,
                emoji: true,
            },
        };
    })
    return {
        type: 'modal',
        callback_id: submitFinishGameCallbackId,
        title: {
            type: 'plain_text',
            text: `Avslutt spill`,
            emoji: true,
        },
        submit: {
            type: 'plain_text',
            text: 'Send inn',
            emoji: true,
        },
        close: {
            type: 'plain_text',
            text: 'Avbryt',
            emoji: true,
        },
        private_metadata: gameAndChannelInMetadata(slackChannelId, gameId),
        blocks: gameTeamInputs
    }
}
