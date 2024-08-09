
import { prisma, WaitingPerson} from './prisma'

export async function addPersonToWaitingRoom(userId: number, gameCategoryId: number, isAtOffice: boolean): Promise<void> {
    await prisma().waitingPerson.create({data: {userId, gameCategoryId, isAtOffice}})
}
export async function clearWaitingRoomForGameCategory(gameCategoryId: number): Promise<void> {
    await prisma().waitingPerson.deleteMany({where: {gameCategoryId}})
}
export async function getPeopleInWaitingRoom(gameCategoryId: number): Promise<WaitingPerson[]> {
    return await prisma().waitingPerson.findMany({where: {gameCategoryId}});
}
