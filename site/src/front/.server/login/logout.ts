import { redirect } from "react-router";
import { getSession, destroySession } from "../panel/auth";

export async function loader({ request }: { request: Request }) {
    const session = await getSession(request);
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}

export async function action({ request }: { request: Request }) {
    const session = await getSession(request);
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}
