import { createCookieSessionStorage } from "react-router";
import database from "./database.json";

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 604_800, // one week
        secrets: ["secret-fallback"], // O ideal é usar env.GOOGLE_CLIENT_SECRET, mas como o SessionStorage é estático, usamos fallback ou podemos prover dinamicamente
    }
});

export async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return sessionStorage.getSession(cookie);
}

export async function commitSession(session: any) {
    return sessionStorage.commitSession(session);
}

export async function destroySession(session: any) {
    return sessionStorage.destroySession(session);
}

export async function checkAdminAuth(request: Request, env: any) {
    const session = await getSession(request);
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
