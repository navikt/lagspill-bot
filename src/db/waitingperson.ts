
import { prisma, WaitingPerson} from './prisma'

export async function addPersonToWaitingRoom(userId: number, gameId: number, isAtOffice: boolean): Promise<void> {
    await prisma().waitingPerson.create({data: {userId, gameId, isAtOffice}})
}
export async function getPeopleInWaitingRoom( gameId: number): Promise<WaitingPerson[]> {
    return await prisma().waitingPerson.findMany({where: {gameId}});
}
