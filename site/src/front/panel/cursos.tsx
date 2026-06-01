import React, { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import type { Curso, Canal, Categoria } from "../lib/database";

export default function Cursos() {
    const { cursos, canais, categorias } = useLoaderData() as { cursos: Curso[], canais: Canal[], categorias: Categoria[] };
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

    const handleEdit = (curso: Curso) => {
        setEditingCurso(curso);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => setEditingCurso(null);

    const toDateInput = (ts?: number | null) => {
        if (!ts) return "";
        return new Date(ts).toISOString().slice(0, 10);
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Gerenciar Cursos</h1>

            <Form method="post" className="mb-8 p-4 border rounded bg-gray-50" onSubmit={() => setTimeout(() => setEditingCurso(null), 100)}>
                <h2 className="text-lg font-semibold mb-4">{editingCurso ? "Editar Curso" : "Novo Curso"}</h2>
                <input type="hidden" name="intent" value={editingCurso ? "update" : "create"} />
                {editingCurso && <input type="hidden" name="id" value={editingCurso.id} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do Curso</label>
                        <input required type="text" name="nome" defaultValue={editingCurso?.nome} key={editingCurso?.id ?? "new"} className="w-full p-2 border rounded" placeholder="Ex: Aprenda React" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">URL da Thumbnail</label>
                        <input required type="url" name="thumbnail" defaultValue={editingCurso?.thumbnail} key={`thumb-${editingCurso?.id ?? "new"}`} className="w-full p-2 border rounded" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data de Publicação</label>
                        <input type="date" name="data_publicacao" defaultValue={toDateInput(editingCurso?.data_publicacao)} key={`dp-${editingCurso?.id ?? "new"}`} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <select required name="id_categoria" defaultValue={editingCurso?.id_categoria || ""} key={`cat-${editingCurso?.id ?? "new"}`} className="w-full p-2 border rounded bg-white">
                            <option value="">-- Selecione uma Categoria --</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.categoria}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Vincular a um Canal (Opcional)</label>
                        <select name="id_canal" defaultValue={editingCurso?.id_canal || ""} key={`canal-${editingCurso?.id ?? "new"}`} className="w-full p-2 border rounded bg-white">
                            <option value="">-- Selecione um Canal --</option>
                            {canais.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea required name="descricao" defaultValue={editingCurso?.descricao} key={`desc-${editingCurso?.id ?? "new"}`} className="w-full p-2 border rounded" rows={3}></textarea>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button disabled={isSubmitting} type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                        {isSubmitting ? "Salvando..." : (editingCurso ? "Salvar Alterações" : "Salvar Curso")}
                    </button>
                    {editingCurso && (
                        <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                            Cancelar
                        </button>
                    )}
                </div>
            </Form>

            <h2 className="text-xl font-bold mb-4">Lista de Cursos</h2>
            {cursos.length === 0 ? (
                <p className="text-gray-500">Nenhum curso cadastrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cursos.map((curso) => (
                        <div key={curso.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
                            <img src={curso.thumbnail} alt={curso.nome} className="w-full h-40 object-cover bg-gray-200" />
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-2">{curso.nome}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{curso.descricao}</p>
                                {curso.data_publicacao && (
                                    <p className="text-xs text-gray-400 mb-2">Publicado: {new Date(curso.data_publicacao).toLocaleDateString('pt-BR')}</p>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                                    <button onClick={() => handleEdit(curso)} className="text-blue-600 hover:text-blue-800 transition font-medium">
                                        Editar
                                    </button>
                                    <Form method="post" onSubmit={(e) => {
                                        if (!confirm("Deseja excluir este curso?")) e.preventDefault();
                                    }}>
                                        <input type="hidden" name="intent" value="delete" />
                                        <input type="hidden" name="id" value={curso.id} />
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
