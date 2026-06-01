import database from "./database.json";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function corsHeaders() {
    return CORS_HEADERS;
}

export function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
}

export async function checkTvAuth(request: Request, env: any) {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7).trim();
    const user = await env.DB.prepare(database.SELECT_USUARIO_BY_TOKEN).bind(token).first();
    return user ?? null;
}
