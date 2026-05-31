import Dashboard from "../panel/dashboard";
import * as server from "../.server/panel/dashboard";

export const loader = server.loader;

export default function DashboardRoute() {
    return <Dashboard />;
}