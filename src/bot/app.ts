import { Logger, LogLevel } from '@slack/logger'
import { App as BoltApp } from '@slack/bolt'
import { logger } from '@navikt/pino-logger'

import { healthRoutes } from './health'

const slackLogger = logger.child({ x_context: 'slack-bot', x_isSlack: true })

// Custom logger adapter because Bolt didn't like the pino logger
const loggerAdapter: Logger = {
    debug: (msg) => slackLogger.debug(msg),
    info: (msg) => slackLogger.info(msg),
    warn: (msg) => slackLogger.warn(msg),
    error: (msg) => {
        if (msg?.includes && msg.includes('Secondary WebSocket error occurred:')) {
            slackLogger.info(msg)
        } else {
            slackLogger.error(msg)
        }
    },
    getLevel: (): LogLevel => slackLogger.level as LogLevel,
    setLevel: (): void => void 0,
    setName: (): void => void 0,
}

let instance: BoltApp | null = null

// Bolt sin SocketModeReceiver starter en egen HTTP-server for customRoutes
// og lytter på port 3000. Det er den som svarer på nais-probene.
function createApp(): BoltApp {
    if (instance == null) {
        instance = new BoltApp({
            socketMode: true,
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            appToken: process.env.SLACK_APP_TOKEN,
            logger: loggerAdapter,
            logLevel: LogLevel.DEBUG,
            customRoutes: healthRoutes,
        })
    }

    return instance
}

export type App = BoltApp
export default createApp
