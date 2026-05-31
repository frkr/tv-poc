import React from "react";
import { useLoaderData } from "react-router";

function formatDate(timestamp: string | number) {
    return new Date(timestamp).toLocaleString();
}

export default function Panel() {
    // A interface do que o loader retorna deve ser inferida ou tipada aqui
    const data = useLoaderData() as { isAdmin: boolean, user: any, version: any };

    const { isAdmin, user, version } = data;

    if (!isAdmin) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
                <p className="text-gray-700">Somente administradores podem publicar canais e cursos.</p>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Painel de Administração</h1>
                    {version?.timestamp && (
                        <span className="text-gray-400 normal-case text-sm" title={version.id}>
                            Version: {version?.tag && 'v' + version.tag + ' '}{formatDate(version.timestamp)}
                        </span>
                    )}
                </div>
                <p className="mb-8 text-gray-600">Bem-vindo. Aqui você pode gerenciar a publicação de canais e cursos.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-6 rounded-lg hover:shadow-md transition">
                        <h2 className="text-xl font-semibold mb-4">Canais</h2>
                        <p className="mb-4 text-gray-600 text-sm">Adicione e gerencie os canais disponíveis no sistema.</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                            Publicar Canal
                        </button>
                    </div>

                    <div className="border p-6 rounded-lg hover:shadow-md transition">
                        <h2 className="text-xl font-semibold mb-4">Cursos</h2>
                        <p className="mb-4 text-gray-600 text-sm">Adicione e gerencie os cursos e episódios associados aos canais.</p>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                            Publicar Curso
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}