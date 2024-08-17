import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { logger } from '@navikt/next-logger'
import { lazyNextleton } from 'nextleton'

export const prisma = lazyNextleton('prisma', () => {

    const connectionString = `${process.env.NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL}`

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const client = new PrismaClient({
        adapter,
        log: [
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
        ],
    })


    // const client = new PrismaClient({
    //     log: [
    //         { emit: 'event', level: 'warn' },
    //         { emit: 'event', level: 'error' },
    //     ],
    // })

    client.$on('error', (e) => {
        logger.error(e)
    })

    client.$on('warn', (e) => {
        logger.error(e)
    })

    return client
})

export * from '@prisma/client'
