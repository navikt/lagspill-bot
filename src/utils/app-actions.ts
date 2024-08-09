import {SlackAction} from "@slack/bolt";
import {botLogger} from "../bot/bot-logger";

export function getIdFromMessageAction(body: SlackAction, actionId: string) {
    const bodyAction = body.actions?.find(action => action.action_id === actionId);
    const actionValue = bodyAction?.value || ''
    const numericalValue = Number.parseInt(actionValue);
    if(Number.isNaN(numericalValue)) {
        botLogger.error(`Could not find gamecategoryid in action: ${JSON.stringify(bodyAction)}`)
        return null;
    }
    return numericalValue;

}