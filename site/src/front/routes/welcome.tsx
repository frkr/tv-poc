import React from "react";

export default function Welcome() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Sistema de Cursos</h1>
            
            <div className="mb-8 text-center max-w-2xl">
                <p className="text-lg text-gray-700 mb-4">
                    Assista cursos, acesse canais exclusivos e gerencie seu aprendizado.
                </p>
                <ul className="list-disc list-inside text-left mx-auto inline-block text-gray-600 mb-6">
                    <li>Acesso a múltiplos canais de conteúdo</li>
                    <li>Cursos completos com vídeos e materiais de apoio</li>
                    <li>Gerenciamento para publicadores e administradores</li>
                    <li>Acesso multiplataforma (Web e TV)</li>
                </ul>
            </div>

            <div className="flex space-x-4">
                <button 
                    onClick={() => {
                        window.location.href = "/login/google";
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Fazer Login
                </button>
            </div>
        </div>
    );
}