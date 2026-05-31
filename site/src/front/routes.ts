import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
    index("routes/welcome.tsx"),
    route("login/google", "routes/login.google.ts", { id: "login-google" }),
    route("login/callback", "routes/login.callback.ts", { id: "login-callback" }),
    route("panel", "routes/panel.tsx", { id: "panel-index" }),
] satisfies RouteConfig;
