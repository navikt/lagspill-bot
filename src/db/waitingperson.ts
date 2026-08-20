import { eq } from 'drizzle-orm'

import { db, waitingPeople, type WaitingPerson } from './drizzle'

export async function addPersonToWaitingRoom(userId: number, gameId: number, isAtOffice: boolean): Promise<void> {
    await db().insert(waitingPeople).values({ userId, gameId, isAtOffice })
}
export async function getPeopleInWaitingRoom( gameId: number): Promise<WaitingPerson[]> {
    return db().select().from(waitingPeople).where(eq(waitingPeople.gameId, gameId))
}
