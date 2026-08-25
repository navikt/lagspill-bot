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

    try {
        await db().execute(sql`select 1`)
        botLogger.info('Database connection OK')
    } catch (err) {
        botLogger.error({ err }, 'Database connection FAILED')
    }

    const app = createApp()
    handlers.forEach((handler) => handler(app))
    await app.start()

    registerShutdownHandlers(app)

    botLogger.info(`Started bolt app in socket mode`)
}

let shutdownRegistered = false

function registerShutdownHandlers(app: ReturnType<typeof createApp>): void {
    if (shutdownRegistered) return
    shutdownRegistered = true

    const stop = async (signal: string): Promise<void> => {
        botLogger.info(`Mottok ${signal}, stopper bolt app...`)
        try {
            await app.stop()
            botLogger.info('Bolt app stoppet')
        } catch (err) {
            botLogger.error({ err }, 'Klarte ikke å stoppe bolt app')
        }
    }

    // Next registrerer sine egne SIGTERM/SIGINT-handlere og kaller process.exit(0)
    // når serveren er lukket. Vi kappes derfor mot den om å rekke å lukke
    // websocket-tilkoblingen, men Slack rydder uansett opp ved disconnect.
    process.once('SIGTERM', () => void stop('SIGTERM'))
    process.once('SIGINT', () => void stop('SIGINT'))
}
