import { logger } from '@navikt/next-logger'

export async function register(): Promise<void> {
    // register() kalles også for edge-runtime, der pg ikke kan lastes
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

    const { join } = await import('path')
    const { drizzle } = await import('drizzle-orm/node-postgres')
    const { migrate } = await import('drizzle-orm/node-postgres/migrator')
    const { Pool } = await import('pg')

    const connectionString = process.env.NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL
    if (!connectionString) {
        throw new Error('Mangler NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL')
    }

    // Egen pool: migreringen er en engangsjobb og skal ikke dele tilkoblinger
    // med db()-singelen, som lever hele prosessens levetid
    const pool = new Pool({ connectionString, max: 1 })

    try {
        logger.info('Kjører databasemigreringer...')
        await migrate(drizzle(pool), {
            // process.cwd() er /app. __dirname ville pekt til chunk-plasseringen
            // inne i .next/server, ikke til prosjektroten
            migrationsFolder: join(process.cwd(), 'drizzle', 'migrations'),
        })
        logger.info('Databasemigreringer fullført')
    } catch (err) {
        // Kastes videre slik at prosessen dør og poden går i CrashLoopBackOff
        logger.error({ err }, 'Databasemigrering feilet - stopper oppstart')
        throw err
    } finally {
        await pool.end()
    }
}
