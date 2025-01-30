import {prisma, Person} from "./prisma";
import {GameTeam} from ".prisma/client";

export async function getOrCreatePerson(slackUserId: string): Promise<Person> {
    const person = await prisma().person.findFirst({ where: { slackUserId }})
    if(person) return person;
    return await prisma().person.create({
        data: {
            slackUserId,
        }
    })
}
export async function getPerson(slackUserId: string): Promise<Person | null> {
    return await prisma().person.findFirst({ where: { slackUserId }});
}
export async function updatePersonDisplayName(personId: number, displayName: string): Promise<void> {
    await prisma().person.update({
        where: { id: personId },
        data: { displayName }
    })
}
export async function getAllGameTeamsForPersonInGameCategory(personId: number, gameCategoryId: number): Promise<Array<GameTeam>> {
    const personWithGameTeams = await prisma().person.findUnique({
        where: {id: personId},
        include: {
            gameTeams: {
                include: {game: true}
            }
        }
    })
    return personWithGameTeams?.gameTeams?.filter(gameTeam =>
        gameTeam.game.gameCategoryId === gameCategoryId
    ) || []

}
