import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/drizzle/schema.ts',
    out: './drizzle/migrations',
    dbCredentials: {
        url: process.env.NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL!,
    },
})
