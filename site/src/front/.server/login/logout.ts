import { redirect } from "react-router";
import { getSession, destroySession } from "../panel/auth";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const session = await getSession(request, env);
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session, env),
        },
    });
}

export async function action({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const session = await getSession(request, env);
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session, env),
        },
    });
}
