import AlunoView from "../aluno/aluno";
import * as server from "../.server/aluno/aluno";

export const loader = server.loader;

export default function AlunoRoute() {
    return <AlunoView />;
}
