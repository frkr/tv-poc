import { useOutletContext, useLoaderData, Link } from "react-router";

export default function Dashboard() {
    const { user } = useOutletContext<{ user: any }>();
    const { canaisTotal, cursosTotal, episodiosTotal } = useLoaderData() as { canaisTotal: number, cursosTotal: number, episodiosTotal: number };
    const avatarUrl = user?.avatar;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
            <div className="flex items-center justify-between mb-6 border-b pb-6">
                <div className="flex items-center gap-4">
                    {avatarUrl && <img src={avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-16 h-16 rounded-full shadow-md border-2 border-white" />}
                    <div>
                        <h1 className="text-3xl font-bold">Bem vindo, {user?.nome?.split(' ')[0] || 'Administrador'}!</h1>
                    </div>
                </div>
                <div>
                    <Link to="/aluno" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">
                        Visão de Aluno
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border p-6 rounded-lg bg-blue-50 text-center">
                    <h2 className="text-xl font-semibold mb-2 text-blue-800">Canais</h2>
                    <p className="text-4xl font-bold text-blue-600">{canaisTotal}</p>
                </div>
                <div className="border p-6 rounded-lg bg-green-50 text-center">
                    <h2 className="text-xl font-semibold mb-2 text-green-800">Cursos</h2>
                    <p className="text-4xl font-bold text-green-600">{cursosTotal}</p>
                </div>
                <div className="border p-6 rounded-lg bg-purple-50 text-center">
                    <h2 className="text-xl font-semibold mb-2 text-purple-800">Episódios</h2>
                    <p className="text-4xl font-bold text-purple-600">{episodiosTotal}</p>
                </div>
            </div>
        </div>
    );
}