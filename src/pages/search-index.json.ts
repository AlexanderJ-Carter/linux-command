import { loadCommands, toIndexItems } from '../lib/commands';

export async function GET() {
    const body = JSON.stringify(toIndexItems(loadCommands()));
    return new Response(body, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
