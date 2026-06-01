import { redirect } from "react-router";
import { getSession, commitSession } from "../panel/auth";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const clientId = env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        throw new Error("GOOGLE_CLIENT_ID not configured");
    }

    const url = new URL(request.url);
    const redirectUri = `${url.origin}/login/callback`;

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "online");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    const state = crypto.randomUUID();
    googleAuthUrl.searchParams.set("state", state);

    const session = await getSession(request, env);
    session.set("oauth_state", state);

    return redirect(googleAuthUrl.toString(), {
        headers: {
            "Set-Cookie": await commitSession(session, env),
        },
    });
}
