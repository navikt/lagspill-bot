import { Block, KnownBlock } from '@slack/types'

import { MONTH_NAMES_NB, type LeaderEntry, type MonthWinners } from '../../utils/leaderboard'
import { plasseringEmoji } from '../../utils/blocks'

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function padEnd(value: string, width: number): string {
    return value + ' '.repeat(Math.max(0, width - value.length))
}

function pluralizeSeiere(wins: number): string {
    return wins === 1 ? 'seier' : 'seiere'
}

function renderCurrentMonthLeaders(leaders: LeaderEntry[]): string {
    return leaders
        .map((leader) => `${plasseringEmoji(leader.rank - 1)} *${leader.displayName}* — ${leader.wins} ${pluralizeSeiere(leader.wins)}`)
        .join('\n')
}

function renderTable(rows: MonthWinners[]): string {
    const headers = ['Måned', 'Vinner', 'Seiere']
    const tableRows = rows.map((row) => [
        capitalize(MONTH_NAMES_NB[row.monthIndex]),
        row.winners.join(', '),
        String(row.wins),
    ])

    const widths = headers.map((header, col) =>
        Math.max(header.length, ...tableRows.map((row) => row[col].length)),
    )

    const renderRow = (cells: string[]): string =>
        cells.map((cell, col) => padEnd(cell, widths[col])).join('  ')

    const separator = widths.map((width) => '-'.repeat(width)).join('  ')

    return [renderRow(headers), separator, ...tableRows.map(renderRow)].join('\n')
}

export function leaderboardBlocks(
    gameCategoryName: string,
    currentMonthLeaders: LeaderEntry[],
    monthWinners: MonthWinners[],
    year: number,
    now: Date,
): (KnownBlock | Block)[] {
    const currentMonthName = capitalize(MONTH_NAMES_NB[now.getMonth()])

    const currentMonthText =
        currentMonthLeaders.length === 0
            ? `Ingen seiere registrert i ${currentMonthName.toLowerCase()} enda.`
            : renderCurrentMonthLeaders(currentMonthLeaders)

    const yearText =
        monthWinners.length === 0
            ? `Ingen fullførte måneder med spill i ${year} enda.`
            : '```\n' + renderTable(monthWinners) + '\n```'

    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: gameCategoryName,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Månedens ledere – ${currentMonthName} ${year}*\n${currentMonthText}`,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Årets vinnere ${year}*\n${yearText}`,
            },
        },
    ]
}
