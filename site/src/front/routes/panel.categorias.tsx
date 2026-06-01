import Categorias from "../panel/categorias";
import * as server from "../.server/panel/categorias";

export const loader = server.loader;
export const action = server.action;

export default function CategoriasRoute() {
    return <Categorias />;
}
