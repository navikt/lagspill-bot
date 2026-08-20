// Runs DB migrations, then starts the Next.js standalone server
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString = process.env.NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL
if (!connectionString) {
    throw new Error('Missing NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL')
}

const pool = new Pool({ connectionString })
const db = drizzle(pool)

console.log('Running database migrations...')
await migrate(db, { migrationsFolder: join(__dirname, 'drizzle', 'migrations') })
await pool.end()
console.log('Migrations complete')

const server = spawn(process.execPath, [join(__dirname, 'server.js')], { stdio: 'inherit' })
server.on('exit', (code) => process.exit(code ?? 0))
