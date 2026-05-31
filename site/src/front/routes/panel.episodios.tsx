import Episodios from "../panel/episodios";
import * as server from "../.server/panel/episodios";

export const loader = server.loader;
export const action = server.action;

export default function EpisodiosRoute() {
    return <Episodios />;
}