import {GameTeam} from ".prisma/client";

export function getTeamMembersString(team: GameTeam) {
    return team.members.map(member => member.displayName).join(', ');
}