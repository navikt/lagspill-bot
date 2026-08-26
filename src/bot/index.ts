import { configureCommandsHandler } from './commands/commands-handler'
import createApp from './app'
import { botLogger } from './bot-logger'
import {configureSignupEventsHandler} from "./events/new-game-events";
import {configureFinishGameEventsHandler} from "./events/finish-game-events";
import {configureStartGameEventsHandler} from "./events/start-game-events";
import {configureDeleteGameEventsHandler} from "./events/delete-game-events";
import {configureGameCategoryEventsHandler} from "./events/game-category-events";
import { db } from '../db/drizzle/client'
import { sql } from 'drizzle-orm'

import { markReady } from './health'

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

    await db().execute(sql`select 1`)
    botLogger.info('Database connection OK')

    const app = createApp()
    handlers.forEach((handler) => handler(app))
    await app.start()

    markReady()
    botLogger.info(`Started bolt app in socket mode`)
}

export async function stopBot(): Promise<void> {
    await createApp().stop()
}
