import {ModalView} from "@slack/bolt";
export const submitNewGameCategoryCallbackId = 'submit-new-game-category';
export function newGameCategoryModal(
    slackChannelId: string,
): ModalView {
    return {
        type: 'modal',
        callback_id: submitNewGameCategoryCallbackId,
        title: {
            type: 'plain_text',
            text: `Ny spillkategori`,
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
        private_metadata: slackChannelId,
        blocks: [
            {
                type: 'input',
                block_id: 'name',
                element: {
                    type: 'plain_text_input',
                    action_id: 'input',
                },
                label: {
                    type: 'plain_text',
                    text: `Hva skal spillet hete?`,
                    emoji: true,
                },
            },
        ]
    }
}
