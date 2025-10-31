import {Game, GameCategory} from ".prisma/client";
import { ActionsBlockElement } from '@slack/types'

export const newGameActionId = 'new-game'
export const startGameActionId = 'start-game';
export const finishGameActionId = 'finish-game';

export const deleteGameActionId = 'delete-game-action';
export const newGameCategoryActionId = 'new-game-category';

export function newGameActionElement(gameCategory: GameCategory): ActionsBlockElement {
   return {
        action_id: newGameActionId,
        type: 'button',
        text: {
        type: 'plain_text',
            text: 'Nytt spill',
        },
        style: 'primary',
        value: `${gameCategory.id}`,
    }
}
export function startGameActionElement(game: Game): ActionsBlockElement {
    return {
        action_id: startGameActionId,
        type: 'button',
        text: {
            type: 'plain_text',
            text: 'Start spillet og del inn lag',
        },
        style: 'primary',
        value: `${game.id}`,
    }
}
export function finishGameActionElement(game: Game): ActionsBlockElement {
    return {
        action_id: finishGameActionId,
        type: 'button',
        text: {
            type: 'plain_text',
            text: 'Avslutt spill',
        },
        style: 'primary',
        value: `${game.id}`,
    }
}

export function deleteGameActionElement(game: Game): ActionsBlockElement {
    return {
        action_id: deleteGameActionId,
        type: 'button',
        text: {
            type: 'plain_text',
            text: 'Slett spill',
        },
        style: 'primary',
        value: `${game.id}`,
    }
}
export function newGameCategoryActionElement(): ActionsBlockElement {
    return {
        action_id: newGameCategoryActionId,
        type: 'button',
        text: {
            type: 'plain_text',
            text: 'Ny spillkategori',
        },
        style: 'primary',
        value: `click_me`,
    }
}
