import { App } from '../app'
import {
    getActiveGame,
    getAllFinishedGamesForGameCategoryLastTwoMonths,
    getGameCategories,
    getOpenGame,
    getOrCreateChannel,
    getPerson,
    getWinsForGameCategoryInYear,
} from '../../db'
import { botLogger } from '../bot-logger'
import {
    deleteGameActionElement,
    finishGameActionElement,
    newGameActionElement,
    newGameCategoryActionElement,
    startGameActionElement,
} from '../../bot/messages/message-actions'
import { ActionsBlockElement, Block } from '@slack/types'
import { mapGamesToPersonalStatsMap, PersonGameStats, topplisteBlocks } from '../../bot/messages/toppliste'
import { leaderboardBlocks } from '../../bot/messages/leaderboard'
import { computeCurrentMonthLeaders, computeMonthlyWinners } from '../../utils/leaderboard'
import { type GameCategory } from '../../db/drizzle'

export function configureCommandsHandler(app: App): void {
    // /helsesjekk create-game
    app.command(/(.*)/, async ({ command, ack, respond, client }) => {
        const channel = await getOrCreateChannel(command.channel_id, command.channel_name)
        const gameCategories = (await getGameCategories(channel.id)) || []
        if (command.text === 'min-statistikk') {
            //todo
            await ack()
            const person = await getPerson(command.user_id)
            if (!person) {
                await respond({
                    response_type: 'ephemeral',
                    text: 'fant ikke person',
                })
            }
            // const gameCategories = await getGameWithGameCategoriesForPerson(person.id);
            // const personalGameCategoryStatsBlocks = await getPersonalGameCategoryStatsBlocks(command.user_id)
            await respond({
                response_type: 'ephemeral',
                text: 'Din statistikk',
                // blocks: personalGameCategoryStatsBlocks
            })
            return
        } else if (command.text === 'toppliste') {
            for (const gameCategory of gameCategories) {
                const gamesWithTeams = await getAllFinishedGamesForGameCategoryLastTwoMonths(gameCategory.id)
                const stats = mapGamesToPersonalStatsMap(gamesWithTeams)
                const sortedTopFive: PersonGameStats[] = Array.from(stats.values())
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 4)
                const blocks = topplisteBlocks(sortedTopFive);
                await ack()
                await respond({
                    response_type: 'ephemeral',
                    text: 'Toppliste',
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: `Topp 5 siste to måneder`,
                                emoji: true,
                            },
                        },
                        ...blocks.flat(),
                    ],
                })
            }
            return;
        } else if (command.text === 'leaderboard') {
            await ack()
            if (!gameCategories.length) {
                await respond({
                    response_type: 'ephemeral',
                    text: 'Ingen spillkategorier i denne kanalen enda.',
                })
                return
            }
            const year = new Date().getFullYear()
            for (const gameCategory of gameCategories) {
                const now = new Date()
                const finishedGames = await getWinsForGameCategoryInYear(gameCategory.id, year)
                const monthWinners = computeMonthlyWinners(finishedGames, year, now)
                const currentMonthLeaders = computeCurrentMonthLeaders(finishedGames, year, now)
                await client.chat.postMessage({
                    channel: command.channel_id,
                    text: `Ledertavle – ${gameCategory.name} ${year}`,
                    blocks: leaderboardBlocks(
                        gameCategory.name,
                        currentMonthLeaders,
                        monthWinners,
                        year,
                        now,
                    ),
                })
            }
            return
        }

        await ack()
        if (!gameCategories?.length) {
            botLogger.info('no gamecategories')
            await ack()
            await respond({
                text: 'Det finnes ingen spillkategorier i denne kanalen. Lag en ny',
                blocks: [
                    {
                        type: 'actions',
                        elements: [newGameCategoryActionElement()],
                    },
                ],
            })
            return
        }
        const gameCategoryPromises = gameCategories.map((cat) => getActionElementsForGameCategory(cat))
        const allBlocks = await Promise.all(gameCategoryPromises).then((e) => e.flat())
        await ack()

        await respond({
            text: 'Lagspill',
            blocks: [
                {
                    type: 'actions',
                    elements: [newGameCategoryActionElement()],
                },
                ...allBlocks,
            ],
        })
    })
}
async function getActionElementsForGameCategory(gameCategory: GameCategory): Promise<Block[]> {
    const openGame = await getOpenGame(gameCategory.id)
    const activeGame = await getActiveGame(gameCategory.id)
    let actionBlockElements: ActionsBlockElement[] = []
    if (!openGame && !activeGame) {
        actionBlockElements = [...actionBlockElements, newGameActionElement(gameCategory)]
    } else if (openGame) {
        actionBlockElements = [
            ...actionBlockElements,
            startGameActionElement(openGame),
            deleteGameActionElement(openGame),
        ]
    } else if (activeGame) {
        actionBlockElements = [
            ...actionBlockElements,
            finishGameActionElement(activeGame),
            deleteGameActionElement(activeGame),
        ]
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
            elements: actionBlockElements,
        },
    ]
}
