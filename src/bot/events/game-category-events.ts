import {App} from "../../bot/app";
import {createGameCategory, getChannel } from "../../db";
import {newGameCategoryModal, submitNewGameCategoryCallbackId} from "../../bot/modals/new-game-category-modal";
import {newGameCategoryActionId} from "../../bot/messages/message-actions";

export function configureGameCategoryEventsHandler(app: App): void {
    app.action(newGameCategoryActionId, async ({ack, body, client}) => {

        const slackChannelId = body.channel?.id ?? ''
        await ack()
        await client.views.open({
            trigger_id: body.trigger_id,
            view: newGameCategoryModal(slackChannelId),
        })
    })
    app.view( submitNewGameCategoryCallbackId, async ({ack, body, view, client}) => {
        const slackChannelId = body.view.private_metadata;
        const slackUserId = body.user?.id;
        const categoryName = view.state.values.name.input.value
        if (!categoryName) {
            client.chat.postEphemeral({
                text: 'Spillkategorien må ha et navn, prøv på nytt.',
                channel: slackChannelId,
                user: slackUserId
            })
            return;
        }
        const channel = await getChannel(slackChannelId);
        if(!channel) {
            throw new Error(`Fant ikke channel for slackChannelId: ${slackChannelId}`)
        }
        await createGameCategory(channel.id, categoryName);


        await ack()
        client.chat.postEphemeral({
            text: 'Du har laget en spillkategori! Bruk kommandoen /lagspill for å starte et nytt spill',
            channel: slackChannelId,
            user: slackUserId
        })

    })
}