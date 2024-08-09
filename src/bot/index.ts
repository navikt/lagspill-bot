import { configureCommandsHandler } from './commands/commands-handler'
import createApp from './app'
import { botLogger } from './bot-logger'
import {configureSignupEventsHandler} from "./events/new-game-events";
import {configureFinishGameEventsHandler} from "./events/finish-game-events";
import {configureStartGameEventsHandler} from "./events/start-game-events";
import {configureDeleteGameEventsHandler} from "./events/delete-game-events";
import {configureGameCategoryEventsHandler} from "./events/game-category-events";

const handlers = [
    configureCommandsHandler,
    configureGameCategoryEventsHandler,
    configureStartGameEventsHandler,
    configureFinishGameEventsHandler,
    configureSignupEventsHandler,
    configureDeleteGameEventsHandler,
]

export async function startBot(): Promise<void> {
    botLogger.info('Setting up bolt app...')

    const app = createApp()
    handlers.forEach((handler) => handler(app))
    await app.start()

    botLogger.info(`Started bolt app in socket mode`)
}
