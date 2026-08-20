import { drizzle } from 'drizzle-orm/node-postgres'
import { lazyNextleton } from 'nextleton'
import { Pool } from 'pg'

import * as schema from './schema'

export const db = lazyNextleton('drizzle', () => {
    const connectionString = process.env.NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL
    if (!connectionString) {
        throw new Error('Missing NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL')
    }

    const pool = new Pool({ connectionString })
    return drizzle(pool, { schema })
})

export * from './schema'
