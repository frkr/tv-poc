import Cursos from "../panel/cursos";
import * as server from "../.server/panel/cursos";

export const loader = server.loader;
export const action = server.action;

export default function CursosRoute() {
    return <Cursos />;
}