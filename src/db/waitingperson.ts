
import { prisma, WaitingPerson} from './prisma'

export async function addPersonToWaitingRoom(userId: number, gameCategoryId: number, gameId: number, isAtOffice: boolean): Promise<void> {
    await prisma().waitingPerson.create({data: {userId, gameCategoryId, gameId, isAtOffice}})
}
export async function getPeopleInWaitingRoom( gameId: number): Promise<WaitingPerson[]> {
    return await prisma().waitingPerson.findMany({where: {gameId}});
}
