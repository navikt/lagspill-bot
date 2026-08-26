import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { databaseUrl } from '../connection'

import * as schema from './schema'

let instance: NodePgDatabase<typeof schema> | null = null

export function db(): NodePgDatabase<typeof schema> {
    if (instance == null) {
        instance = drizzle(new Pool({ connectionString: databaseUrl() }), { schema })
    }

    return instance
}

export * from './schema'
