import React from "react";
import { useLoaderData, Link } from "react-router";
import type { Canal, Curso } from "../lib/database";

export default function AlunoView() {
    const { user, canais, cursos } = useLoaderData() as { user: any, canais: Canal[], cursos: Curso[] };
    const avatarUrl = user?.avatar;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold">Visão de Aluno</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            {avatarUrl && <img src={avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full shadow-sm" />}
                            <span className="text-gray-700 font-medium">Olá, {user?.nome?.split(' ')[0]}</span>
                        </div>
                        <Link to="/panel" className="text-blue-600 hover:text-blue-800 transition">Painel</Link>
                        <Link to="/login/logout" className="text-red-600 hover:text-red-800 transition">Sair</Link>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Canais Disponíveis</h2>
                    {canais.length === 0 ? (
                        <p className="text-gray-500">Nenhum canal disponível.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {canais.map(canal => (
                                <div key={canal.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <img src={canal.thumbnail} alt={canal.nome} className="w-full h-32 object-cover bg-gray-200" />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{canal.nome}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{canal.descricao}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Cursos Disponíveis</h2>
                    {cursos.length === 0 ? (
                        <p className="text-gray-500">Nenhum curso disponível.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {cursos.map(curso => (
                                <div key={curso.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <img src={curso.thumbnail} alt={curso.nome} className="w-full h-32 object-cover bg-gray-200" />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{curso.nome}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{curso.descricao}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
