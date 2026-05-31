import React, { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import type { Episodio, Curso } from "../lib/database";

export default function Episodios() {
    const { episodios, cursos } = useLoaderData() as { episodios: (Episodio & { curso_nome?: string })[], cursos: Curso[] };
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [editingEpisodio, setEditingEpisodio] = useState<(Episodio & { curso_nome?: string }) | null>(null);

    const handleEdit = (episodio: Episodio & { curso_nome?: string }) => {
        setEditingEpisodio(episodio);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingEpisodio(null);
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Gerenciar Episódios</h1>
            
            <Form method="post" className="mb-8 p-4 border rounded bg-gray-50" onSubmit={() => setTimeout(() => setEditingEpisodio(null), 100)}>
                <h2 className="text-lg font-semibold mb-4">{editingEpisodio ? "Editar Episódio" : "Novo Episódio"}</h2>
                <input type="hidden" name="intent" value={editingEpisodio ? "update" : "create"} />
                {editingEpisodio && <input type="hidden" name="id" value={editingEpisodio.id} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Título do Episódio</label>
                        <input required type="text" name="nome" defaultValue={editingEpisodio?.nome} className="w-full p-2 border rounded" placeholder="Ex: Aula 01 - Introdução" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Vincular a um Curso</label>
                        <select required name="id_curso" defaultValue={editingEpisodio?.id_curso} className="w-full p-2 border rounded bg-white">
                            <option value="">-- Selecione um Curso --</option>
                            {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">URL da Thumbnail</label>
                        <input required type="url" name="thumbnail" defaultValue={editingEpisodio?.thumbnail} className="w-full p-2 border rounded" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">URL do Vídeo</label>
                        <input required type="url" name="url" defaultValue={editingEpisodio?.url} className="w-full p-2 border rounded" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea required name="descricao" defaultValue={editingEpisodio?.descricao} className="w-full p-2 border rounded" rows={3}></textarea>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button disabled={isSubmitting} type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50">
                        {isSubmitting ? "Salvando..." : (editingEpisodio ? "Salvar Alterações" : "Salvar Episódio")}
                    </button>
                    {editingEpisodio && (
                        <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                            Cancelar
                        </button>
                    )}
                </div>
            </Form>

            <h2 className="text-xl font-bold mb-4">Lista de Episódios</h2>
            {episodios.length === 0 ? (
                <p className="text-gray-500">Nenhum episódio cadastrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {episodios.map((episodio) => (
                        <div key={episodio.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                            <img src={episodio.thumbnail} alt={episodio.nome} className="w-full h-40 object-cover bg-gray-200" />
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-1">{episodio.nome}</h3>
                                <p className="text-xs text-purple-600 font-medium mb-2 uppercase tracking-wide">Curso: {episodio.curso_nome}</p>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{episodio.descricao}</p>
                                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                                    <button 
                                        onClick={() => handleEdit(episodio)}
                                        className="text-blue-600 hover:text-blue-800 transition font-medium"
                                    >
                                        Editar
                                    </button>
                                    <Form method="post" onSubmit={(e) => {
                                        if (!confirm("Deseja excluir este episódio?")) e.preventDefault();
                                    }}>
                                        <input type="hidden" name="intent" value="delete" />
                                        <input type="hidden" name="id" value={episodio.id} />
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