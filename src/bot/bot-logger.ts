import { logger } from '@navikt/pino-logger'

export const botLogger = logger.child({ x_context: 'slack-bot' })
