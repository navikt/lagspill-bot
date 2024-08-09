import { App } from '../app'
import {
    getActiveGame,
    getGameCategories,
    getOpenGame,
    getOrCreateChannel,
} from '../../db'
import { botLogger } from '../bot-logger'
import {GameCategory} from ".prisma/client";
import {
    deleteGameActionElement,
    finishGameActionElement,
    newGameActionElement, newGameCategoryActionElement,
    startGameActionElement
} from "../../bot/messages/message-actions";

export function configureCommandsHandler(app: App): void {
    // /helsesjekk create-game
    app.command(/(.*)/, async ({ command, ack, respond }) => {
        console.log(`User wants to create game for slack channel ${command.channel_id}`)
        botLogger.info(`User wants to create game for slack channel ${command.channel_id}`)

        const channel = await getOrCreateChannel(command.channel_id, command.channel_name);
        botLogger.info('channel')
        botLogger.info(channel)
        const gameCategories = await getGameCategories(channel.id) || [];
        botLogger.info('gameCategores')
        botLogger.info(gameCategories)
        if(!gameCategories?.length) {
            botLogger.info('no gamecategories')
            await ack()
            await respond({
                text: 'Det finnes ingen spillkategorier i denne kanalen. Lag en ny',
                blocks: [
                    {
                        type: 'actions',
                        elements: [ newGameCategoryActionElement() ]
                    }
                ]

            })
            return;
        }
        const gameCategoryPromises = gameCategories.map(cat => getActionElementsForGameCategory(cat));
        const allBlocks = await Promise.all(gameCategoryPromises).then(e => e.flat())
        await ack();

        await respond({
            text: 'Lagspill',
            blocks: [
                {
                    type: 'actions',
                    elements: [ newGameCategoryActionElement() ]
                },
                ...allBlocks
            ]
        })

    })
}
async function getActionElementsForGameCategory(gameCategory: GameCategory) {

        const openGame = await getOpenGame(gameCategory.id);
        const activeGame = await getActiveGame(gameCategory.id);
        let actionBlockElements = [];
        if(!openGame && !activeGame) {
            actionBlockElements = [...actionBlockElements, newGameActionElement(gameCategory)]
        } else if(openGame) {
            actionBlockElements = [...actionBlockElements, startGameActionElement(openGame), deleteGameActionElement(openGame)]
        } else if(activeGame) {
            actionBlockElements = [...actionBlockElements, finishGameActionElement(activeGame), deleteGameActionElement(activeGame)]
        }
        return [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `${gameCategory.name}`,
                },
            },
            {
                type: 'actions',
                elements: actionBlockElements
            }
        ]
}