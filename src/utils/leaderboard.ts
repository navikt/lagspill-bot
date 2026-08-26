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

export interface LeaderEntry {
    rank: number
    displayName: string
    wins: number
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

export function computeCurrentMonthLeaders(
    games: WinnerGameInput[],
    year: number,
    now: Date,
    limit = 3,
): LeaderEntry[] {
    if (year !== now.getFullYear()) return []
    const currentMonth = now.getMonth()

    const winsByPerson = new Map<number, { displayName: string; wins: number }>()

    for (const game of games) {
        if (!game.date) continue
        if (game.date.getFullYear() !== year) continue
        if (game.date.getMonth() !== currentMonth) continue

        for (const team of game.teams) {
            if (team.placement !== 1) continue

            for (const member of team.members) {
                if (member.anonymous) continue

                const existing = winsByPerson.get(member.id)
                winsByPerson.set(member.id, {
                    displayName: existing?.displayName ?? member.displayName ?? 'Ukjent',
                    wins: (existing?.wins ?? 0) + 1,
                })
            }
        }
    }

    const sorted = Array.from(winsByPerson.values()).sort(
        (a, b) => b.wins - a.wins || a.displayName.localeCompare(b.displayName, 'nb'),
    )

    const leaders: LeaderEntry[] = []
    for (let i = 0; i < sorted.length; i++) {
        const entry = sorted[i]
        // Competition ranking: same wins share rank, next distinct rank skips ties.
        const rank = i > 0 && sorted[i - 1].wins === entry.wins ? leaders[i - 1].rank : i + 1
        if (rank > limit) break
        leaders.push({ rank, displayName: entry.displayName, wins: entry.wins })
    }

    return leaders
}

export function detectMonthTransitionWinner(
    games: WinnerGameInput[],
    currentGameDate: Date,
    year: number,
    now: Date,
): MonthWinners | null {
    let previousDate: Date | null = null
    for (const game of games) {
        if (!game.date) continue
        if (game.date.getTime() >= currentGameDate.getTime()) continue
        if (!previousDate || game.date.getTime() > previousDate.getTime()) {
            previousDate = game.date
        }
    }
    if (!previousDate) return null

    const currentMonth = currentGameDate.getMonth()
    const currentYear = currentGameDate.getFullYear()
    // Kun umiddelbart foregående måned, samme år (januar utelukkes automatisk via currentMonth - 1).
    if (previousDate.getFullYear() !== currentYear) return null
    if (previousDate.getMonth() !== currentMonth - 1) return null

    const monthIndex = previousDate.getMonth()
    const winner = computeMonthlyWinners(games, year, now).find((m) => m.monthIndex === monthIndex)
    return winner ?? null
}
