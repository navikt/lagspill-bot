import {Block, KnownBlock} from "@slack/types";
import {Game} from ".prisma/client";

export const signUpForGameActionId = 'sign-up-for-game';
export function signUpForGame(game: Game): (KnownBlock | Block)[] {
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `Et nytt parti timeguesser er åpnet for påmelding! :wave:`,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Meld deg på her.',
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    action_id: signUpForGameActionId,
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Meld meg på',
                    },
                    style: 'primary',
                    value: `${game.id}`,
                },
            ],
        }
    ]
}
