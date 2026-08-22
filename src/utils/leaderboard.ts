export const MONTH_NAMES_NB = [
    'januar',
    'februar',
    'mars',
    'april',
    'mai',
    'juni',
    'juli',
    'august',
    'september',
    'oktober',
    'november',
    'desember',
] as const

export interface WinnerGameMember {
    id: number
    displayName: string | null
    anonymous: boolean
}

export interface WinnerGameTeam {
    placement: number | null
    members: WinnerGameMember[]
}

export interface WinnerGameInput {
    date: Date | null
    teams: WinnerGameTeam[]
}

export interface MonthWinners {
    monthIndex: number
    wins: number
    winners: string[]
}

function isMonthFinished(monthIndex: number, year: number, now: Date): boolean {
    if (year < now.getFullYear()) return true
    if (year > now.getFullYear()) return false
    return monthIndex < now.getMonth()
}

export function computeMonthlyWinners(games: WinnerGameInput[], year: number, now: Date): MonthWinners[] {
    // winsByMonth[monthIndex] -> Map<personId, { displayName, wins }>
    const winsByMonth = new Map<number, Map<number, { displayName: string; wins: number }>>()

    for (const game of games) {
        if (!game.date) continue
        if (game.date.getFullYear() !== year) continue

        const monthIndex = game.date.getMonth()
        if (!isMonthFinished(monthIndex, year, now)) continue

        for (const team of game.teams) {
            if (team.placement !== 1) continue

            for (const member of team.members) {
                if (member.anonymous) continue

                const monthMap = winsByMonth.get(monthIndex) ?? new Map()
                const existing = monthMap.get(member.id)
                monthMap.set(member.id, {
                    displayName: existing?.displayName ?? member.displayName ?? 'Ukjent',
                    wins: (existing?.wins ?? 0) + 1,
                })
                winsByMonth.set(monthIndex, monthMap)
            }
        }
    }

    const result: MonthWinners[] = []
    for (const [monthIndex, personMap] of winsByMonth) {
        const maxWins = Math.max(...Array.from(personMap.values(), (p) => p.wins))
        const winners = Array.from(personMap.values())
            .filter((p) => p.wins === maxWins)
            .map((p) => p.displayName)
            .sort((a, b) => a.localeCompare(b, 'nb'))

        result.push({ monthIndex, wins: maxWins, winners })
    }

    return result.sort((a, b) => a.monthIndex - b.monthIndex)
}
