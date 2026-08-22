import { Block, KnownBlock } from '@slack/types'

import { getWinsForGameCategoryInYear, type GameCategory } from '../db'
import { computeCurrentMonthLeaders, computeMonthlyWinners } from '../utils/leaderboard'
import { leaderboardBlocks } from './messages/leaderboard'

export async function buildLeaderboardBlocks(
    gameCategory: GameCategory,
    now: Date,
): Promise<(KnownBlock | Block)[]> {
    const year = now.getFullYear()
    const finishedGames = await getWinsForGameCategoryInYear(gameCategory.id, year)
    const monthWinners = computeMonthlyWinners(finishedGames, year, now)
    const currentMonthLeaders = computeCurrentMonthLeaders(finishedGames, year, now)

    return leaderboardBlocks(gameCategory.name, currentMonthLeaders, monthWinners, year, now)
}
