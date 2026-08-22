import { Block, KnownBlock } from '@slack/types'

import { MONTH_NAMES_NB, type MonthWinners } from '../../utils/leaderboard'

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function padEnd(value: string, width: number): string {
    return value + ' '.repeat(Math.max(0, width - value.length))
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
    monthWinners: MonthWinners[],
    year: number,
): (KnownBlock | Block)[] {
    const header: KnownBlock = {
        type: 'header',
        text: {
            type: 'plain_text',
            text: `Årets vinnere – ${gameCategoryName} ${year}`,
            emoji: true,
        },
    }

    if (monthWinners.length === 0) {
        return [
            header,
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Ingen fullførte måneder med spill i ${year} enda.`,
                },
            },
        ]
    }

    return [
        header,
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '```\n' + renderTable(monthWinners) + '\n```',
            },
        },
    ]
}
