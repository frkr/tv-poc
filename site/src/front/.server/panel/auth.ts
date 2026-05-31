import { createCookieSessionStorage } from "react-router";

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
    
    if (!userId) return false;

    // Verificar se o usuário existe no banco e é admin
    const user = await env.DB.prepare("SELECT * FROM Usuario WHERE id = ?").bind(userId).first();
    
    if (!user) return false;

    // Na nossa regra temporária, todo usuário novo é admin (1),
    // mas se o admin for false (0), bloqueamos
    return user.admin === 1;
}

export function isJsonRequest(request: Request) {
	const accept = request.headers.get('Accept') || '';
	const url = new URL(request.url);
	
	return accept.includes('application/json') || url.searchParams.has('json');
}
