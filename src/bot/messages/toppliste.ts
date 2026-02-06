import { Block, KnownBlock } from '@slack/types'
import { GameWithTeamsAndMembers } from '../../db'
import { botLogger } from '../../bot/bot-logger'
import { plasseringEmoji } from '../../utils/blocks'

export function topplisteBlocks(liste: PersonGameStats[] ): (KnownBlock | Block)[] {
    return liste.map((entry, i) => [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `${plasseringEmoji(i)} *${entry.displayName}*`,
            },
        },
        {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `Snittscore per spill`,
                },
                {
                    type: 'mrkdwn',
                    text: `${entry.averageScore}`,
                },
                {
                    type: 'mrkdwn',
                    text: `Totalt antall poeng`,
                },
                {
                    type: 'mrkdwn',
                    text: `${entry.aggregateScore}`,
                },
                {
                    type: 'mrkdwn',
                    text: `Antall spill spilt`,
                },
                {
                    type: 'mrkdwn',
                    text: `${entry.gamesPlayed}`,
                },
                {
                    type: 'mrkdwn',
                    text: `Antall seiere`,
                },
                {
                    type: 'mrkdwn',
                    text: `${entry.numberOfWins}`,
                },
                {
                    type: 'mrkdwn',
                    text: `Høyeste enkeltscore`,
                },
                {
                    type: 'mrkdwn',
                    text: `${entry.highestScore}`,
                },
            ],
        },
        {
            type: 'divider',
        },
    ])
}
export type PersonGameStats = {
    displayName: string
    averageScore: number
    aggregateScore: number
    highestScore: number
    gamesPlayed: number
    numberOfWins: number
}
export function mapGamesToPersonalStatsMap(games: GameWithTeamsAndMembers[]): Map<number, PersonGameStats> {
    const statsMap = new Map()
    for (const game of games) {
        for (const team of game.teams) {
            for (const person of team.members) {
                botLogger.info(person.id)
                if (!person.anonymous) {
                    const existingStats = statsMap.get(person.id) || {}
                    botLogger.info(existingStats)

                    const newNofGames = (existingStats.gamesPlayed || 0) + 1
                    const newAgg = (existingStats.aggregateScore || 0) + (team.score || 0)
                    const stats: PersonGameStats = {
                        displayName: existingStats.displayName || person.displayName,
                        aggregateScore: newAgg,
                        highestScore: Math.max(existingStats.highestScore || 0, team.score || 0),
                        gamesPlayed: newNofGames,
                        numberOfWins: (existingStats.numberOfWins || 0) + (team.placement === 1 ? 1 : 0),
                        averageScore: newAgg / newNofGames,
                    }
                    botLogger.info(stats)
                    statsMap.set(person.id, stats)
                }
            }
        }
    }
    return statsMap
}
