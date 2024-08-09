import { describe, expect, test } from 'bun:test'
import {generateRandomTeams, removeFromArray} from '../src/utils/teamgenerator.ts';
import {WaitingRoom} from "@prisma/client";

const waiting: WaitingRoom[] = [
    {userId: 123, gameCategoryId: 123, isAtOffice: false },
    {userId: 234, gameCategoryId: 234, isAtOffice: false },
    {userId: 345, gameCategoryId: 345, isAtOffice: false },
    {userId: 456, gameCategoryId: 456, isAtOffice: false },
    {userId: 567, gameCategoryId: 567, isAtOffice: false },
    {userId: 678, gameCategoryId: 678, isAtOffice: false },
    {userId: 789, gameCategoryId: 789, isAtOffice: false },
    {userId: 890, gameCategoryId: 890, isAtOffice: false },
    {userId: 901, gameCategoryId: 901, isAtOffice: false },
    {userId: 444, gameCategoryId: 444, isAtOffice: false },
    {userId: 111, gameCategoryId: 111, isAtOffice: false },
    {userId: 222, gameCategoryId: 222, isAtOffice: false },
    {userId: 333, gameCategoryId: 333, isAtOffice: false },
];
describe('randomteamgenerator', () => {
    test('removefromarray', () => {
        const start: WaitingRoom[] = [
            {userId: 123, gameCategoryId: 123, isAtOffice: false },
            {userId: 234, gameCategoryId: 234, isAtOffice: false },
            {userId: 345, gameCategoryId: 345, isAtOffice: false },
            {userId: 456, gameCategoryId: 456, isAtOffice: false },
        ];
        const res: WaitingRoom[] = [
            {userId: 123, gameCategoryId: 123, isAtOffice: false },
            {userId: 234, gameCategoryId: 234, isAtOffice: false },
            {userId: 456, gameCategoryId: 456, isAtOffice: false },
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
