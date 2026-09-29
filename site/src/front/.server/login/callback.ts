import { redirect } from "react-router";
import { getSession, commitSession } from "../panel/auth";
import database from "../panel/database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
        return redirect("/?error=NoCode");
    }

    const session = await getSession(request, env);
    const oauthState = session.get("oauth_state");

    if (!state || !oauthState || state !== oauthState) {
        return redirect("/?error=InvalidState");
    }

    session.unset("oauth_state");

    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/login/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
        }).toString(),
    });

    if (!tokenResponse.ok) {
        console.error("Token error", await tokenResponse.text());
        return redirect("/?error=TokenError");
    }

    const tokenData = await tokenResponse.json() as any;

    // 2. Get user info
    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
        console.error("User info error", await userInfoResponse.text());
        return redirect("/?error=UserInfoError");
    }

    const userInfo = await userInfoResponse.json() as any;
    const email = userInfo.email;

    // Prevent account takeover via unverified email
    if (!email || userInfo.email_verified === false) {
        return redirect("/?error=UnverifiedEmail");
    }

    const nome = userInfo.name || email;
    const picture = userInfo.picture;

    // 3. Find or Create User in DB
    const db = env.DB;
    let user = await db.prepare(database.SELECT_USUARIO_BY_EMAIL).bind(email).first();

    let userId = user?.id;

    if (!user) {
        userId = crypto.randomUUID();
        const now = Date.now();
        await db.prepare(database.INSERT_USUARIO).bind(userId, nome, email, now, now).run();
    }

    // 4. Create Session
    session.set("userId", userId);
    if (picture) {
        session.set("avatar", picture);
    }

    return redirect("/panel", {
        headers: {
            "Set-Cookie": await commitSession(session, env),
        },
    });
}
