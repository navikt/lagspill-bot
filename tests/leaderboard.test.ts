import { describe, expect, test } from 'vitest'

import { computeMonthlyWinners, type WinnerGameInput } from '../src/utils/leaderboard.ts'

// "now" fixed to 15. august 2026 -> ferdige måneder i 2026 er januar (0) t.o.m. juli (6)
const NOW = new Date(2026, 7, 15)
const YEAR = 2026

function game(date: Date | null, teams: WinnerGameInput['teams']): WinnerGameInput {
    return { date, teams }
}

function winner(id: number, displayName: string): WinnerGameInput['teams'][number]['members'][number] {
    return { id, displayName, anonymous: false }
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
