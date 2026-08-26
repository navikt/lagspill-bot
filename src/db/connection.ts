const CONNECTION_STRING_ENV = 'NAIS_DATABASE_LAGSPILL_BOT_LAGSPILL_BOT_URL'

export function databaseUrl(): string {
    const raw = process.env[CONNECTION_STRING_ENV]
    if (!raw) {
        throw new Error(`Mangler ${CONNECTION_STRING_ENV}`)
    }

    if (raw.includes('uselibpqcompat=')) {
        return raw
    }

    return `${raw}${raw.includes('?') ? '&' : '?'}uselibpqcompat=true`
}
