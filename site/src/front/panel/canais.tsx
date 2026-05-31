import React, { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import type { Canal } from "../lib/database";

export default function Canais() {
    const { canais } = useLoaderData() as { canais: Canal[] };
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [editingCanal, setEditingCanal] = useState<Canal | null>(null);

    const handleEdit = (canal: Canal) => {
        setEditingCanal(canal);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingCanal(null);
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Gerenciar Canais</h1>
            
            <Form method="post" className="mb-8 p-4 border rounded bg-gray-50" onSubmit={() => setTimeout(() => setEditingCanal(null), 100)}>
                <h2 className="text-lg font-semibold mb-4">{editingCanal ? "Editar Canal" : "Novo Canal"}</h2>
                <input type="hidden" name="intent" value={editingCanal ? "update" : "create"} />
                {editingCanal && <input type="hidden" name="id" value={editingCanal.id} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do Canal</label>
                        <input required type="text" name="nome" defaultValue={editingCanal?.nome} className="w-full p-2 border rounded" placeholder="Ex: Programação 101" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">URL da Thumbnail</label>
                        <input required type="url" name="thumbnail" defaultValue={editingCanal?.thumbnail} className="w-full p-2 border rounded" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea required name="descricao" defaultValue={editingCanal?.descricao} className="w-full p-2 border rounded" rows={3}></textarea>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button disabled={isSubmitting} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting ? "Salvando..." : (editingCanal ? "Salvar Alterações" : "Salvar Canal")}
                    </button>
                    {editingCanal && (
                        <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                            Cancelar
                        </button>
                    )}
                </div>
            </Form>

            <h2 className="text-xl font-bold mb-4">Lista de Canais</h2>
            {canais.length === 0 ? (
                <p className="text-gray-500">Nenhum canal cadastrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {canais.map((canal) => (
                        <div key={canal.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                            <img src={canal.thumbnail} alt={canal.nome} className="w-full h-40 object-cover bg-gray-200" />
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-2">{canal.nome}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{canal.descricao}</p>
                                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                                    <button 
                                        onClick={() => handleEdit(canal)}
                                        className="text-blue-600 hover:text-blue-800 transition font-medium"
                                    >
                                        Editar
                                    </button>
                                    <Form method="post" onSubmit={(e) => {
                                        if (!confirm("Deseja excluir este canal?")) e.preventDefault();
                                    }}>
                                        <input type="hidden" name="intent" value="delete" />
                                        <input type="hidden" name="id" value={canal.id} />
                                        <button type="submit" className="text-red-600 hover:text-red-800 transition font-medium">Excluir</button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}