import { type WaitingPerson } from '../db/drizzle'

export function generateRandomTeams(numberOfTeams: number, participants: WaitingPerson[]): Array<Array<WaitingPerson>> {
    if (numberOfTeams === 0 || participants.length === 0) {
        return []
    }
    let teams: Array<Array<WaitingPerson>> = [];
    let participantsList = participants.map((e) => e)
    const minNumberOfTeamMembers = Math.floor(participants.length / numberOfTeams)
    let remainder = participants.length % minNumberOfTeamMembers
    for (let i = 1; i <= numberOfTeams; i++) {
        let subTeam: WaitingPerson[] = [];
        let teamSize = minNumberOfTeamMembers;
        // add extra member from remainders
        if (remainder > 0) {
            teamSize = teamSize + 1;
            remainder--;
        }
        for (let j = 1; j <= teamSize; j++) {
            const indexToRemove = randomIndex(participantsList.length)
            subTeam = [...subTeam, participantsList[indexToRemove]]
            participantsList = removeFromArray(indexToRemove, participantsList)
        }
        teams = [...teams, subTeam];
    }
    return teams;
}
export function randomIndex(listLength: number): number {
    return Math.floor(Math.random() * listLength)
}
export function removeFromArray(index: number, array: WaitingPerson[]): Array<WaitingPerson> {
    return array.filter((el, i) => i !== index)
}
