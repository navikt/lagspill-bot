import { type GameTeamWithMembers } from '../db/gameteam'

export function getTeamMembersString(team: GameTeamWithMembers) {
    return team.members.map(member => member.displayName).join(', ');
}