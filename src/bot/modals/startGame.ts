import { ModalView } from '@slack/bolt'
import { WaitingPerson } from '.prisma/client'
import {botLogger} from "../../bot/bot-logger";

export const submitStartGameCallbackId = 'submit-start-game'
export function startGameModal(slackChannelId: string, gameId: number, waitingPeople: WaitingPerson[]): ModalView {
    botLogger.info('botlogger')
    botLogger.info(waitingPeople)
    const antallDigitalePåmeldte = waitingPeople.filter(person => !person.isAtOffice).length
    const antallFysiskPåmeldte = waitingPeople.filter(person => person.isAtOffice).length
    return {
        type: 'modal',
        callback_id: submitStartGameCallbackId,
        title: {
            type: 'plain_text',
            text: `Start spill`,
            emoji: true,
        },
        submit: {
            type: 'plain_text',
            text: 'Start',
            emoji: true,
        },
        close: {
            type: 'plain_text',
            text: 'Avbryt',
            emoji: true,
        },
        private_metadata: `${slackChannelId}:${gameId}`,
        blocks: [
            {
                type: 'input',
                block_id: 'antall_fysiske_lag',
                element: {
                    type: 'number_input',
                    is_decimal_allowed: false,
                    action_id: 'input',
                    min_value: '0',
                    max_value: '6',
                },
                label: {
                    type: 'plain_text',
                    text: `Antall lag på kontoret (${antallFysiskPåmeldte} påmeldte)`,
                    emoji: true,
                },
            },
            {
                type: 'input',
                block_id: 'antall_digitale_lag',
                element: {
                    type: 'number_input',
                    is_decimal_allowed: false,
                    action_id: 'input',
                    min_value: '0',
                    max_value: '6',
                },
                label: {
                    type: 'plain_text',
                    text: `Antall digitale lag (${antallDigitalePåmeldte} påmeldte)`,
                    emoji: true,
                },
            },
        ],
    }
}
