import {ModalView, Option} from "@slack/bolt";
import {gameAndChannelInMetadata} from "../../utils/metadata";

export const submitSignupToGameCallbackId = 'submit-signup-to-game';
export function signupModal(
    slackChannelId: string,
    gameId: number,
): ModalView {
    return {
        type: 'modal',
        callback_id: submitSignupToGameCallbackId,
        title: {
            type: 'plain_text',
            text: `Meld deg på`,
            emoji: true,
        },
        submit: {
            type: 'plain_text',
            text: 'Meld meg på',
            emoji: true,
        },
        close: {
            type: 'plain_text',
            text: 'Avbryt',
            emoji: true,
        },
        private_metadata: gameAndChannelInMetadata(slackChannelId, gameId),
        blocks: [
            {
                type: 'input',
                block_id: 'isAtTheOffice',
                label: {
                    type: 'plain_text',
                    text: `Si ifra hvis du er fysisk tilstede på kontoret slik at du kan havne på lag med andre som også er på kontoret.`,
                },
                element: {
                    action_id: 'checkbox',
                    type: 'radio_buttons',
                    initial_option: undefined,
                    options: [radioOptionJa, radioOptionNei],
                },
            }
        ]
    }
}
const radioOptionJa: Option = {
    value: 'ja',
    text: {
        type: 'plain_text',
        text: 'Jeg er fysisk'
    }
}
const radioOptionNei: Option = {
    value: 'nei',
    text: {
        type: 'plain_text',
        text: 'Jeg er digital'
    }
}
