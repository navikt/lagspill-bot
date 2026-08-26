import { describe, expect, test } from 'vitest'

import {
    computeCurrentMonthLeaders,
    computeMonthlyWinners,
    detectMonthTransitionWinner,
    type WinnerGameInput,
} from '../src/utils/leaderboard.ts'

// "now" fixed to 15. august 2026 -> ferdige måneder i 2026 er januar (0) t.o.m. juli (6),
// inneværende måned er august (7)
const NOW = new Date(2026, 7, 15)
const YEAR = 2026

function game(date: Date | null, teams: WinnerGameInput['teams']): WinnerGameInput {
    return { date, teams }
}

function winner(id: number, displayName: string): WinnerGameInput['teams'][number]['members'][number] {
    return { id, displayName, anonymous: false }
}

function augGame(id: number, name: string): WinnerGameInput {
    return game(new Date(2026, 7, 5), [{ placement: 1, members: [winner(id, name)] }])
}

describe('computeMonthlyWinners', () => {
    test('finner personen med flest seiere i en ferdig måned', () => {
        const games = [
            // januar: Ola vinner to spill, Kari ett
            game(new Date(2026, 0, 3), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 0, 10), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 0, 17), [{ placement: 1, members: [winner(2, 'Kari')] }]),
        ]

        const result = computeMonthlyWinners(games, YEAR, NOW)

        expect(result).toEqual([{ monthIndex: 0, wins: 2, winners: ['Ola'] }])
    })

    test('viser alle vinnere ved uavgjort', () => {
        const games = [
            game(new Date(2026, 2, 3), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 2, 10), [{ placement: 1, members: [winner(2, 'Kari')] }]),
        ]

        const result = computeMonthlyWinners(games, YEAR, NOW)

        expect(result).toEqual([{ monthIndex: 2, wins: 1, winners: ['Kari', 'Ola'] }])
    })

    test('utelater inneværende måned (ikke ferdig)', () => {
        const games = [game(new Date(2026, 7, 5), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(computeMonthlyWinners(games, YEAR, NOW)).toEqual([])
    })

    test('utelater fremtidige måneder', () => {
        const games = [game(new Date(2026, 10, 5), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(computeMonthlyWinners(games, YEAR, NOW)).toEqual([])
    })

    test('utelater måneder uten seiere', () => {
        const games = [game(new Date(2026, 0, 3), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        const result = computeMonthlyWinners(games, YEAR, NOW)

        expect(result.map((r) => r.monthIndex)).toEqual([0])
    })

    test('ekskluderer anonyme personer', () => {
        const games = [
            game(new Date(2026, 0, 3), [
                { placement: 1, members: [{ id: 1, displayName: 'Skjult', anonymous: true }] },
            ]),
        ]

        expect(computeMonthlyWinners(games, YEAR, NOW)).toEqual([])
    })

    test('teller kun placement === 1', () => {
        const games = [
            game(new Date(2026, 0, 3), [
                { placement: 1, members: [winner(1, 'Ola')] },
                { placement: 2, members: [winner(2, 'Kari')] },
            ]),
        ]

        expect(computeMonthlyWinners(games, YEAR, NOW)).toEqual([{ monthIndex: 0, wins: 1, winners: ['Ola'] }])
    })

    test('ignorerer spill uten dato', () => {
        const games = [game(null, [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(computeMonthlyWinners(games, YEAR, NOW)).toEqual([])
    })

    test('ignorerer spill fra andre år', () => {
        const games = [game(new Date(2025, 0, 3), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(computeMonthlyWinners(games, YEAR, NOW)).toEqual([])
    })

    test('regner alle måneder som ferdige for tidligere år', () => {
        const games = [game(new Date(2025, 11, 3), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(computeMonthlyWinners(games, 2025, NOW)).toEqual([{ monthIndex: 11, wins: 1, winners: ['Ola'] }])
    })

    test('sorterer resultat stigende på måned', () => {
        const games = [
            game(new Date(2026, 5, 3), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 0, 3), [{ placement: 1, members: [winner(2, 'Kari')] }]),
        ]

        expect(computeMonthlyWinners(games, YEAR, NOW).map((r) => r.monthIndex)).toEqual([0, 5])
    })
})

describe('computeCurrentMonthLeaders', () => {
    test('rangerer topp 3 etter flest seiere i inneværende måned', () => {
        const games = [
            augGame(1, 'Ola'),
            augGame(1, 'Ola'),
            augGame(1, 'Ola'),
            augGame(2, 'Kari'),
            augGame(2, 'Kari'),
            augGame(3, 'Per'),
        ]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([
            { rank: 1, displayName: 'Ola', wins: 3 },
            { rank: 2, displayName: 'Kari', wins: 2 },
            { rank: 3, displayName: 'Per', wins: 1 },
        ])
    })

    test('viser alle ved uavgjort på 3. plass', () => {
        const games = [augGame(1, 'Ola'), augGame(1, 'Ola'), augGame(2, 'Kari'), augGame(3, 'Per'), augGame(4, 'Ada')]

        // Ola (2), så tre delt på 1 seier -> alle rank 2 (competition ranking), ingen over grensa
        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([
            { rank: 1, displayName: 'Ola', wins: 2 },
            { rank: 2, displayName: 'Ada', wins: 1 },
            { rank: 2, displayName: 'Kari', wins: 1 },
            { rank: 2, displayName: 'Per', wins: 1 },
        ])
    })

    test('delt plass gir competition ranking (1,1,3)', () => {
        const games = [augGame(1, 'Ola'), augGame(1, 'Ola'), augGame(2, 'Kari'), augGame(2, 'Kari'), augGame(3, 'Per')]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([
            { rank: 1, displayName: 'Kari', wins: 2 },
            { rank: 1, displayName: 'Ola', wins: 2 },
            { rank: 3, displayName: 'Per', wins: 1 },
        ])
    })

    test('respekterer limit og utelater plasseringer over grensa', () => {
        const games = [augGame(1, 'Ola'), augGame(1, 'Ola'), augGame(2, 'Kari'), augGame(2, 'Kari'), augGame(3, 'Per')]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW, 2)).toEqual([
            { rank: 1, displayName: 'Kari', wins: 2 },
            { rank: 1, displayName: 'Ola', wins: 2 },
        ])
    })

    test('teller kun inneværende måned', () => {
        const games = [
            augGame(1, 'Ola'),
            game(new Date(2026, 6, 3), [{ placement: 1, members: [winner(2, 'Kari')] }]), // juli
        ]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([{ rank: 1, displayName: 'Ola', wins: 1 }])
    })

    test('ekskluderer anonyme', () => {
        const games = [
            game(new Date(2026, 7, 5), [
                { placement: 1, members: [{ id: 1, displayName: 'Skjult', anonymous: true }] },
            ]),
        ]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([])
    })

    test('teller kun placement === 1', () => {
        const games = [
            game(new Date(2026, 7, 5), [
                { placement: 1, members: [winner(1, 'Ola')] },
                { placement: 2, members: [winner(2, 'Kari')] },
            ]),
        ]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([{ rank: 1, displayName: 'Ola', wins: 1 }])
    })

    test('tom liste når ingen seiere i inneværende måned', () => {
        const games = [game(new Date(2026, 6, 3), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(computeCurrentMonthLeaders(games, YEAR, NOW)).toEqual([])
    })

    test('tom liste når året ikke er inneværende år', () => {
        const games = [augGame(1, 'Ola')]

        expect(computeCurrentMonthLeaders(games, 2025, NOW)).toEqual([])
    })
})

describe('detectMonthTransitionWinner', () => {
    test('null når forrige spill er i samme måned', () => {
        const games = [
            game(new Date(2026, 6, 3), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 6, 20), [{ placement: 1, members: [winner(2, 'Kari')] }]),
        ]

        expect(detectMonthTransitionWinner(games, new Date(2026, 6, 20), YEAR, NOW)).toBeNull()
    })

    test('vinner når forrige spill er i umiddelbart foregående måned', () => {
        const games = [
            game(new Date(2026, 6, 3), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 7, 5), [{ placement: 1, members: [winner(1, 'Ola')] }]),
        ]

        expect(detectMonthTransitionWinner(games, new Date(2026, 7, 5), YEAR, NOW)).toEqual({
            monthIndex: 6,
            wins: 1,
            winners: ['Ola'],
        })
    })

    test('null når det er en måned uten spill mellom', () => {
        const games = [
            game(new Date(2026, 1, 5), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 3, 10), [{ placement: 1, members: [winner(1, 'Ola')] }]),
        ]

        expect(detectMonthTransitionWinner(games, new Date(2026, 3, 10), YEAR, NOW)).toBeNull()
    })

    test('viser alle vinnere ved uavgjort forrige måned', () => {
        const games = [
            game(new Date(2026, 6, 3), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 6, 10), [{ placement: 1, members: [winner(2, 'Kari')] }]),
            game(new Date(2026, 7, 5), [{ placement: 1, members: [winner(1, 'Ola')] }]),
        ]

        expect(detectMonthTransitionWinner(games, new Date(2026, 7, 5), YEAR, NOW)).toEqual({
            monthIndex: 6,
            wins: 1,
            winners: ['Kari', 'Ola'],
        })
    })

    test('null når det ikke finnes noe forrige spill', () => {
        const games = [game(new Date(2026, 7, 5), [{ placement: 1, members: [winner(1, 'Ola')] }])]

        expect(detectMonthTransitionWinner(games, new Date(2026, 7, 5), YEAR, NOW)).toBeNull()
    })

    test('null ved årsskifte (januar med forrige spill i desember i fjor)', () => {
        const games = [
            game(new Date(2025, 11, 5), [{ placement: 1, members: [winner(1, 'Ola')] }]),
            game(new Date(2026, 0, 10), [{ placement: 1, members: [winner(1, 'Ola')] }]),
        ]

        expect(detectMonthTransitionWinner(games, new Date(2026, 0, 10), YEAR, NOW)).toBeNull()
    })
})
