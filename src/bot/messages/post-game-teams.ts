import { GameTeam } from '.prisma/client'
import { Block, KnownBlock } from '@slack/types'

import { getTeamMembersString } from '../../utils/gameteam'
import {botLogger} from "../bot-logger";

export function postGameResultsBlocks(gameTeams: GameTeam[]): (KnownBlock | Block)[] {
    const fields = gameTeams.map((team: GameTeam) => {
        return [
            {
                type: 'mrkdwn',
                text: `*Plass nr ${team.placement}*\n ${getTeamMembersString(team)}`,
            },
            {
                type: 'mrkdwn',
                text: `${team.score} poeng`,
            },
        ]
    })
    botLogger.info('postgameresults')
    botLogger.info(fields)
    botLogger.info(fields.flat())
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Her er resultatene fra det siste spillet!',
                emoji: true,
            },
        },
        {
            type: "section",
            fields: fields.flat()
        }
    ]
}
export function postGameTeamsMessageBlocks(gameTeams: GameTeam[], gamelink?: string): (KnownBlock | Block)[] {
    const teams: Block[][] = gameTeams.map((team, index) => [
        {
            type: 'section',
            text: {
                type: 'plain_text',
                text: `Lag ${index + 1}`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'plain_text',
                text: `${getTeamMembersString(team)}`,
            },
        },
    ])
    const gamelinkBlock = gamelink && {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `<${gamelink}|Link til spill>`,
        },
    }
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `Her er lagene, sett i gang!`,
                emoji: true,
            },
        },
        ...(gamelinkBlock ? [gamelinkBlock] : []),
        ...teams.flat(),
    ]
}
