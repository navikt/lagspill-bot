import { describe, expect, test } from 'vitest'
import {generateRandomTeams, removeFromArray} from '../src/utils/teamgenerator.ts';
import { type WaitingPerson } from '../src/db/drizzle'

const waiting: WaitingPerson[] = [
    {userId: 123, gameId: 1, isAtOffice: false },
    {userId: 234, gameId: 1, isAtOffice: false },
    {userId: 345, gameId: 1, isAtOffice: false },
    {userId: 456, gameId: 1, isAtOffice: false },
    {userId: 567, gameId: 1, isAtOffice: false },
    {userId: 678, gameId: 1, isAtOffice: false },
    {userId: 789, gameId: 1, isAtOffice: false },
    {userId: 890, gameId: 1, isAtOffice: false },
    {userId: 901, gameId: 1, isAtOffice: false },
    {userId: 444, gameId: 1, isAtOffice: false },
    {userId: 111, gameId: 1, isAtOffice: false },
    {userId: 222, gameId: 1, isAtOffice: false },
    {userId: 333, gameId: 1, isAtOffice: false },
];
describe('randomteamgenerator', () => {
    test('removefromarray', () => {
        const start: WaitingPerson[] = [
            {userId: 123, gameId: 1, isAtOffice: false },
            {userId: 234, gameId: 1, isAtOffice: false },
            {userId: 345, gameId: 1, isAtOffice: false },
            {userId: 456, gameId: 1, isAtOffice: false },
        ];
        const res: WaitingPerson[] = [
            {userId: 123, gameId: 1, isAtOffice: false },
            {userId: 234, gameId: 1, isAtOffice: false },
            {userId: 456, gameId: 1, isAtOffice: false },
        ];
        expect(removeFromArray(2, start)).toEqual(res);
    })
    test('13 participants, 3 teams', () => {
        const teams = generateRandomTeams(3, waiting);
        expect(teams.length).toEqual(3)
        expect(teams[0].length).toEqual(5)
        expect(teams[1].length).toEqual(4)
        expect(teams[2].length).toEqual(4)
    })
    test('13 participants, 4 teams', () => {
        const teams = generateRandomTeams(4, waiting);
        expect(teams.length).toEqual(4)
        expect(teams[0].length).toEqual(4)
        expect(teams[1].length).toEqual(3)
        expect(teams[2].length).toEqual(3)
        expect(teams[3].length).toEqual(3)
    })
    test('0 participants', () => {
        const teams = generateRandomTeams(4, []);
        expect(teams.length).toEqual(0)
    })
    test('0 teams', () => {
        const teams = generateRandomTeams(0, waiting);
        expect(teams.length).toEqual(0)
    })
})
