import type { CustomRoute } from '@slack/bolt'
import type { ServerResponse } from 'node:http'

let ready = false

export function markReady(): void {
    ready = true
}

function json(res: ServerResponse, status: number, message: string): void {
    res.writeHead(status, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ message }))
}

export const healthRoutes: CustomRoute[] = [
    {
        path: '/api/internal/is_alive',
        method: ['GET'],
        handler: (_req, res) => json(res, 200, 'I am alive :)'),
    },
    {
        path: '/api/internal/is_ready',
        method: ['GET'],
        handler: (_req, res) =>
            ready ? json(res, 200, 'I am ready :)') : json(res, 503, 'Slack bot not ready yet'),
    },
]
