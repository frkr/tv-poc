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
        route("episodios", "routes/panel.episodios.tsx"),
        route("categorias", "routes/panel.categorias.tsx"),
    ]),
    route("tv", "routes/login.tv.tsx", { id: "login-tv" }),
    route("api/v1/tv/home", "routes/api.v1.tv.home.ts", { id: "api-v1-tv-home" }),
    route("api/v1/tv/canais", "routes/api.v1.tv.canais.ts", { id: "api-v1-tv-canais" }),
    route("api/v1/tv/categorias", "routes/api.v1.tv.categorias.ts", { id: "api-v1-tv-categorias" }),
    route("api/v1/tv/cursos", "routes/api.v1.tv.cursos.ts", { id: "api-v1-tv-cursos" }),
    route("api/v1/tv/episodios/:id_curso", "routes/api.v1.tv.episodios.ts", { id: "api-v1-tv-episodios" }),
    route("api/v1/tv/progresso", "routes/api.v1.tv.progresso.ts", { id: "api-v1-tv-progresso" }),
] satisfies RouteConfig;
