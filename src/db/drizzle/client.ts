import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

let instance: NodePgDatabase<typeof schema> | null = null

export function db(): NodePgDatabase<typeof schema> {
    if (instance == null) {
        const connectionString = process.env.NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL
        if (!connectionString) {
            throw new Error('Missing NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL')
        }

        instance = drizzle(new Pool({ connectionString }), { schema })
    }

    return instance
}

export * from './schema'
