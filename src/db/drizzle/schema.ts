import { relations } from 'drizzle-orm'
import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'

export const statusEnum = pgEnum('Status', ['OPEN', 'ACTIVE', 'CLOSED'])

export const channels = pgTable('Channel', {
    id: serial('id').primaryKey(),
    slackChannelId: text('slackChannelId').notNull(),
    name: text('name').notNull(),
})

export const gameCategories = pgTable('GameCategory', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    channelId: integer('channelId')
        .notNull()
        .references(() => channels.id),
    gamelink: text('gamelink'),
})

export const games = pgTable('Game', {
    id: serial('id').primaryKey(),
    status: statusEnum('status').notNull().default('OPEN'),
    gameCategoryId: integer('gameCategoryId')
        .notNull()
        .references(() => gameCategories.id),
    date: timestamp('date', { withTimezone: true }).defaultNow(),
})

export const gameTeams = pgTable('GameTeam', {
    id: serial('id').primaryKey(),
    gameId: integer('gameId')
        .notNull()
        .references(() => games.id, { onDelete: 'cascade' }),
    score: integer('score'),
    placement: integer('placement'),
})

export const persons = pgTable('Person', {
    id: serial('id').primaryKey(),
    slackUserId: text('slackUserId').notNull(),
    name: text('name'),
    displayName: text('displayName'),
    anonymous: boolean('anonymous').notNull().default(false),
})

export const gameTeamMembers = pgTable(
    '_GameTeamToPerson',
    {
        gameTeamId: integer('A')
            .notNull()
            .references(() => gameTeams.id, { onDelete: 'cascade' }),
        personId: integer('B')
            .notNull()
            .references(() => persons.id, { onDelete: 'cascade' }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.gameTeamId, table.personId] }),
    }),
)

export const waitingPeople = pgTable(
    'WaitingPerson',
    {
        userId: integer('userId').notNull(),
        gameId: integer('gameId').notNull(),
        isAtOffice: boolean('isAtOffice').notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.gameId] }),
    }),
)

export const channelRelations = relations(channels, ({ many }) => ({
    gameCategories: many(gameCategories),
}))

export const gameCategoryRelations = relations(gameCategories, ({ one, many }) => ({
    channel: one(channels, {
        fields: [gameCategories.channelId],
        references: [channels.id],
    }),
    games: many(games),
}))

export const gameRelations = relations(games, ({ one, many }) => ({
    gameCategory: one(gameCategories, {
        fields: [games.gameCategoryId],
        references: [gameCategories.id],
    }),
    teams: many(gameTeams),
}))

export const gameTeamRelations = relations(gameTeams, ({ one, many }) => ({
    game: one(games, {
        fields: [gameTeams.gameId],
        references: [games.id],
    }),
    members: many(gameTeamMembers),
}))

export const personRelations = relations(persons, ({ many }) => ({
    teams: many(gameTeamMembers),
}))

export type Channel = typeof channels.$inferSelect
export type GameCategory = typeof gameCategories.$inferSelect
export type Game = typeof games.$inferSelect
export type GameTeam = typeof gameTeams.$inferSelect
export type Person = typeof persons.$inferSelect
export type WaitingPerson = typeof waitingPeople.$inferSelect
