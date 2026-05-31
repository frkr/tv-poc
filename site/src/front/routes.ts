import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
    index("routes/welcome.tsx"),
    route("login/google", "routes/login.google.ts", { id: "login-google" }),
    route("login/callback", "routes/login.callback.ts", { id: "login-callback" }),
    route("login/logout", "routes/login.logout.ts", { id: "login-logout" }),
    route("aluno", "routes/aluno.tsx", { id: "aluno" }),
    route("panel", "routes/panel.tsx", [
        index("routes/panel.dashboard.tsx"),
        route("canais", "routes/panel.canais.tsx"),
        route("cursos", "routes/panel.cursos.tsx"),
        route("episodios", "routes/panel.episodios.tsx")
    ]),
] satisfies RouteConfig;
