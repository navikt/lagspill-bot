import { logger } from '@navikt/pino-logger'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { join } from 'node:path'
import { Pool } from 'pg'

import { startBot, stopBot } from './bot'
import { databaseUrl } from './db/connection'
import { getServerEnv } from './utils/env'

async function runMigrations(): Promise<void> {
    // Egen pool: migreringen er en engangsjobb og skal ikke dele tilkoblinger
    // med db()-singelen, som lever hele prosessens levetid
    const pool = new Pool({ connectionString: databaseUrl(), max: 1 })

    try {
        logger.info('Kjører databasemigreringer...')
        await migrate(drizzle(pool), {
            migrationsFolder: join(process.cwd(), 'drizzle', 'migrations'),
        })
        logger.info('Databasemigreringer fullført')
    } finally {
        await pool.end()
    }
}

function registerShutdownHandlers(): void {
    const shutdown = async (signal: string): Promise<void> => {
        logger.info(`Mottok ${signal}, stopper applikasjonen...`)
        try {
            await stopBot()
            logger.info('Bolt app stoppet')
            process.exit(0)
        } catch (err) {
            logger.warn({ err }, 'Klarte ikke å stoppe bolt app')
            process.exit(1)
        }
    }

    process.once('SIGTERM', () => void shutdown('SIGTERM'))
    process.once('SIGINT', () => void shutdown('SIGINT'))
}

async function main(): Promise<void> {
    // Valider envs før vi rører database eller Slack, slik at manglende
    // konfigurasjon feiler umiddelbart og med en tydelig melding
    getServerEnv()

    await runMigrations()
    await startBot()

    registerShutdownHandlers()
}

main().catch((err: unknown) => {
    const cause = err instanceof Error ? err.cause : undefined
    logger.warn({ err, cause }, 'Applikasjonen klarte ikke å starte')
    process.exit(1)
})
