import { createCookieSessionStorage } from "react-router";
import database from "./database.json";

export function getSessionStorage(env: any) {
    const secret = env.SESSION_SECRET || env.GOOGLE_CLIENT_SECRET;
    if (!secret) {
        throw new Error("Missing session secret in environment variables");
    }

    return createCookieSessionStorage({
        cookie: {
            name: "__session",
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 604_800, // one week
            secrets: [secret],
            secure: true,
        }
    });
}

export async function getSession(request: Request, env: any) {
    const cookie = request.headers.get("Cookie");
    return getSessionStorage(env).getSession(cookie);
}

export async function commitSession(session: any, env: any) {
    return getSessionStorage(env).commitSession(session);
}

export async function destroySession(session: any, env: any) {
    return getSessionStorage(env).destroySession(session);
}

export async function checkAdminAuth(request: Request, env: any) {
    const session = await getSession(request, env);
    const userId = session.get("userId");
    const avatar = session.get("avatar");
    
    if (!userId) return { isAdmin: false, userId: null, user: null };

    // Verificar se o usuário existe no banco e é admin
    const user = await env.DB.prepare(database.SELECT_USUARIO).bind(userId).first();
    
    if (!user) return { isAdmin: false, userId: null, user: null };

    // Adiciona o avatar da sessão ao objeto do usuário
    user.avatar = avatar;

    // Na nossa regra temporária, todo usuário novo é admin (1),
    // mas se o admin for false (0), bloqueamos
    return { 
        isAdmin: user.admin === 1,
        userId: userId,
        user: user
    };
}

export function isJsonRequest(request: Request) {
	const accept = request.headers.get('Accept') || '';
	const url = new URL(request.url);
	
	return accept.includes('application/json') || url.searchParams.has('json');
}
