import React from "react";
import { useLoaderData, Outlet, Link, useLocation } from "react-router";

function formatDate(timestamp: string | number) {
    return new Date(timestamp).toLocaleString();
}

export default function Panel() {
    const data = useLoaderData() as { isAdmin: boolean, user: any, version: any };
    const location = useLocation();

    const { isAdmin, user, version } = data;

    if (!isAdmin) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
                <p className="text-gray-700">Somente administradores podem acessar o painel.</p>
            </div>
        );
    }

    // Avatar do Google
    const avatarUrl = user?.avatar;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r p-4 flex flex-col">
                <div className="mb-6">
                    <h2 className="text-xl font-bold">Administração</h2>
                    {version?.timestamp && (
                        <span className="text-xs text-gray-400 block mt-1" title={version.id}>
                            v{version.tag || 'dev'} - {formatDate(version.timestamp)}
                        </span>
                    )}
                </div>
                <nav className="space-y-2 flex-1">
                    <Link to="/panel" className={`block px-4 py-2 rounded ${location.pathname === '/panel' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Dashboard</Link>
                    <Link to="/panel/canais" className={`block px-4 py-2 rounded ${location.pathname.includes('/panel/canais') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Canais</Link>
                    <Link to="/panel/cursos" className={`block px-4 py-2 rounded ${location.pathname.includes('/panel/cursos') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Cursos</Link>
                    <Link to="/panel/episodios" className={`block px-4 py-2 rounded ${location.pathname.includes('/panel/episodios') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Episódios</Link>
                </nav>
                <div className="mt-auto pt-4 border-t flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {avatarUrl && <img src={avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full shadow-sm flex-shrink-0" />}
                        <span className="text-gray-700 font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={user?.nome}>
                            Olá, {user?.nome?.split(' ')[0]}
                        </span>
                    </div>
                    <Link to="/login/logout" className="text-sm font-medium text-red-600 hover:text-red-800 transition flex-shrink-0" title="Sair">Sair</Link>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-auto">
                <Outlet context={{ user }} />
            </main>
        </div>
    );
}