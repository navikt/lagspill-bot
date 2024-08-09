import {prisma, Person} from "./prisma";

export async function getOrCreatePerson(slackUserId: string, name: string): Promise<Person> {
    const person = await prisma().person.findFirst({ where: { slackUserId }})
    if(person) return person;
    return await prisma().person.create({
        data: {
            slackUserId,
            name,
        }
    })
}