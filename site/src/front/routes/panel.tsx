import Panel from "../panel/panel";
import * as panelServer from "../.server/panel/panel";

export const loader = panelServer.loader;
export const action = panelServer.action;

export default function PanelRoute() {
    return <Panel />;
}