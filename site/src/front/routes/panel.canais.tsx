import Canais from "../panel/canais";
import * as server from "../.server/panel/canais";

export const loader = server.loader;
export const action = server.action;

export default function CanaisRoute() {
    return <Canais />;
}